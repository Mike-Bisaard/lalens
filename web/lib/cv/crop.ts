import sharp from 'sharp'
import { createRequire } from 'module'
import path from 'path'

// ─── OpenCV initialisation (WASM loads once per process) ───────────────────
// Use createRequire instead of dynamic import() — UMD/CJS WASM modules hang
// with ESM import() in Node.js 24 but work fine with require().
// process.cwd() (project root) works as anchor in both CJS (Next.js) and ESM contexts.
const _require = createRequire(path.join(process.cwd(), '_anchor.js'))

// Pre-load the UMD module immediately at module init time (synchronous require).
// The WASM binary (~10MB base64) compiles asynchronously in the background —
// by the time the first detectAndCropCards call arrives the compilation is usually done.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _cvRaw = _require('@techstark/opencv-js') as any

// WARNING: _cvRaw is a thenable object (has Module["then"]).
// NEVER resolve a Promise with _cvRaw — it triggers infinite microtask loops via
// the Promise assimilation protocol (JS calls _cvRaw.then(resolve) → resolve(Module)
// → Module is thenable → repeat forever → event loop starved, timers never fire).
// waitForCV() returns Promise<void> so callers use _cvRaw directly.

let _cvReady: Promise<void> | null = null

function waitForCV(): Promise<void> {
  if (_cvReady) return _cvReady
  _cvReady = new Promise<void>((resolve, reject) => {
    if (_cvRaw.Mat) { resolve(); return }
    const TIMEOUT_MS = 15_000
    const timer = setTimeout(() => reject(new Error('OpenCV WASM init timeout after 15s')), TIMEOUT_MS)
    _cvRaw.onRuntimeInitialized = () => { clearTimeout(timer); resolve() }
    const poll = setInterval(() => {
      if (_cvRaw.Mat) { clearTimeout(timer); clearInterval(poll); resolve() }
    }, 50)
  })
  return _cvReady
}

// ─── Types ──────────────────────────────────────────────────────────────────
export interface DetectedCard {
  index: number
  /** Bounding box (axis-aligned, in original image pixels) */
  x: number
  y: number
  w: number
  h: number
  /** Rotation angle in degrees (0 = upright) */
  angle: number
  /** 4 corners [x,y] in original image pixels */
  corners: [number, number][]
  /** De-warped card image, JPEG, CARD_OUT_W × CARD_OUT_H */
  cropBuffer: Buffer
}

// ─── Constants ──────────────────────────────────────────────────────────────
// Pokemon card: 63 × 88 mm → w/h = 0.716
// Allow range to handle perspective distortion and slight rotation.
const RATIO_MIN = 0.52
const RATIO_MAX = 0.88

// Output crop size — fixed 5:7 aspect (252:352 = 0.716)
const CARD_OUT_W = 252
const CARD_OUT_H = 352

// Detection working width (downscale large images for speed)
const DETECT_MAX_W = 1024

// Contour must cover at least this fraction of the image area
const MIN_AREA_FRAC = 0.01

// ─── Main export ────────────────────────────────────────────────────────────
export async function detectAndCropCards(imageBuffer: Buffer): Promise<DetectedCard[]> {
  await waitForCV()
  const cv = _cvRaw  // do NOT return _cvRaw from an async function — it's thenable

  const meta = await sharp(imageBuffer).metadata()
  const origW = meta.width ?? 0
  const origH = meta.height ?? 0
  if (!origW || !origH) return []

  // Scale factor: detection runs on a downscaled copy, crops are from the original
  const scale = origW > DETECT_MAX_W ? origW / DETECT_MAX_W : 1
  const dW = Math.round(origW / scale)
  const dH = Math.round(origH / scale)

  // ── Detection image (RGBA, raw) ──────────────────────────────────────────
  const { data: dRaw } = await sharp(imageBuffer)
    .resize(dW, dH, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const src = cv.matFromImageData({
    data: new Uint8ClampedArray(dRaw.buffer, dRaw.byteOffset, dRaw.byteLength),
    width: dW,
    height: dH,
  })

  // ── Pipeline ─────────────────────────────────────────────────────────────
  // RGBA → grey → heavy blur (kills interior card texture) → threshold →
  // erode (separates touching cards) → contours → filter
  //
  // Why threshold instead of Canny: Canny on cards-in-binder captures every
  // artwork edge, then dilation merges them into one giant blob. Brightness
  // threshold works because binder background is consistently dark (~20-40)
  // while cards are bright — one operation separates them cleanly.
  const gray = new cv.Mat()
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
  src.delete()

  const blurred = new cv.Mat()
  cv.GaussianBlur(gray, blurred, new cv.Size(15, 15), 0)
  gray.delete()

  // OTSU automatically picks the dark-binder / bright-card threshold.
  // Returns 0 on uniform/dark images (no bimodal distribution) → bail out early.
  const thresh = new cv.Mat()
  const otsuVal = cv.threshold(blurred, thresh, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU)
  blurred.delete()
  if (otsuVal < 40) {
    thresh.delete()
    return []
  }

  // Erode shrinks white regions slightly → breaks thin touching-card bridges
  const erodeK = cv.Mat.ones(7, 7, cv.CV_8U)
  const eroded = new cv.Mat()
  cv.erode(thresh, eroded, erodeK)
  thresh.delete()
  erodeK.delete()

  const contours = new cv.MatVector()
  const hier = new cv.Mat()
  cv.findContours(eroded, contours, hier, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
  eroded.delete()
  hier.delete()

  // ── Filter contours → card candidates ────────────────────────────────────
  const minArea = dW * dH * MIN_AREA_FRAC

  interface Candidate {
    corners: { x: number; y: number }[]
    cx: number; cy: number
    angle: number
  }
  const candidates: Candidate[] = []

  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i)
    const area = cv.contourArea(contour)
    if (area < minArea) continue

    // Polygon approximation — accept 4–8 vertices (quad, slightly imperfect)
    const peri = cv.arcLength(contour, true)
    const approx = new cv.Mat()
    cv.approxPolyDP(contour, approx, 0.04 * peri, true)
    const nPts = approx.rows
    approx.delete()
    if (nPts < 4 || nPts > 8) continue

    // Oriented bounding box
    const rect = cv.minAreaRect(contour)
    const w = rect.size.width
    const h = rect.size.height
    if (!w || !h) continue

    // Short side / long side must match card ratio
    const ratio = Math.min(w, h) / Math.max(w, h)
    if (ratio < RATIO_MIN || ratio > RATIO_MAX) continue

    const corners = rotatedRectCorners(rect)
    // Normalize angle: minAreaRect may return portrait card as (w>h, angle=90).
    // Subtract 90 so portrait-upright = 0° consistently.
    const angle = rect.size.width > rect.size.height ? rect.angle - 90 : rect.angle
    candidates.push({
      corners,
      cx: rect.center.x,
      cy: rect.center.y,
      angle,
    })
  }
  contours.delete()

  if (candidates.length === 0) return []

  // Sort: row-major (top→bottom, left→right), row tolerance = 15 % of image height
  const rowTol = dH * 0.15
  candidates.sort((a, b) => {
    const rA = Math.floor(a.cy / rowTol)
    const rB = Math.floor(b.cy / rowTol)
    return rA !== rB ? rA - rB : a.cx - b.cx
  })

  // ── Load original-resolution image for high-quality warp ─────────────────
  const { data: origRaw } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const origMat = cv.matFromImageData({
    data: new Uint8ClampedArray(origRaw.buffer, origRaw.byteOffset, origRaw.byteLength),
    width: origW,
    height: origH,
  })

  // Destination points: always the same flat rectangle
  const dstData = [0, 0, CARD_OUT_W, 0, CARD_OUT_W, CARD_OUT_H, 0, CARD_OUT_H]
  const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, dstData)

  const cards: DetectedCard[] = []

  for (let i = 0; i < candidates.length; i++) {
    const { corners, angle } = candidates[i]

    // Scale corners from detection space → original image space
    const origCorners = corners.map(c => ({ x: c.x * scale, y: c.y * scale }))

    // Sort corners: TL → TR → BR → BL (clockwise from top-left)
    const sorted = sortClockwiseFromTL(origCorners)
    const srcData = sorted.flatMap(c => [c.x, c.y])
    const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, srcData)

    const M = cv.getPerspectiveTransform(srcPts, dstPts)
    const warped = new cv.Mat()
    cv.warpPerspective(origMat, warped, M, new cv.Size(CARD_OUT_W, CARD_OUT_H))
    srcPts.delete()
    M.delete()

    // Mat → Buffer → JPEG via sharp
    const rawBuf = Buffer.from(new Uint8Array(warped.data))
    warped.delete()

    let cropBuffer: Buffer
    try {
      cropBuffer = await sharp(rawBuf, {
        raw: { width: CARD_OUT_W, height: CARD_OUT_H, channels: 4 },
      })
        .removeAlpha()
        .jpeg({ quality: 92 })
        .toBuffer()
    } catch {
      continue // skip if warp produced invalid data
    }

    // Axis-aligned bounding box in original image coords
    const xs = origCorners.map(c => c.x)
    const ys = origCorners.map(c => c.y)
    const x = Math.round(Math.max(0, Math.min(...xs)))
    const y = Math.round(Math.max(0, Math.min(...ys)))
    const w = Math.round(Math.min(origW - x, Math.max(...xs) - Math.min(...xs)))
    const h = Math.round(Math.min(origH - y, Math.max(...ys) - Math.min(...ys)))

    cards.push({
      index: cards.length,
      x, y, w, h,
      angle,
      corners: origCorners.map(c => [Math.round(c.x), Math.round(c.y)]),
      cropBuffer,
    })
  }

  dstPts.delete()
  origMat.delete()

  return cards
}

// ─── Manual crop (unchanged) ─────────────────────────────────────────────────
export async function cropCardManual(
  imageBuffer: Buffer,
  x: number, y: number, w: number, h: number
): Promise<Buffer> {
  return sharp(imageBuffer).extract({ left: x, top: y, width: w, height: h }).toBuffer()
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Compute the 4 corners of a RotatedRect using explicit rotation math. */
function rotatedRectCorners(rect: {
  center: { x: number; y: number }
  size: { width: number; height: number }
  angle: number
}) {
  const { center: { x: cx, y: cy }, size: { width: w, height: h }, angle } = rect
  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const hw = w / 2
  const hh = h / 2

  // Un-rotated corners relative to centre
  const local = [
    { x: -hw, y: -hh },
    { x:  hw, y: -hh },
    { x:  hw, y:  hh },
    { x: -hw, y:  hh },
  ]
  return local.map(({ x, y }) => ({
    x: cx + x * cos - y * sin,
    y: cy + x * sin + y * cos,
  }))
}

/**
 * Sort 4 corners clockwise starting from top-left (minimum x+y).
 * Required by getPerspectiveTransform: TL, TR, BR, BL.
 */
function sortClockwiseFromTL(pts: { x: number; y: number }[]) {
  const cx = pts.reduce((s, p) => s + p.x, 0) / 4
  const cy = pts.reduce((s, p) => s + p.y, 0) / 4

  // Sort by angle around centroid (0° = right, going clockwise with y-down)
  const byAngle = [...pts].sort(
    (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
  )

  // Find top-left: minimum (x + y)
  let tlIdx = 0
  let minSum = Infinity
  byAngle.forEach(({ x, y }, i) => {
    if (x + y < minSum) { minSum = x + y; tlIdx = i }
  })

  // Rotate array so TL is first
  return [...byAngle.slice(tlIdx), ...byAngle.slice(0, tlIdx)]
}
