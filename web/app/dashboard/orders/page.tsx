import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import OrdersView from './OrdersView'
import type { Order } from './OrdersView'
import { getAuthenticatedShop } from '@/lib/getShop'

export const dynamic = 'force-dynamic'

export default async function DashboardOrdersPage() {
  const auth = await getAuthenticatedShop()
  if (!auth) redirect('/login')
  const { shop, supabase } = auth

  const { data: orders } = await supabase
    .from('orders')
    .select(`id, status, total_amount, buyer_email, tracking_number, created_at,
      buyer_name, buyer_phone, buyer_address, expires_at,
      order_items(id, price_snapshot, cards(id, name, image_url, condition))`)
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <DashboardLayout title="ออเดอร์" subtitle="จัดการคำสั่งซื้อและการจัดส่ง">
      <OrdersView shopId={shop.id} initialOrders={(orders ?? []) as unknown as Order[]} />
    </DashboardLayout>
  )
}
