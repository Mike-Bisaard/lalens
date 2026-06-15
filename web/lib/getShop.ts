import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// cache() deduplicates calls within a single request's render tree.
// Both page.tsx and DashboardLayout call this — only one DB round trip happens.
export const getAuthenticatedShop = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: shop } = await supabase
    .from('shops').select('*').eq('owner_id', user.id).maybeSingle()
  if (!shop) return null
  return { user, shop, supabase }
})
