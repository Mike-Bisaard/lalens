import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashSidebar } from './DashSidebar'
import { cn } from '@/lib/utils'
import { getAuthenticatedShop } from '@/lib/getShop'

const KAN: React.CSSProperties = { fontFamily: '"Kanit", sans-serif' }

interface DashboardLayoutProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export async function DashboardLayout({ title = 'ภาพรวมร้าน', subtitle, children, className }: DashboardLayoutProps) {
  // Uses React cache() — if the page already called getAuthenticatedShop(), no extra DB round trip
  const auth = await getAuthenticatedShop()
  if (!auth) redirect('/login')
  const { shop, supabase } = auth

  // Count pending-ship orders for this shop only
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop.id)
    .eq('status', 'paid')

  const shopName = shop.name
  const shopSlug = shop.slug
  const pendingOrders = count ?? 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#faf7f2', fontFamily: '"Anuphan", sans-serif' }}>
      <DashSidebar shopName={shopName} shopSlug={shopSlug} pendingOrders={pendingOrders} />

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header style={{ background: '#faf7f2', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1.5px solid #ededf0', position: 'sticky', top: 0, zIndex: 10 }}>
          {/* Title */}
          <div style={{ flex: 1 }}>
            <h1 style={{ ...KAN, fontWeight: 700, fontSize: 20, color: '#1c1b24', margin: 0, lineHeight: 1.2 }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 13, color: '#6b6a76', margin: 0, marginTop: 1 }}>{subtitle}</p>}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: 220 }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              placeholder="ค้นหาการ์ดในร้าน..."
              style={{ width: '100%', height: 38, borderRadius: 10, border: '1.5px solid #ededf0', background: '#fff', padding: '0 12px 0 32px', fontSize: 13.5, color: '#1c1b24', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Bell */}
          <button style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #ededf0', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#6b6a76', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          {/* CTA */}
          <Link href="/dashboard/listings/new" style={{
            ...KAN, fontWeight: 600, fontSize: 14.5, color: '#fff', background: '#ee1c25',
            padding: '0 18px', height: 38, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 7,
            textDecoration: 'none', boxShadow: '0 3px 0 #c0141b', flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            ลงขายเพิ่ม
          </Link>
        </header>

        {/* Content */}
        <main className={cn('flex-1', className)} style={{ padding: '24px 28px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
