import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import ListingsView from './ListingsView'
import type { CardRow } from './ListingsView'
import { getAuthenticatedShop } from '@/lib/getShop'

export const dynamic = 'force-dynamic'

export default async function ListingsPage() {
  const auth = await getAuthenticatedShop()
  if (!auth) redirect('/login')
  const { shop, supabase } = auth

  const { data: cards } = await supabase
    .from('cards')
    .select('id, name, image_url, price, condition, status, quantity, created_at')
    .eq('shop_id', shop.id)
    .neq('status', 'removed')
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <DashboardLayout title="สินค้า" subtitle="จัดการการ์ด ราคา และสต็อก">
      <ListingsView shopId={shop.id} initialCards={(cards ?? []) as CardRow[]} />
    </DashboardLayout>
  )
}
