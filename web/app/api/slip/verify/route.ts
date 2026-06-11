import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { verifySlip } from '@/lib/slip'
import { sendOrderPaidEmail, sendPaymentVerifiedEmail } from '@/lib/email'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const { orderId, slipUrl } = await req.json()
  if (!orderId || !slipUrl) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const supabase = adminClient()

  // Fetch order + shop bank account
  const { data: order } = await supabase
    .from('orders')
    .select('*, shops(bank_account_encrypted, bank_name)')
    .eq('id', orderId)
    .single()

  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 })

  // Guard: already paid
  if (order.status !== 'pending_payment') {
    return NextResponse.json({ error: 'order_not_payable' }, { status: 400 })
  }

  // Guard: timer must be checked from slip_submitted_at (not verification time)
  const submittedAt = order.slip_submitted_at
    ? new Date(order.slip_submitted_at)
    : new Date()

  if (order.expires_at && new Date() > new Date(order.expires_at)) {
    return NextResponse.json({ error: 'order_expired' }, { status: 410 })
  }

  // Mark slip_submitted_at on first submit (timer anchor)
  if (!order.slip_submitted_at) {
    await supabase
      .from('orders')
      .update({ slip_submitted_at: new Date().toISOString(), slip_url: slipUrl, status: 'verifying' })
      .eq('id', orderId)
  }

  // Verify slip
  const result = await verifySlip(
    slipUrl,
    order.total_amount / 100,            // satang → baht
    order.shops.bank_account_encrypted   // plain-text account stored in DB
  )

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 200 })
  }

  // Check for duplicate slip
  const { data: existing } = await supabase
    .from('slip_transactions')
    .select('id')
    .eq('transaction_ref', result.transaction_ref!)
    .single()

  if (existing) {
    return NextResponse.json({ success: false, error: 'duplicate_slip' }, { status: 200 })
  }

  // All checks passed — mark paid + cut stock
  await supabase.rpc('release_expired_reservations') // clean up others first

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('card_id')
    .eq('order_id', orderId)

  const cardIds = (orderItems ?? []).map(i => i.card_id)

  await Promise.all([
    supabase.from('cards').update({ status: 'sold' }).in('id', cardIds),
    supabase.from('orders').update({
      status: 'paid',
      slip_verified_at: new Date().toISOString(),
    }).eq('id', orderId),
    supabase.from('slip_transactions').insert({
      transaction_ref: result.transaction_ref,
      order_id: orderId,
      amount: order.total_amount,
    }),
  ])

  // Send emails (fire-and-forget)
  const { data: shopData } = await supabase
    .from('shops')
    .select('name, owner_id')
    .eq('id', order.shop_id)
    .single()

  if (shopData) {
    const { data: ownerData } = await supabase.auth.admin.getUserById(shopData.owner_id)
    const sellerEmail = ownerData?.user?.email
    const emailOpts = {
      shopName: shopData.name,
      orderId,
      buyerEmail: order.buyer_email,
      totalAmount: order.total_amount,
      itemCount: cardIds.length,
    }
    Promise.all([
      sellerEmail
        ? sendOrderPaidEmail({ sellerEmail, ...emailOpts }).catch(e => console.error('[email] seller paid:', e.message))
        : null,
      sendPaymentVerifiedEmail({ buyerEmail: order.buyer_email, shopName: shopData.name, orderId, totalAmount: order.total_amount })
        .catch(e => console.error('[email] buyer paid:', e.message)),
    ])
  }

  return NextResponse.json({ success: true, orderId })
}
