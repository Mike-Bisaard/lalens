import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendCardAvailableEmail } from '@/lib/email'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/cron/release-reservations
// Called every minute by Vercel Cron (vercel.json) or external cron (cron-job.org)
// Vercel sends Authorization: Bearer ${CRON_SECRET} automatically
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const querySecret = req.nextUrl.searchParams.get('secret')
  const secret = bearerSecret ?? querySecret

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = adminClient()

  // 1. Find all expired pending_payment orders and their card IDs BEFORE releasing
  //    so we know which waitlist entries to notify
  const { data: expiredOrders } = await supabase
    .from('orders')
    .select('id, order_items(card_id)')
    .eq('status', 'pending_payment')
    .lt('expires_at', new Date().toISOString())

  const releasedCardIds: string[] = (expiredOrders ?? [])
    .flatMap((o: { order_items: { card_id: string }[] }) => o.order_items.map(i => i.card_id))

  // 2. Release reservations via stored procedure
  const { error } = await supabase.rpc('release_expired_reservations')

  if (error) {
    console.error('[cron] release_expired_reservations failed:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  // 3. If any cards were released, notify waitlist subscribers (fire-and-forget)
  if (releasedCardIds.length > 0) {
    notifyWaitlist(supabase, releasedCardIds).catch(err =>
      console.error('[cron] waitlist notify failed:', err)
    )
  }

  return NextResponse.json({ ok: true, ran_at: new Date().toISOString(), released: releasedCardIds.length })
}

async function notifyWaitlist(
  supabase: ReturnType<typeof adminClient>,
  cardIds: string[]
) {
  // Get waitlist entries for these cards (unnotified only)
  const { data: entries } = await supabase
    .from('card_waitlist')
    .select('id, email, card_id, cards(name, price, shop_id, shops(name, slug))')
    .in('card_id', cardIds)
    .is('notified_at', null)

  if (!entries?.length) return

  const notifiedIds: string[] = []

  type WaitlistEntry = {
    id: string
    email: string
    card_id: string
    cards: { name: string; price: number; shop_id: string; shops: { name: string; slug: string } | null } | null
  }
  for (const entry of (entries as unknown as WaitlistEntry[])) {
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
      console.error('[cron] failed to send waitlist email to', entry.email, err)
    }
  }

  if (notifiedIds.length > 0) {
    await supabase
      .from('card_waitlist')
      .update({ notified_at: new Date().toISOString() })
      .in('id', notifiedIds)
  }
}
