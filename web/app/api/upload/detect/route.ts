import { NextRequest, NextResponse } from 'next/server'
import { detectAndCropCards } from '@/lib/cv/crop'

export const maxDuration = 30

const MAX_FILE_BYTES = 20 * 1024 * 1024 // 20 MB

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'invalid_form_data' }, { status: 400 })
  }

  const file = formData.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'no_image' }, { status: 400 })

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: 'file_too_large', maxMb: 20 },
      { status: 413 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const DETECT_TIMEOUT_MS = 25_000
  let detected: Awaited<ReturnType<typeof detectAndCropCards>>
  try {
    detected = await Promise.race([
      detectAndCropCards(buffer),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('detection_timeout')), DETECT_TIMEOUT_MS)
      ),
    ])
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    if (msg === 'detection_timeout' || msg.includes('timeout')) {
      return NextResponse.json({ error: 'detection_timeout' }, { status: 504 })
    }
    console.error('[detect] CV error:', err)
    return NextResponse.json({ error: 'detection_failed' }, { status: 500 })
  }

  const cards = await Promise.all(
    detected.map(async (card) => ({
      index: card.index,
      cropCoords: { x: card.x, y: card.y, w: card.w, h: card.h },
      imageDataUrl: `data:image/jpeg;base64,${card.cropBuffer.toString('base64')}`,
    }))
  )

  return NextResponse.json({ cards, total: cards.length })
}
