import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const alt = 'ร้านการ์ดสะสม'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ shopSlug: string }>
}

export default async function Image({ params }: Props) {
  const { shopSlug } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, description, avatar_url, slug')
    .eq('slug', shopSlug)
    .single()

  const { count } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop?.id ?? '')
    .eq('status', 'available')

  const shopName = shop?.name ?? 'ร้านการ์ด'
  const cardCount = count ?? 0
  const rawDesc = shop?.description || `มีการ์ดว่างอยู่ ${cardCount} ใบ`
  const description = rawDesc.length > 80 ? rawDesc.slice(0, 80) + '…' : rawDesc
  const cardLabel = cardCount > 0 ? `${cardCount} ใบว่าง` : 'ดูการ์ดทั้งหมด'
  const initial = shopName.charAt(0).toUpperCase()

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background glows */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(162,28,175,0.2) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Main content column */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          width: '100%',
          position: 'relative',
        }}>
          {/* Brand row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#a855f7' }}>Lalens</div>
            <div style={{ width: '1px', height: '24px', background: '#3f3f46' }} />
            <div style={{ fontSize: '20px', color: '#71717a' }}>ตลาดการ์ดสะสม</div>
          </div>

          {/* Shop identity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {shop?.avatar_url ? (
                <img
                  src={shop.avatar_url}
                  width={96} height={96}
                  style={{ borderRadius: '50%', border: '3px solid #7c3aed' }}
                />
              ) : (
                <div style={{
                  width: '96px', height: '96px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a21caf)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '40px', color: '#fff', fontWeight: 700,
                }}>
                  {initial}
                </div>
              )}
              <div style={{ fontSize: '56px', fontWeight: 800, color: '#f4f4f5', lineHeight: 1.1 }}>
                {shopName}
              </div>
            </div>
            <div style={{ fontSize: '26px', color: '#a1a1aa', maxWidth: '800px', lineHeight: 1.4 }}>
              {description}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(124,58,237,0.4)',
              borderRadius: '999px', padding: '12px 28px',
            }}>
              <div style={{ fontSize: '32px', display: 'flex' }}>🃏</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#c4b5fd' }}>
                {cardLabel}
              </div>
            </div>
            <div style={{ fontSize: '22px', color: '#52525b' }}>
              {`lalens.com/${shopSlug}`}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
