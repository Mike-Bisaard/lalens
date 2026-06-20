export const dynamic = 'force-dynamic'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { displayPrice } from '@/lib/money'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  params: Promise<{ orderId: string }>
}

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'รอชำระเงิน',
  verifying:       'กำลังตรวจสลิป',
  paid:            'ชำระแล้ว — รอจัดส่ง',
  shipped:         'จัดส่งแล้ว',
  completed:       'เสร็จสิ้น',
  cancelled:       'ยกเลิกแล้ว',
}

const STATUS_COLOR: Record<string, string> = {
  pending_payment: 'text-amber-400',
  verifying:       'text-blue-400',
  paid:            'text-emerald-400',
  shipped:         'text-violet-400',
  completed:       'text-emerald-400',
  cancelled:       'text-red-400',
}

export default async function OrderStatusPage({ params }: Props) {
  const { orderId } = await params

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: order } = await supabase
    .from('orders')
    .select('*, shops(name, slug, bank_name), order_items(price_snapshot, cards(id, name, image_url, condition))')
    .eq('id', orderId)
    .single()

  if (!order) notFound()

  const items = order.order_items ?? []

  return (
    <div className="min-h-screen bg-[#09090f] text-white px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Back to shop */}
        {order.shops?.slug && (
          <Link href={`/${order.shops.slug}`} className="text-sm text-zinc-500 hover:text-white transition mb-6 block">
            ← {order.shops.name}
          </Link>
        )}

        <h1 className="text-xl font-bold mb-6">สถานะออเดอร์</h1>

        {/* Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-500">ออเดอร์ #{orderId.slice(0, 8).toUpperCase()}</span>
            <span className="text-xs text-zinc-500">
              {new Date(order.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <p className={`text-lg font-bold ${STATUS_COLOR[order.status] ?? 'text-white'}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </p>
          {order.tracking_number && (
            <p className="text-sm text-zinc-400 mt-2">เลขพัสดุ: <span className="font-mono text-white">{order.tracking_number}</span></p>
          )}
        </div>

        {/* Order items */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
          <div className="p-4 border-b border-zinc-800">
            <p className="text-sm font-semibold text-zinc-300">{items.length} ใบ</p>
          </div>
          <div className="divide-y divide-zinc-800">
            {items.map((item: { price_snapshot: number; cards: { id: string; name: string; image_url: string; condition: string } | null }) => (
              <div key={item.cards?.id} className="flex items-center gap-3 p-4">
                {item.cards?.image_url && (
                  <div className="relative w-8 h-11 flex-shrink-0">
                    <Image
                      src={item.cards.image_url}
                      alt={item.cards.name || 'การ์ด'}
                      fill
                      sizes="32px"
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.cards?.name || 'ไม่ระบุชื่อ'}</p>
                  <p className="text-xs text-zinc-500">{item.cards?.condition}</p>
                </div>
                <p className="text-sm font-bold text-emerald-400">{displayPrice(item.price_snapshot)}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-zinc-800 flex justify-between">
            <span className="text-zinc-400">รวม</span>
            <span className="font-black text-emerald-400">{displayPrice(order.total_amount)}</span>
          </div>
        </div>

        {/* Status-specific messages */}
        {order.status === 'pending_payment' && (
          <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-4 text-sm text-amber-300">
            รอการยืนยันการชำระเงิน
            {order.expires_at && new Date(order.expires_at) > new Date() && (
              <span className="block text-xs mt-1 text-amber-400/70">
                หมดเวลา {new Date(order.expires_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
              </span>
            )}
          </div>
        )}
        {order.status === 'paid' && (
          <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-4 text-sm text-emerald-300">
            ชำระเงินเรียบร้อย ร้านกำลังเตรียมจัดส่ง
          </div>
        )}
        {order.status === 'cancelled' && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-sm text-red-300">
            ออเดอร์ถูกยกเลิก (อาจหมดเวลาหรือสลิปไม่ผ่านการตรวจ)
          </div>
        )}
      </div>
    </div>
  )
}
