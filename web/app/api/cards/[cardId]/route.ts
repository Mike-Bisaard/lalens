import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Only delete if available (not reserved or sold — business rule #5)
  const { error } = await supabase
    .from('cards')
    .update({ status: 'removed' })
    .eq('id', cardId)
    .eq('status', 'available')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const updates: Record<string, unknown> = {}

  if (body.name !== undefined) updates.name = body.name
  if (body.condition !== undefined) updates.condition = body.condition
  if (body.price !== undefined) {
    const p = parseInt(body.price, 10)
    if (isNaN(p) || p < 0) return NextResponse.json({ error: 'invalid_price' }, { status: 400 })
    updates.price = p
  }
  if (body.quantity !== undefined) {
    const q = parseInt(body.quantity)
    if (isNaN(q) || q < 1) return NextResponse.json({ error: 'invalid_quantity' }, { status: 400 })
    updates.quantity = q
  }

  if (!Object.keys(updates).length) return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 })

  // RLS blocks updating reserved/sold cards (cards_owner_all policy)
  const { error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .eq('status', 'available')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
