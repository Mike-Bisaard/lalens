import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/cards/[cardId]/waitlist
// Body: { email: string }
// Adds email to waitlist for when this card becomes available again
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params
  const { email } = await req.json().catch(() => ({}))

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const supabase = adminClient()

  // Verify card exists and is currently reserved (not already available/sold)
  const { data: card } = await supabase
    .from('cards')
    .select('id, status')
    .eq('id', cardId)
    .maybeSingle()

  if (!card) {
    return NextResponse.json({ error: 'card_not_found' }, { status: 404 })
  }

  if (card.status === 'available') {
    return NextResponse.json({ error: 'card_already_available' }, { status: 409 })
  }

  if (card.status === 'sold') {
    return NextResponse.json({ error: 'card_sold' }, { status: 409 })
  }

  // Upsert — ignore duplicate (same card + email)
  const { error } = await supabase
    .from('card_waitlist')
    .upsert({ card_id: cardId, email }, { onConflict: 'card_id,email', ignoreDuplicates: true })

  if (error) {
    console.error('[waitlist] insert error:', error.message)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
