import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // RLS ensures only shop owner can update their own cards
  const { error } = await supabase
    .from('cards')
    .update({ status: 'sold' })
    .eq('id', cardId)
    .eq('status', 'available')  // ห้ามเปลี่ยนสถานะจาก reserved หรือ sold

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
