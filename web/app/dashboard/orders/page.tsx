export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

type OrderStatus = 'pending_payment' | 'verifying' | 'paid' | 'shipped' | 'completed' | 'cancelled'

interface OrderWithItems {
  id: string
  status: OrderStatus
  total_amount: number
  buyer_email: string | null
  tracking_number: string | null
  created_at: string
  expires_at: string | null
  order_items: {
    price_snapshot: number
    cards: { name: string; image_url: string; condition: string } | null
  }[]
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'รอชำระ',
  verifying:       'ตรวจสลิป',
  paid:            'รอจัดส่ง',
  shipped:         'ส่งแล้ว',
  completed:       'เสร็จสิ้น',
  cancelled:       'ยกเลิก',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-900/30 text-amber-400 border-amber-800',
  verifying:       'bg-blue-900/30 text-blue-400 border-blue-800',
  paid:            'bg-emerald-900/30 text-emerald-400 border-emerald-800',
  shipped:         'bg-violet-900/30 text-violet-400 border-violet-800',
  completed:       'bg-zinc-800 text-zinc-400 border-zinc-700',
  cancelled:       'bg-red-900/20 text-red-400 border-red-900',
}

const TABS: { value: string; label: string }[] = [
  { value: 'active',    label: 'ใหม่/รอจัดส่ง' },
  { value: 'shipped',   label: 'ส่งแล้ว' },
  { value: 'completed', label: 'เสร็จสิ้น' },
  { value: 'all',       label: 'ทั้งหมด' },
]

const ACTIVE_STATUSES = ['pending_payment', 'verifying', 'paid']

export default async function DashboardOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, slug')
    .eq('owner_id', user.id)
    .single()
  if (!shop) redirect('/dashboard/setup')

  const { tab = 'active' } = await searchParams

  let query = supabase
    .from('orders')
    .select('id, status, total_amount, buyer_email, tracking_number, created_at, expires_at, order_items(price_snapshot, cards(name, image_url, condition))')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  if (tab === 'active')    query = query.in('status', ACTIVE_STATUSES)
  else if (tab !== 'all')  query = query.eq('status', tab)

  const { data: orders } = await query

  return (
    <DashboardLayout shopName={shop.name}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ออเดอร์</h1>
        <a
          href={`/${shop.slug}`}
          target="_blank"
          className="text-sm text-zinc-400 hover:text-white transition border border-zinc-700 hover:border-zinc-500 px-3 py-2 rounded-lg"
        >
          ดูหน้าร้าน ↗
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <Link
            key={t.value}
            href={`/dashboard/orders?tab=${t.value}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              tab === t.value ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Orders list */}
      {!orders?.length ? (
        <div className="text-center py-20 text-zinc-500">
          <div className="text-4xl mb-3">📦</div>
          <p>ยังไม่มีออเดอร์</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(orders as unknown as OrderWithItems[]).map(order => (
            <OrderCard key={order.id} order={order} shopId={shop.id} />
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

function OrderCard({ order, shopId }: { order: OrderWithItems; shopId: string }) {
  const items = order.order_items ?? []
  const isExpired = order.expires_at && new Date(order.expires_at) < new Date()

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLOR[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
          <span className="text-xs text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-emerald-400">฿{(order.total_amount / 100).toLocaleString()}</p>
          <p className="text-xs text-zinc-500">{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
        </div>
      </div>

      {/* Items preview */}
      <div className="px-5 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          {items.slice(0, 5).map((item, i) => (
            <div key={i} className="relative w-8 h-11 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
              {item.cards?.image_url && (
                <Image src={item.cards.image_url} alt={item.cards?.name ?? ''} fill sizes="32px" className="object-cover" />
              )}
            </div>
          ))}
          {items.length > 5 && (
            <div className="w-8 h-11 rounded bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
              +{items.length - 5}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-300 truncate">
            {items[0]?.cards?.name || 'การ์ด'}{items.length > 1 ? ` +${items.length - 1}` : ''}
          </p>
          {order.buyer_email && (
            <p className="text-xs text-zinc-500 truncate">{order.buyer_email}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      {(order.status === 'paid' || order.status === 'shipped') && (
        <TrackingRow orderId={order.id} currentTracking={order.tracking_number} status={order.status} />
      )}

      {order.status === 'pending_payment' && isExpired && (
        <div className="px-5 pb-4">
          <p className="text-xs text-red-400">หมดเวลาแล้ว — จะถูกยกเลิกอัตโนมัติ</p>
        </div>
      )}

      <div className="px-5 pb-4 pt-1">
        <Link
          href={`/orders/${order.id}`}
          target="_blank"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition"
        >
          ดูรายละเอียด ↗
        </Link>
      </div>
    </div>
  )
}

function TrackingRow({ orderId, currentTracking, status }: { orderId: string; currentTracking: string | null; status: string }) {
  return (
    <form action={`/api/orders/${orderId}/tracking`} method="POST" className="px-5 pb-3">
      <div className="flex gap-2">
        <input
          name="tracking_number"
          defaultValue={currentTracking ?? ''}
          placeholder={status === 'paid' ? 'ใส่เลขพัสดุ' : 'เลขพัสดุ'}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-semibold transition"
        >
          {status === 'shipped' ? 'แก้ไข' : 'ส่งแล้ว'}
        </button>
      </div>
    </form>
  )
}
