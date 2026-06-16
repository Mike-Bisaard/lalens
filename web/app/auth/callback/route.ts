import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // ถ้า next จะพาไปตั้งร้าน ให้เช็คก่อนว่ามีร้านแล้วหรือเปล่า
    // กรณี Google login ซ้ำ ไม่ควรให้ตั้งร้านใหม่
    if (next === '/dashboard/setup') {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle()

        if (shop) {
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
