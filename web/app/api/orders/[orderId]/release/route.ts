import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Receiver } from '@upstash/qstash'
import { sendCardAvailableEmail } from '@/lib/email'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/orders/[orderId]/release
// Called by QStash exactly at order's expires_at.
// Verifies QStash signature to reject spoofed requests.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params

  // Verify the request is genuinely from QStash
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  })

  const body = await req.text()
  const signature = req.headers.get('upstash-signature') ?? ''

  const isValid = await receiver.verify({ signature, body }).catch(() => false)
  if (!isValid) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  const supabase = adminClient()

  // Fetch the order — only release if still pending (idempotent: skip if already cancelled/paid)
  const { data: order } = await supabase
    .from('orders')
    .select('id, status, expires_at, order_items(card_id)')
    .eq('id', orderId)
    .single()

  if (!order) {
    return NextResponse.json({ ok: true, skipped: 'order_not_found' })
  }

  if (!['pending_payment', 'verifying'].includes(order.status)) {
    // Already paid or already cancelled — nothing to do
    return NextResponse.json({ ok: true, skipped: `status_is_${order.status}` })
  }

  // Release the cards
  const cardIds = (order.order_items as { card_id: string }[]).map(i => i.card_id)

  await supabase
    .from('cards')
    .update({ status: 'available' })
    .in('id', cardIds)
    .eq('status', 'reserved')

  await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)

  // Notify waitlist subscribers (fire-and-forget)
  if (cardIds.length > 0) {
    notifyWaitlist(supabase, cardIds).catch(err =>
      console.error('[release] waitlist notify failed:', err)
    )
  }

  console.log(`[release] order ${orderId} released (${cardIds.length} cards)`)
  return NextResponse.json({ ok: true, released: cardIds.length })
}

async function notifyWaitlist(
  supabase: ReturnType<typeof adminClient>,
  cardIds: string[]
) {
  const { data: entries } = await supabase
    .from('card_waitlist')
    .select('id, email, card_id, cards(name, price, shops(name, slug))')
    .in('card_id', cardIds)
    .is('notified_at', null)

  if (!entries?.length) return

  type WaitlistEntry = {
    id: string
    email: string
    card_id: string
    cards: { name: string; price: number; shops: { name: string; slug: string } | null } | null
  }

  const notifiedIds: string[] = []
  for (const entry of entries as unknown as WaitlistEntry[]) {
    const card = entry.cards
    const shop = card?.shops
    if (!card || !shop) continue
    try {
      await sendCardAvailableEmail({
        email: entry.email,
        cardName: card.name || 'การ์ด Pokemon',
        cardId: entry.card_id,
        shopSlug: shop.slug,
        shopName: shop.name,
        price: card.price,
      })
      notifiedIds.push(entry.id)
    } catch (err) {
      console.error('[release] waitlist email failed for', entry.email, err)
    }
  }

  if (notifiedIds.length > 0) {
    await supabase
      .from('card_waitlist')
      .update({ notified_at: new Date().toISOString() })
      .in('id', notifiedIds)
  }
}
