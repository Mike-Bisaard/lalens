/**
 * Integration tests for lib/cv/crop.ts — runs via: npm run test:cv
 * Uses npx tsx (no vitest) to avoid WASM init issues in vitest worker threads.
 */
import sharp from 'sharp'
import { detectAndCropCards, cropCardManual } from '../crop'

// ── Test runner ───────────────────────────────────────────────────────────────
let passed = 0; let failed = 0

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    console.log(`  ✓ ${name}`)
    passed++
  } catch (e: any) {
    console.log(`  ✗ ${name}`)
    console.log(`    ${e.message}`)
    failed++
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CARD_OUT_W = 252
const CARD_OUT_H = 352

// ── Helpers ───────────────────────────────────────────────────────────────────
async function makeTestImage(
  imageW: number, imageH: number,
  cards: { x: number; y: number; w: number; h: number }[]
): Promise<Buffer> {
  const rects = cards.map(c =>
    `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="white"/>`
  ).join('\n')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imageW}" height="${imageH}">
    <rect width="${imageW}" height="${imageH}" fill="#111111"/>
    ${rects}
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function makeTiltedCardImage(
  imageW: number, imageH: number,
  cx: number, cy: number,
  cardW: number, cardH: number,
  angleDeg: number
): Promise<Buffer> {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad); const sin = Math.sin(rad)
  const hw = cardW / 2; const hh = cardH / 2
  const local: [number, number][] = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]]
  const pts = local.map(([x, y]) =>
    `${cx + x * cos - y * sin},${cy + x * sin + y * cos}`
  ).join(' ')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imageW}" height="${imageH}">
    <rect width="${imageW}" height="${imageH}" fill="#111111"/>
    <polygon points="${pts}" fill="white"/>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

// ── Tests ─────────────────────────────────────────────────────────────────────
async function main() {
console.log('\ndetectAndCropCards (integration)')

await test('detects zero cards in a plain dark image', async () => {
  const img = await sharp({
    create: { width: 800, height: 600, channels: 3, background: { r: 20, g: 20, b: 20 } },
  }).png().toBuffer()
  const cards = await detectAndCropCards(img)
  assert(cards.length === 0, `Expected 0 cards, got ${cards.length}`)
})

await test('detects a single flat card — output size CARD_OUT_W × CARD_OUT_H', async () => {
  const img = await makeTestImage(800, 600, [{ x: 275, y: 125, w: 250, h: 350 }])
  const cards = await detectAndCropCards(img)
  assert(cards.length >= 1, `Expected ≥1 card, got ${cards.length}`)
  const meta = await sharp(cards[0].cropBuffer).metadata()
  assert(meta.width === CARD_OUT_W, `Expected width ${CARD_OUT_W}, got ${meta.width}`)
  assert(meta.height === CARD_OUT_H, `Expected height ${CARD_OUT_H}, got ${meta.height}`)
})

await test('upright card has angle ≈ 0', async () => {
  const img = await makeTestImage(800, 600, [{ x: 275, y: 125, w: 250, h: 350 }])
  const cards = await detectAndCropCards(img)
  assert(cards.length >= 1, `Expected ≥1 card, got ${cards.length}`)
  assert(Math.abs(cards[0].angle) < 5, `Expected angle < 5°, got ${cards[0].angle}`)
})

await test('detects a card tilted +15°', async () => {
  const img = await makeTiltedCardImage(900, 700, 450, 350, 220, 308, 15)
  const cards = await detectAndCropCards(img)
  assert(cards.length >= 1, `Expected ≥1 card, got ${cards.length}`)
  const meta = await sharp(cards[0].cropBuffer).metadata()
  assert(meta.width === CARD_OUT_W, `Width ${meta.width} ≠ ${CARD_OUT_W}`)
  assert(meta.height === CARD_OUT_H, `Height ${meta.height} ≠ ${CARD_OUT_H}`)
})

await test('detects a card tilted -15°', async () => {
  const img = await makeTiltedCardImage(900, 700, 450, 350, 220, 308, -15)
  const cards = await detectAndCropCards(img)
  assert(cards.length >= 1, `Expected ≥1 card, got ${cards.length}`)
  const meta = await sharp(cards[0].cropBuffer).metadata()
  assert(meta.width === CARD_OUT_W, `Width ${meta.width} ≠ ${CARD_OUT_W}`)
  assert(meta.height === CARD_OUT_H, `Height ${meta.height} ≠ ${CARD_OUT_H}`)
})

await test('multiple cards sorted row-major (left→right)', async () => {
  const img = await makeTestImage(1200, 600, [
    { x: 50,  y: 100, w: 220, h: 308 },
    { x: 490, y: 100, w: 220, h: 308 },
    { x: 930, y: 100, w: 220, h: 308 },
  ])
  const cards = await detectAndCropCards(img)
  assert(cards.length >= 2, `Expected ≥2 cards, got ${cards.length}`)
  for (let i = 1; i < cards.length; i++) {
    assert(cards[i].x >= cards[i - 1].x, `Card ${i} x=${cards[i].x} < card ${i-1} x=${cards[i-1].x}`)
  }
})

await test('each cropBuffer is a valid JPEG', async () => {
  const img = await makeTestImage(800, 600, [{ x: 275, y: 125, w: 220, h: 308 }])
  const cards = await detectAndCropCards(img)
  for (const card of cards) {
    assert(card.cropBuffer instanceof Buffer, 'cropBuffer not a Buffer')
    const meta = await sharp(card.cropBuffer).metadata()
    assert(meta.format === 'jpeg', `Expected jpeg, got ${meta.format}`)
  }
})

await test('bounding box fits within original image', async () => {
  const W = 800; const H = 600
  const img = await makeTestImage(W, H, [{ x: 275, y: 125, w: 220, h: 308 }])
  const cards = await detectAndCropCards(img)
  for (const card of cards) {
    assert(card.x >= 0, `x=${card.x} < 0`)
    assert(card.y >= 0, `y=${card.y} < 0`)
    assert(card.x + card.w <= W, `x+w=${card.x + card.w} > ${W}`)
    assert(card.y + card.h <= H, `y+h=${card.y + card.h} > ${H}`)
  }
})

await test('every card has exactly 4 corners', async () => {
  const img = await makeTestImage(800, 600, [{ x: 275, y: 125, w: 220, h: 308 }])
  const cards = await detectAndCropCards(img)
  for (const card of cards) {
    assert(card.corners.length === 4, `Expected 4 corners, got ${card.corners.length}`)
  }
})

await test('index values are sequential from 0', async () => {
  const img = await makeTestImage(1200, 600, [
    { x: 50,  y: 100, w: 220, h: 308 },
    { x: 490, y: 100, w: 220, h: 308 },
  ])
  const cards = await detectAndCropCards(img)
  cards.forEach((c, i) => assert(c.index === i, `Expected index ${i}, got ${c.index}`))
})

console.log('\ncropCardManual')

await test('returns correct region size', async () => {
  const img = await sharp({
    create: { width: 800, height: 600, channels: 3, background: { r: 200, g: 100, b: 50 } },
  }).png().toBuffer()
  const cropped = await cropCardManual(img, 10, 20, 100, 150)
  const meta = await sharp(cropped).metadata()
  assert(meta.width === 100, `Width ${meta.width} ≠ 100`)
  assert(meta.height === 150, `Height ${meta.height} ≠ 150`)
})

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n  ${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
}

main().catch(e => { console.error(e); process.exit(1) })
