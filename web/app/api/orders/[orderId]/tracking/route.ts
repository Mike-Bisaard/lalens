import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const formData = await req.formData()
  const trackingNumber = (formData.get('tracking_number') as string)?.trim()
  if (!trackingNumber) return NextResponse.redirect(new URL('/dashboard/orders', req.url))

  // Verify the order belongs to this seller's shop
  const { data: order } = await supabase
    .from('orders')
    .select('id, status, shops!inner(owner_id)')
    .eq('id', orderId)
    .single()

  const shopOwner = Array.isArray(order?.shops) ? order.shops[0] : order?.shops
  if (!order || (shopOwner as { owner_id: string } | null)?.owner_id !== user.id) {
    return NextResponse.redirect(new URL('/dashboard/orders', req.url))
  }

  await supabase
    .from('orders')
    .update({ tracking_number: trackingNumber, status: 'shipped' })
    .eq('id', orderId)
    .in('status', ['paid', 'shipped'])

  return NextResponse.redirect(new URL('/dashboard/orders', req.url))
}
