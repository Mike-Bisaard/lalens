import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/cron/release-reservations
// Called every minute by pg_cron or external cron service (cron-job.org)
// Protected by CRON_SECRET to prevent abuse
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = adminClient()
  const { error } = await supabase.rpc('release_expired_reservations')

  if (error) {
    console.error('[cron] release_expired_reservations failed:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, ran_at: new Date().toISOString() })
}
