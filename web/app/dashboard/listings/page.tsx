import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import ListingsView from './ListingsView'
import type { CardRow } from './ListingsView'

export const dynamic = 'force-dynamic'

export default async function ListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops').select('id').eq('owner_id', user.id).maybeSingle()
  if (!shop) redirect('/dashboard/setup')

  const { data: cards } = await supabase
    .from('cards')
    .select('id, name, image_url, price, condition, status, quantity, created_at')
    .eq('shop_id', shop.id)
    .neq('status', 'removed')
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout title="สินค้า" subtitle="จัดการการ์ด ราคา และสต็อก">
      <ListingsView shopId={shop.id} initialCards={(cards ?? []) as CardRow[]} />
    </DashboardLayout>
  )
}
