import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { encrypt } from '@/lib/crypto'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/shops — create shop with encrypted bank account
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, slug, bank_name, bank_account, phone, account_holder_name, address, avatar_url } = body

  if (!name || !slug || !bank_name || !bank_account) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const cleanAccount = bank_account.replace(/-/g, '')
  const encryptedAccount = encrypt(cleanAccount)
  const last4 = cleanAccount.slice(-4)

  const admin = adminClient()
  const { error } = await admin.from('shops').insert({
    owner_id: user.id,
    name,
    slug,
    bank_name,
    bank_account_encrypted: encryptedAccount,
    bank_account_last4: last4,
    phone: phone?.replace(/-/g, '') || null,
    account_holder_name: account_holder_name || null,
    address: address || null,
    avatar_url: avatar_url || null,
  })

  if (error) {
    const isDuplicate = error.code === '23505'
    return NextResponse.json(
      { error: isDuplicate ? 'slug_taken' : error.message },
      { status: isDuplicate ? 409 : 500 }
    )
  }

  return NextResponse.json({ ok: true })
}

// PATCH /api/shops — update existing shop
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, bank_name, bank_account, phone, account_holder_name, address, avatar_url } = body

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).maybeSingle()
  if (!shop) return NextResponse.json({ error: 'shop_not_found' }, { status: 404 })

  const updates: Record<string, unknown> = {}
  if (name) updates.name = name
  if (bank_name) updates.bank_name = bank_name
  if (phone !== undefined) updates.phone = phone?.replace(/-/g, '') || null
  if (account_holder_name !== undefined) updates.account_holder_name = account_holder_name || null
  if (address !== undefined) updates.address = address || null
  if (avatar_url !== undefined) updates.avatar_url = avatar_url || null

  if (bank_account) {
    const cleanAccount = bank_account.replace(/-/g, '')
    updates.bank_account_encrypted = encrypt(cleanAccount)
    updates.bank_account_last4 = cleanAccount.slice(-4)
  }

  const admin = adminClient()
  const { error } = await admin.from('shops').update(updates).eq('id', shop.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
