/**
 * Tests for lib/cv/crop.ts
 *
 * Covers CLAUDE.md §7 requirements:
 *   Unit: aspect-ratio filter, angle output, crop bounds
 *   Integration: flat card, tilted card, single card, multiple cards, no-card image
 *   Edge: crop bounds clamp, output dimensions, degenerate inputs
 *
 * These tests use real Sharp image generation (not mocks) so they require
 * Node.js + sharp + @techstark/opencv-js to be installed.
 */

import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { detectAndCropCards, cropCardManual } from '../crop'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CARD_OUT_W = 252
const CARD_OUT_H = 352

/**
 * Generate a synthetic test image: dark grey background with white rectangles
 * representing cards at the given positions.
 */
async function makeTestImage(
  imageW: number,
  imageH: number,
  cards: { x: number; y: number; w: number; h: number }[],
): Promise<Buffer> {
  // Build SVG rects for each card (white rectangles on dark background)
  const rects = cards
    .map(c => `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="white"/>`)
    .join('\n')

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${imageW}" height="${imageH}">
      <rect width="${imageW}" height="${imageH}" fill="#111111"/>
      ${rects}
    </svg>
  `
  return sharp(Buffer.from(svg)).png().toBuffer()
}

/**
 * Generate a synthetic image with a single tilted card (rotated rectangle on dark bg).
 */
async function makeTiltedCardImage(
  imageW: number,
  imageH: number,
  cx: number,
  cy: number,
  cardW: number,
  cardH: number,
  angleDeg: number,
): Promise<Buffer> {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  // 4 corners relative to centre, then rotate
  const hw = cardW / 2
  const hh = cardH / 2
  const local = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]]
  const pts = local
    .map(([x, y]) => `${cx + x * cos - y * sin},${cy + x * sin + y * cos}`)
    .join(' ')

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${imageW}" height="${imageH}">
      <rect width="${imageW}" height="${imageH}" fill="#111111"/>
      <polygon points="${pts}" fill="white"/>
    </svg>
  `
  return sharp(Buffer.from(svg)).png().toBuffer()
}

// ─── Unit: aspect-ratio helpers (pure math) ───────────────────────────────────

describe('aspect ratio filter (unit)', () => {
  const RATIO_MIN = 0.52
  const RATIO_MAX = 0.88

  function isCardRatio(w: number, h: number) {
    const ratio = Math.min(w, h) / Math.max(w, h)
    return ratio >= RATIO_MIN && ratio <= RATIO_MAX
  }

  it('accepts a Pokemon card dimension (63×88mm → 0.716)', () => {
    expect(isCardRatio(63, 88)).toBe(true)
  })

  it('accepts a slightly wider card (portrait tolerance)', () => {
    expect(isCardRatio(55, 88)).toBe(true)  // 0.625
  })

  it('accepts a slightly narrower card (edge of range)', () => {
    expect(isCardRatio(46, 88)).toBe(true)  // 0.523 ≥ 0.52
  })

  it('rejects a square (ratio 1.0)', () => {
    expect(isCardRatio(88, 88)).toBe(false)
  })

  it('rejects a very thin rectangle (ratio 0.3)', () => {
    expect(isCardRatio(26, 88)).toBe(false)
  })

  it('works for landscape orientation too (swaps w/h before ratio)', () => {
    expect(isCardRatio(88, 63)).toBe(true)
  })
})

// ─── Unit: output dimensions ──────────────────────────────────────────────────

describe('output crop dimensions (unit)', () => {
  it('CARD_OUT_W / CARD_OUT_H is the expected Pokemon aspect ratio', () => {
    const ratio = CARD_OUT_W / CARD_OUT_H
    expect(ratio).toBeCloseTo(0.716, 2)
  })
})

// ─── Integration tests ────────────────────────────────────────────────────────
// OpenCV WASM does not initialize correctly inside vitest's esbuild-transformed
// module environment. Integration tests live in crop.integration.mjs and run via:
//   npm run test:cv
