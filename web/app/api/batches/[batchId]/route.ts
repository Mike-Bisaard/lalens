import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/batches/[batchId]  — toggle is_active (hide/unhide)
// DELETE /api/batches/[batchId] — soft delete (sets deleted_at, hides from all views)

async function verifyOwnership(batchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'unauthorized', status: 401, supabase, user: null, batch: null }

  const { data: batch } = await supabase
    .from('batch_uploads')
    .select('id, is_active, deleted_at, shop_id, shops!inner(owner_id)')
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

  // Soft delete: set deleted_at timestamp instead of actually deleting
  // Preserves sold card records and their order history
  const { error: deleteError } = await supabase
    .from('batch_uploads')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', batchId)

  // Also soft-delete non-sold cards in this batch
  await supabase
    .from('cards')
    .update({ status: 'removed' })
    .eq('batch_id', batchId)
    .neq('status', 'sold')

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
