export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, Badge } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const STAT_COLORS: Record<string, string> = {
  violet: 'from-brand-start to-brand-end',
  amber:  'from-amber-500 to-orange-500',
  green:  'from-emerald-500 to-teal-500',
  blue:   'from-blue-500 to-indigo-500',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!shop) redirect('/dashboard/setup')

  const [{ count: cardCount }, { count: orderCount }] = await Promise.all([
    supabase.from('cards').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id).eq('status', 'available'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id).eq('status', 'pending_payment'),
  ])

  const stats = [
    { label: 'การ์ดพร้อมขาย', value: cardCount ?? 0, color: 'violet' },
    { label: 'รอชำระเงิน',    value: orderCount ?? 0, color: 'amber'  },
    { label: 'link ร้านค้า',  value: `/${shop.slug}`, color: 'green', href: `/${shop.slug}` },
    { label: 'ยอดขายวันนี้',  value: '฿0',           color: 'blue'   },
  ]

  const quickNav = [
    { href: '/dashboard/listings/new', icon: '📸', title: 'ลงขายใหม่',    desc: 'Batch upload — ถ่ายรูปหมู่แล้วตัดกรอบอัตโนมัติ' },
    { href: '/dashboard/listings',     icon: '🃏', title: 'จัดการสินค้า', desc: 'ดู/แก้ไข/ลบการ์ดที่ลงขายไว้' },
    { href: '/dashboard/orders',       icon: '📦', title: 'ออเดอร์',       desc: 'รอส่ง / ส่งแล้ว / จบ' },
  ]

  return (
    <DashboardLayout shopName={shop.name}>
      <h1 className="text-2xl font-bold mb-8">ภาพรวมร้าน</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <Card key={s.label}>
            {s.href ? (
              <Link href={s.href}>
                <div className={`text-xl font-black bg-gradient-to-r ${STAT_COLORS[s.color]} bg-clip-text text-transparent mb-1 truncate hover:underline`}>
                  {s.value}
                </div>
              </Link>
            ) : (
              <div className={`text-2xl font-black bg-gradient-to-r ${STAT_COLORS[s.color]} bg-clip-text text-transparent mb-1`}>
                {s.value}
              </div>
            )}
            <div className="text-zinc-400 text-sm">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Quick nav */}
      <div className="grid md:grid-cols-3 gap-4">
        {quickNav.map(n => (
          <Link key={n.href} href={n.href}>
            <Card className="hover:border-zinc-600 transition cursor-pointer h-full">
              <div className="text-3xl mb-3">{n.icon}</div>
              <div className="font-semibold text-white mb-1">{n.title}</div>
              <div className="text-zinc-400 text-sm">{n.desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  )
}
