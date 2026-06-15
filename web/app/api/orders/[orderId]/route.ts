import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { tracking_number?: string; status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { tracking_number, status } = body

  if (tracking_number === undefined && status === undefined) {
    return NextResponse.json({ ok: false, error: 'No fields to update' }, { status: 400 })
  }

  // Verify the order belongs to this seller's shop
  const { data: order } = await supabase
    .from('orders')
    .select('id, status, shops!inner(owner_id)')
    .eq('id', orderId)
    .single()

  const shopOwner = Array.isArray(order?.shops) ? order.shops[0] : order?.shops
  if (!order || (shopOwner as { owner_id: string } | null)?.owner_id !== user.id) {
    return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 })
  }

  if (tracking_number !== undefined) {
    // Update tracking number and set status to 'shipped' if currently 'paid'
    const updates: { tracking_number: string; status?: string } = {
      tracking_number: tracking_number.trim(),
    }
    if (order.status === 'paid') {
      updates.status = 'shipped'
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  if (status === 'completed') {
    // Only allow completing an order that is currently 'shipped'
    if (order.status !== 'shipped') {
      return NextResponse.json(
        { ok: false, error: 'Order must be shipped before marking as completed' },
        { status: 422 }
      )
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false, error: 'Invalid status value' }, { status: 400 })
}
