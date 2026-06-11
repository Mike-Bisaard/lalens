import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const BUCKET = 'cards'

// Admin client bypasses RLS for storage uploads
function adminStorage() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ).storage
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const storage = adminStorage()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: shop } = await supabase
    .from('shops')
    .select('id, slug')
    .eq('owner_id', user.id)
    .single()
  if (!shop) return NextResponse.json({ error: 'no_shop' }, { status: 400 })

  const formData = await req.formData()
  const originalFile = formData.get('image') as File | null
  const cardsJson   = formData.get('cards') as string | null
  if (!originalFile || !cardsJson) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const cards: Array<{
    index: number
    imageDataUrl: string
    cropCoords: { x: number; y: number; w: number; h: number }
    name: string
    price: string
    condition: string
  }> = JSON.parse(cardsJson)

  if (!cards.length) return NextResponse.json({ error: 'no_cards' }, { status: 400 })

  // Ensure bucket exists (admin client bypasses RLS)
  await storage.createBucket(BUCKET, { public: true }).catch(() => {})

  // Pre-generate batch UUID so we can use it as the storage folder
  const batchId = crypto.randomUUID()

  // Upload original image
  const origBuffer  = Buffer.from(await originalFile.arrayBuffer())
  const origPath    = `${batchId}/original${ext(originalFile.name)}`
  const { error: origErr } = await storage
    .from(BUCKET)
    .upload(origPath, origBuffer, { contentType: originalFile.type, upsert: true })
  if (origErr) return NextResponse.json({ error: 'upload_original_failed', detail: origErr.message }, { status: 500 })

  const { data: { publicUrl: originalImageUrl } } = storage.from(BUCKET).getPublicUrl(origPath)

  // Insert batch_uploads
  const { error: batchErr } = await supabase
    .from('batch_uploads')
    .insert({ id: batchId, shop_id: shop.id, original_image_url: originalImageUrl })
  if (batchErr) return NextResponse.json({ error: 'batch_failed', detail: batchErr.message }, { status: 500 })

  // Upload each card crop + build insert rows
  const rows: object[] = []
  for (const card of cards) {
    const base64 = card.imageDataUrl.split(',')[1]
    const buf    = Buffer.from(base64, 'base64')
    const path   = `${batchId}/${card.index}.jpg`

    const { error: uploadErr } = await storage
      .from(BUCKET)
      .upload(path, buf, { contentType: 'image/jpeg', upsert: true })
    if (uploadErr) continue

    const { data: { publicUrl } } = storage.from(BUCKET).getPublicUrl(path)
    const priceSatang = Math.round(parseFloat(card.price || '0') * 100)

    rows.push({
      batch_id:    batchId,
      shop_id:     shop.id,
      name:        card.name ?? '',
      image_url:   publicUrl,
      crop_coords: card.cropCoords,
      price:       priceSatang,
      condition:   card.condition ?? 'NM',
      sort_order:  card.index,
    })
  }

  if (!rows.length) return NextResponse.json({ error: 'all_uploads_failed' }, { status: 500 })

  const { error: cardsErr } = await supabase.from('cards').insert(rows)
  if (cardsErr) return NextResponse.json({ error: 'cards_insert_failed', detail: cardsErr.message }, { status: 500 })

  return NextResponse.json({ batchId, count: rows.length, shopSlug: shop.slug })
}

function ext(filename: string) {
  const m = filename.match(/\.[^.]+$/)
  return m ? m[0] : '.jpg'
}
