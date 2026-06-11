export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ListingsActions } from './ListingsActions'

type CardStatus = 'available' | 'reserved' | 'sold' | 'removed'
type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'

interface CardRow {
  id: string
  name: string
  image_url: string
  price: number
  condition: CardCondition
  status: CardStatus
  sort_order: number
  created_at: string
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; status?: string }>
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

  const params = await searchParams
  const statusFilter = params.status ?? 'available'
  const isNew = !!params.new

  const query = supabase
    .from('cards')
    .select('id, name, image_url, price, condition, status, sort_order, created_at')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })
    .order('sort_order', { ascending: true })

  if (statusFilter !== 'all') query.eq('status', statusFilter)

  const { data: cards } = await query

  const tabs: { value: string; label: string }[] = [
    { value: 'available', label: 'ว่าง' },
    { value: 'reserved',  label: 'จองอยู่' },
    { value: 'sold',      label: 'ขายแล้ว' },
    { value: 'all',       label: 'ทั้งหมด' },
  ]

  return (
    <DashboardLayout shopName={shop.name}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">จัดการสินค้า</h1>
          {isNew && (
            <p className="text-emerald-400 text-sm mt-1">ขึ้นขายสำเร็จแล้ว</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${shop.slug}`}
            target="_blank"
            className="text-sm text-zinc-400 hover:text-white transition border border-zinc-700 hover:border-zinc-500 px-3 py-2 rounded-lg"
          >
            ดูหน้าร้าน ↗
          </a>
          <Link
            href="/dashboard/listings/new"
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition"
          >
            + ลงขายเพิ่ม
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <Link
            key={tab.value}
            href={`/dashboard/listings?status=${tab.value}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === tab.value
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Cards grid */}
      {!cards?.length ? (
        <div className="text-center py-20 text-zinc-500">
          <div className="text-5xl mb-4">🃏</div>
          <p className="text-lg mb-2">ยังไม่มีการ์ด</p>
          <Link href="/dashboard/listings/new" className="text-violet-400 hover:underline text-sm">
            ลงขายการ์ดใบแรก →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {cards.map((card: CardRow) => (
            <div
              key={card.id}
              className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col ${
                card.status === 'sold' ? 'opacity-50' : ''
              }`}
            >
              <div className="relative aspect-[5/7]">
                <Image
                  src={card.image_url}
                  alt={card.name || 'การ์ด'}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover"
                />
                <div className="absolute top-1.5 left-1.5 flex gap-1">
                  {card.status !== 'removed' && <Badge variant={card.status as Exclude<CardStatus, 'removed'>} />}
                </div>
              </div>

              <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                <p className="text-xs text-zinc-300 font-medium truncate leading-tight">
                  {card.name || <span className="text-zinc-600">ไม่มีชื่อ</span>}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    ฿{(card.price / 100).toLocaleString()}
                  </span>
                  <Badge variant={card.condition as CardCondition} />
                </div>
                {card.status === 'available' && (
                  <ListingsActions cardId={card.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
