import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const ids: unknown = body.ids
  if (!Array.isArray(ids) || !ids.length) {
    return NextResponse.json({ error: 'no_ids' }, { status: 400 })
  }
  if (ids.length > 200) {
    return NextResponse.json({ error: 'too_many_ids' }, { status: 400 })
  }

  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!shop) return NextResponse.json({ error: 'no_shop' }, { status: 400 })

  // Only mark available cards as removed — reserved/sold are untouched (business rule #5)
  const { error } = await supabase
    .from('cards')
    .update({ status: 'removed' })
    .in('id', ids as string[])
    .eq('shop_id', shop.id)
    .eq('status', 'available')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
