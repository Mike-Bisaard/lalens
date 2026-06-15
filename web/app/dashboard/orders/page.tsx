import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import OrdersView from './OrdersView'
import type { Order } from './OrdersView'

export const dynamic = 'force-dynamic'

export default async function DashboardOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops').select('id').eq('owner_id', user.id).maybeSingle()
  if (!shop) redirect('/dashboard/setup')

  const { data: orders } = await supabase
    .from('orders')
    .select(`id, status, total_amount, buyer_email, tracking_number, created_at,
      buyer_name, buyer_phone, buyer_address, expires_at,
      order_items(id, price_snapshot, cards(id, name, image_url, condition))`)
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout title="ออเดอร์" subtitle="จัดการคำสั่งซื้อและการจัดส่ง">
      <OrdersView shopId={shop.id} initialOrders={(orders ?? []) as unknown as Order[]} />
    </DashboardLayout>
  )
}
