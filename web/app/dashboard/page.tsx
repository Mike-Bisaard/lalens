export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { SalesChart } from '@/components/ui/SalesChart'
import { getAuthenticatedShop } from '@/lib/getShop'

const KAN: React.CSSProperties = { fontFamily: '"Kanit", sans-serif' }
const ANU: React.CSSProperties = { fontFamily: '"Anuphan", sans-serif' }

const COND_LABEL: Record<string, string> = { NM:'Near Mint', LP:'Lightly Played', MP:'Moderately Played', HP:'Heavily Played', DMG:'Damaged' }
const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  available: { bg: '#e8f9ef', color: '#2e9e4f', label: 'กำลังขาย' },
  reserved:  { bg: '#fff8d8', color: '#b47a00', label: 'ถูกจอง'   },
  sold:      { bg: '#ededf0', color: '#6b6a76', label: 'ขายแล้ว'  },
  removed:   { bg: '#ededf0', color: '#6b6a76', label: 'ลบแล้ว'   },
}

// ── Card thumbnail (colored gradient placeholder) ─────────────
const CARD_COLORS = ['#ee1c25','#2a75bb','#2e9e4f','#7c3aed','#ff7a45','#d48806','#e879a0']
function cardColor(name: string) { return CARD_COLORS[name.charCodeAt(0) % CARD_COLORS.length] }

function CardThumb({ url, name, size = 40 }: { url?: string|null; name: string; size?: number }) {
  const bg = cardColor(name)
  if (url) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} style={{ width: size, height: size * 1.4, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}/>
  )
  return (
    <div style={{ width: size, height: size * 1.4, borderRadius: 6, background: `linear-gradient(135deg, ${bg}cc, ${bg})`, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.5 4.5 5.5v6c0 5 3.5 8 7.5 9.5 4-1.5 7.5-4.5 7.5-9.5v-6L12 2.5Z"/>
      </svg>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string|number; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #ededf0', borderRadius: 14, padding: '18px 20px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0, display: 'block' }}/>
        <span style={{ fontSize: 13, color: '#6b6a76', ...ANU }}>{label}</span>
      </div>
      <div style={{ ...KAN, fontWeight: 700, fontSize: 26, color: '#1c1b24', lineHeight: 1 }}>{value}</div>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────
function SectionHeader({ title, sub, linkHref, linkLabel }: { title: string; sub?: string; linkHref?: string; linkLabel?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
      <h2 style={{ ...KAN, fontWeight: 700, fontSize: 17, color: '#1c1b24', margin: 0 }}>{title}</h2>
      {sub && <span style={{ fontSize: 13, color: '#6b6a76', ...ANU }}>{sub}</span>}
      {linkHref && (
        <Link href={linkHref} style={{ marginLeft: 'auto', fontSize: 13, color: '#ee1c25', fontWeight: 600, ...KAN, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}

// ── Table shell ───────────────────────────────────────────────
function Table({ cols, children }: { cols: string[]; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #ededf0', borderRadius: 14, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', ...ANU }}>
        <thead>
          <tr style={{ background: '#faf7f2', borderBottom: '1.5px solid #ededf0' }}>
            {cols.map(c => (
              <th key={c} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12.5, fontWeight: 600, color: '#6b6a76', whiteSpace: 'nowrap' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Tr({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <tr style={{ borderBottom: last ? 'none' : '1px solid #f0eee9' }}>
      {children}
    </tr>
  )
}
function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <td style={{ padding: '13px 16px', fontSize: 13.5, color: muted ? '#6b6a76' : '#1c1b24', verticalAlign: 'middle' }}>{children}</td>
}

// ── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const same = d.toDateString() === now.toDateString()
  const t = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  return same ? `วันนี้ ${t}` : d.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }) + ` ${t}`
}
function fmtB(n: number) { return `฿${n.toLocaleString('th-TH')}` }

// ── Page ──────────────────────────────────────────────────────
export default async function DashboardPage() {
  // getAuthenticatedShop() is cached — DashboardLayout calling it again costs nothing
  const auth = await getAuthenticatedShop()
  if (!auth) redirect('/login')
  const { shop, supabase } = auth

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // ── Fetch all data in parallel (including stock value) ─────
  const [
    { count: availCount },
    { count: pendingShipCount },
    { data: recentOrders },
    { data: recentCards },
    { data: soldThisMonth },
    { data: chartOrders },
    { data: stockCards },
  ] = await Promise.all([
    supabase.from('cards').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id).eq('status', 'available'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id).eq('status', 'paid'),
    supabase.from('orders')
      .select('id, status, total_amount, buyer_email, created_at, order_items(price_snapshot, cards(name, image_url, condition))')
      .eq('shop_id', shop.id).eq('status', 'paid')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('cards').select('id, name, image_url, price, condition, status, quantity')
      .eq('shop_id', shop.id).neq('status', 'removed')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total_amount')
      .eq('shop_id', shop.id).in('status', ['completed', 'shipped', 'paid'])
      .gte('created_at', monthStart),
    supabase.from('orders').select('total_amount, created_at')
      .eq('shop_id', shop.id).in('status', ['completed', 'shipped', 'paid'])
      .gte('created_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true }),
    // stock value moved into parallel — was sequential before (extra round trip)
    supabase.from('cards').select('price, quantity').eq('shop_id', shop.id).eq('status', 'available'),
  ])

  // ── Compute stats ──────────────────────────────────────────
  const monthSales = (soldThisMonth ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0)
  const stockValue = (stockCards ?? []).reduce((s: number, c: { price: number; quantity: number }) => s + c.price * (c.quantity ?? 1), 0)

  // ── Chart data: bucket by day ─────────────────────────────
  const dayMap = new Map<string, number>()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const key = String(d).padStart(2, '0')
    dayMap.set(key, 0)
  }
  for (const o of chartOrders ?? []) {
    const day = String(new Date(o.created_at).getDate()).padStart(2, '0')
    dayMap.set(day, (dayMap.get(day) ?? 0) + (o.total_amount ?? 0))
  }
  const chartData = Array.from(dayMap.values())
  const chartTotal = chartData.reduce((s, v) => s + v, 0)

  // ── Top selling cards this month ──────────────────────────
  // From order_items for orders this month
  const { data: topOrderItems } = await supabase
    .from('order_items')
    .select('price_snapshot, cards(id, name, image_url, condition)')
    .eq('orders.shop_id', shop.id)
    .gte('created_at', monthStart)
    .limit(20)

  // Count by card name (simpler than grouping)
  const topMap = new Map<string, { name: string; url?: string; condition: string; price: number; count: number }>()
  for (const item of topOrderItems ?? []) {
    const card = item.cards as unknown as { id: string; name: string; image_url: string; condition: string } | null
    if (!card) continue
    const e = topMap.get(card.name)
    if (e) { e.count++; e.price = Math.max(e.price, item.price_snapshot) }
    else topMap.set(card.name, { name: card.name, url: card.image_url, condition: card.condition, price: item.price_snapshot, count: 1 })
  }
  const topCards = Array.from(topMap.values()).sort((a, b) => b.count - a.count).slice(0, 5)

  // Use recent cards as fallback for top cards
  const displayTopCards = topCards.length > 0 ? topCards : (recentCards ?? []).slice(0, 5).map(c => ({
    name: c.name, url: c.image_url, condition: c.condition, price: c.price, count: 0,
  }))

  const orderSeq = 1041 // placeholder running order number

  return (
    <DashboardLayout title="ภาพรวมร้าน" subtitle="สรุปยอดขายและงานที่ต้องทำวันนี้">

      {/* ── Stats row ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="ยอดขายเดือนนี้"  value={fmtB(monthSales)}          color="#ee1c25"/>
        <StatCard label="ออเดอร์รอส่ง"    value={pendingShipCount ?? 0}     color="#2a75bb"/>
        <StatCard label="กำลังขาย"         value={availCount ?? 0}           color="#2e9e4f"/>
        <StatCard label="มูลค่าสต็อก"     value={fmtB(stockValue)}          color="#d48806"/>
      </div>

      {/* ── Chart + Top cards ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14, marginBottom: 20 }}>

        {/* Chart card */}
        <div style={{ background: '#fff', border: '1.5px solid #ededf0', borderRadius: 14, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <h3 style={{ ...KAN, fontWeight: 700, fontSize: 16, margin: 0, color: '#1c1b24' }}>ยอดขาย</h3>
              <p style={{ fontSize: 12.5, color: '#6b6a76', margin: '2px 0 0', ...ANU }}>ภาพรวมรายได้ของร้าน</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 16px' }}>
            <span style={{ ...KAN, fontWeight: 700, fontSize: 32, color: '#1c1b24' }}>{fmtB(chartTotal)}</span>
            {chartTotal > 0 && (
              <span style={{ background: '#e8f9ef', color: '#2e9e4f', ...KAN, fontWeight: 600, fontSize: 13, padding: '3px 9px', borderRadius: 999 }}>
                + เดือนนี้
              </span>
            )}
          </div>
          <SalesChart data={chartData} />
          {/* X-axis labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingRight: 2 }}>
            {[1, 5, 10, 15, 20, 25, daysInMonth].map(d => (
              <span key={d} style={{ fontSize: 11, color: '#a1a1aa', ...ANU }}>{d}</span>
            ))}
          </div>
        </div>

        {/* Top selling cards */}
        <div style={{ background: '#fff', border: '1.5px solid #ededf0', borderRadius: 14, padding: '20px 20px' }}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ ...KAN, fontWeight: 700, fontSize: 16, margin: 0, color: '#1c1b24' }}>การ์ดขายดี</h3>
            <p style={{ fontSize: 12.5, color: '#6b6a76', margin: '2px 0 0', ...ANU }}>เดือนนี้</p>
          </div>
          {displayTopCards.length === 0 && (
            <p style={{ fontSize: 13, color: '#a1a1aa', ...ANU }}>ยังไม่มีข้อมูล</p>
          )}
          {displayTopCards.map((card, i) => (
            <div key={card.name + i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderBottom: i < displayTopCards.length - 1 ? '1px solid #f0eee9' : 'none' }}>
              <span style={{ ...KAN, fontWeight: 700, fontSize: 13, color: '#a1a1aa', width: 16, flexShrink: 0, textAlign: 'center' }}>{i + 1}</span>
              <CardThumb url={card.url} name={card.name} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...KAN, fontWeight: 600, fontSize: 13.5, color: '#1c1b24', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.name}</div>
                <div style={{ fontSize: 12, color: '#6b6a76', marginTop: 1, ...ANU }}>{COND_LABEL[card.condition] ?? card.condition}</div>
              </div>
              <span style={{ ...KAN, fontWeight: 700, fontSize: 13.5, color: '#1c1b24', flexShrink: 0 }}>{fmtB(card.price)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pending orders ────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader
          title="ออเดอร์รอจัดการ"
          sub={pendingShipCount ? `${pendingShipCount} รายการรอส่ง` : 'ไม่มีออเดอร์รอส่ง'}
          linkHref="/dashboard/orders"
          linkLabel="ดูทั้งหมด"
        />
        {(recentOrders ?? []).length === 0 ? (
          <div style={{ background: '#fff', border: '1.5px solid #ededf0', borderRadius: 14, padding: '28px 20px', textAlign: 'center', color: '#a1a1aa', fontSize: 14, ...ANU }}>
            ไม่มีออเดอร์รอส่งในขณะนี้
          </div>
        ) : (
          <Table cols={['ออเดอร์', 'สินค้า', 'ผู้ซื้อ', 'ยอดรวม', 'สถานะ', 'จัดการ']}>
            {(recentOrders ?? []).map((order, idx) => {
              const items = (order.order_items ?? []) as unknown as { price_snapshot: number; cards: { name: string; image_url: string; condition: string } | null }[]
              const firstCard = items[0]?.cards
              return (
                <Tr key={order.id} last={idx === (recentOrders?.length ?? 1) - 1}>
                  <Td>
                    <div style={{ ...KAN, fontWeight: 700, fontSize: 13.5, color: '#1c1b24' }}>#{orderSeq + idx}</div>
                    <div style={{ fontSize: 12, color: '#6b6a76', marginTop: 2, ...ANU }}>{fmtDate(order.created_at)}</div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {firstCard && <CardThumb url={firstCard.image_url} name={firstCard.name} size={28} />}
                      <span style={{ fontSize: 13, color: '#1c1b24', ...ANU }}>{items.length} ใบ</span>
                    </div>
                  </Td>
                  <Td muted>{order.buyer_email ?? '—'}</Td>
                  <Td>
                    <span style={{ ...KAN, fontWeight: 700, fontSize: 14 }}>{fmtB(order.total_amount)}</span>
                  </Td>
                  <Td>
                    <span style={{ background: '#fff1ef', color: '#ee1c25', ...KAN, fontWeight: 600, fontSize: 12, padding: '3px 10px', borderRadius: 999 }}>รอส่ง</span>
                  </Td>
                  <Td>
                    <Link href={`/dashboard/orders`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#faf7f2', border: '1.5px solid #ededf0', borderRadius: 8, padding: '5px 11px', fontSize: 13, color: '#1c1b24', textDecoration: 'none', ...KAN, fontWeight: 500, whiteSpace: 'nowrap' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/>
                        <path d="m16 18 2 2 4-4"/>
                      </svg>
                      ส่งของ
                    </Link>
                  </Td>
                </Tr>
              )
            })}
          </Table>
        )}
      </div>

      {/* ── Recent listings ───────────────────────────────── */}
      <div>
        <SectionHeader title="สินค้าล่าสุด" linkHref="/dashboard/listings" linkLabel="จัดการสินค้า" />
        {(recentCards ?? []).length === 0 ? (
          <div style={{ background: '#fff', border: '1.5px solid #ededf0', borderRadius: 14, padding: '28px 20px', textAlign: 'center', color: '#a1a1aa', fontSize: 14, ...ANU }}>
            ยังไม่มีสินค้า — <Link href="/dashboard/listings/new" style={{ color: '#ee1c25', textDecoration: 'none' }}>ลงขายเลย</Link>
          </div>
        ) : (
          <Table cols={['การ์ด', 'สภาพ', 'ราคา', 'คงเหลือ', 'สถานะ', 'จัดการ']}>
            {(recentCards ?? []).map((card, idx) => {
              const st = STATUS_STYLE[card.status] ?? STATUS_STYLE.available
              return (
                <Tr key={card.id} last={idx === (recentCards?.length ?? 1) - 1}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CardThumb url={card.image_url} name={card.name} size={30} />
                      <div>
                        <div style={{ ...KAN, fontWeight: 600, fontSize: 14, color: '#1c1b24' }}>{card.name}</div>
                        <div style={{ fontSize: 12, color: '#6b6a76', marginTop: 1, ...ANU }}>การ์ด Pokemon</div>
                      </div>
                    </div>
                  </Td>
                  <Td muted>{COND_LABEL[card.condition] ?? card.condition}</Td>
                  <Td>
                    <span style={{ ...KAN, fontWeight: 700 }}>{fmtB(card.price)}</span>
                  </Td>
                  <Td muted>{card.quantity ?? 1}/1</Td>
                  <Td>
                    <span style={{ background: st.bg, color: st.color, ...KAN, fontWeight: 600, fontSize: 12, padding: '3px 10px', borderRadius: 999 }}>
                      {st.label}
                    </span>
                  </Td>
                  <Td>
                    {card.status === 'available' ? (
                      <Link href={`/dashboard/listings`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#2a75bb', textDecoration: 'none', fontSize: 13, ...KAN, fontWeight: 500 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        แก้ไข
                      </Link>
                    ) : (
                      <span style={{ color: '#a1a1aa', fontSize: 13 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                        ดู
                      </span>
                    )}
                  </Td>
                </Tr>
              )
            })}
          </Table>
        )}
      </div>

    </DashboardLayout>
  )
}
