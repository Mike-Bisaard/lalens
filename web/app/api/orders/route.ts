import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendNewOrderEmail, sendOrderConfirmationEmail } from '@/lib/email'
import { scheduleOrderRelease } from '@/lib/qstash'

// Use admin client (bypasses RLS + has full GRANT) for all order operations
function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/orders — create order + lock cards (reserve_cards)
export async function POST(req: NextRequest) {
  const { cardIds, buyerEmail } = await req.json()

  if (!cardIds?.length || !buyerEmail) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const supabase = adminClient()

  // Fetch cards — verify all available
  const { data: cards, error: cardError } = await supabase
    .from('cards')
    .select('id, price, shop_id, status')
    .in('id', cardIds)

  if (cardError || !cards?.length) {
    return NextResponse.json({ error: 'cards_not_found', detail: cardError?.message }, { status: 404 })
  }

  // All cards must be from same shop
  const shopIds = [...new Set(cards.map((c: { shop_id: string }) => c.shop_id))]
  if (shopIds.length > 1) {
    return NextResponse.json({ error: 'multiple_shops' }, { status: 400 })
  }

  const shopId = shopIds[0]
  const totalAmount = cards.reduce((sum: number, c: { price: number }) => sum + c.price, 0)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ shop_id: shopId, buyer_email: buyerEmail, total_amount: totalAmount, status: 'pending_payment' })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'order_create_failed', detail: orderError?.message }, { status: 500 })
  }

  // Insert order items (price snapshot = price at checkout)
  const { error: itemsError } = await supabase.from('order_items').insert(
    cards.map((c: { id: string; price: number }) => ({
      order_id: order.id,
      card_id: c.id,
      price_snapshot: c.price,
    }))
  )

  if (itemsError) {
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
    return NextResponse.json({ error: 'order_items_failed', detail: itemsError.message }, { status: 500 })
  }

  // Atomically reserve cards — returns false if any card already taken
  const { data: reserved } = await supabase.rpc('reserve_cards', {
    p_card_ids: cardIds,
    p_order_id: order.id,
    p_expires_at: expiresAt,
  })

  if (!reserved) {
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
    return NextResponse.json({ error: 'cards_unavailable' }, { status: 409 })
  }

  // Schedule QStash to release this order at exactly expires_at (fire-and-forget)
  scheduleOrderRelease(order.id, new Date(expiresAt)).catch(err =>
    console.error('[orders] QStash schedule failed:', err)
  )

  // Send emails (fire-and-forget — don't block the response)
  const { data: shop } = await supabase
    .from('shops')
    .select('name, owner_id')
    .eq('id', shopId)
    .single()

  if (shop) {
    const { data: ownerData } = await supabase.auth.admin.getUserById(shop.owner_id)
    const sellerEmail = ownerData?.user?.email
    const emailOpts = {
      shopName: shop.name,
      orderId: order.id,
      buyerEmail,
      totalAmount,
      itemCount: cards.length,
    }
    Promise.all([
      sellerEmail
        ? sendNewOrderEmail({ sellerEmail, ...emailOpts }).catch(e => console.error('[email] seller:', e.message))
        : null,
      sendOrderConfirmationEmail({ ...emailOpts, expiresAt }).catch(e => console.error('[email] buyer:', e.message)),
    ])
  }

  return NextResponse.json({ orderId: order.id, expiresAt, totalAmount })
}
