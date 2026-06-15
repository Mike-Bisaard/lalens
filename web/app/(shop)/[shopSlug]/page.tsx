export const revalidate = 30
export const dynamicParams = true // unknown slugs render on-demand then are ISR-cached

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ShopView from '@/components/shop/ShopView'
import type { Shop, BatchUpload, Card } from '@/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface BatchWithCards extends BatchUpload {
  cards: Card[]
}

interface Props {
  params: Promise<{ shopSlug: string }>
}

// Pre-render known shop slugs at build time.
// This is required to tell Next.js that `params` is a finite set, not a
// request-time value — which is what unlocks ISR for this dynamic route.
// New shops added after build are still ISR-cached on first visit (dynamicParams = true).
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/shops?select=slug&limit=200`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
    if (!res.ok) return []
    const shops: { slug: string }[] = await res.json()
    return shops.map(s => ({ shopSlug: s.slug }))
  } catch {
    return []
  }
}

// Native fetch so Next.js Full Route Cache can track and revalidate these requests.
async function supabaseGET<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
    next: { revalidate: 30 },
  })
  if (!res.ok) return []
  return res.json() as Promise<T[]>
}

async function getShopData(shopSlug: string) {
  const shops = await supabaseGET<Shop>(
    `shops?slug=eq.${encodeURIComponent(shopSlug)}&select=id,owner_id,name,slug,description,avatar_url,bank_name,bank_account_last4,created_at&limit=1`
  )
  const shop = shops[0]
  if (!shop) return null

  const batches = await supabaseGET<BatchWithCards>(
    `batch_uploads?shop_id=eq.${encodeURIComponent(shop.id)}&is_active=eq.true&select=*,cards(*)&order=created_at.desc`
  )

  return { shop, batches }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopSlug } = await params
  const data = await getShopData(shopSlug)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lalens.com'
  const title = data?.shop ? `${data.shop.name} — Lalens` : 'ร้านค้า — Lalens'
  const description = data?.shop?.description ?? 'ซื้อการ์ดสะสม กดเลือกใบที่ต้องการได้เลย'
  const url = `${appUrl}/${shopSlug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Lalens',
      type: 'website',
      locale: 'th_TH',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical: url },
  }
}

export default async function ShopPage({ params }: Props) {
  const { shopSlug } = await params
  const data = await getShopData(shopSlug)

  if (!data) notFound()

  return <ShopView shop={data.shop} batches={data.batches} />
}
