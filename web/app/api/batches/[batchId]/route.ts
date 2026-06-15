import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/batches/[batchId]  — toggle is_active (hide/unhide)
// DELETE /api/batches/[batchId] — permanently delete batch + cards

async function verifyOwnership(batchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'unauthorized', status: 401, supabase, user: null, batch: null }

  const { data: batch } = await supabase
    .from('batch_uploads')
    .select('id, is_active, shop_id, shops!inner(owner_id)')
    .eq('id', batchId)
    .single()

  const shopOwner = Array.isArray(batch?.shops) ? batch.shops[0] : batch?.shops
  if (!batch || (shopOwner as { owner_id: string } | null)?.owner_id !== user.id) {
    return { error: 'not_found', status: 404, supabase, user, batch: null }
  }

  return { error: null, status: 200, supabase, user, batch }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { batchId } = await params
  const { error, status, supabase, batch } = await verifyOwnership(batchId)
  if (error || !batch) return NextResponse.json({ error }, { status })

  const newActive = !batch.is_active
  const { error: updateError } = await supabase
    .from('batch_uploads')
    .update({ is_active: newActive })
    .eq('id', batchId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json({ ok: true, is_active: newActive })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { batchId } = await params
  const { error, status, supabase, batch } = await verifyOwnership(batchId)
  if (error || !batch) return NextResponse.json({ error }, { status })

  // Only allow deleting batches with no sold cards
  const { count } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('batch_id', batchId)
    .eq('status', 'sold')

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: 'has_sold_cards', message: 'ไม่สามารถลบโพสต์ที่มีการ์ดขายไปแล้วได้' },
      { status: 422 }
    )
  }

  // Remove cards first (cascade should handle it but be explicit)
  await supabase.from('cards').delete().eq('batch_id', batchId)
  const { error: deleteError } = await supabase.from('batch_uploads').delete().eq('id', batchId)

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
