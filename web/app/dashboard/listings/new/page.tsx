export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getAuthenticatedShop } from '@/lib/getShop'
import NewListingView from './NewListingView'

export default async function NewListingPage() {
  const auth = await getAuthenticatedShop()
  if (!auth) redirect('/login')
  return <NewListingView shopSlug={auth.shop.slug} />
}
