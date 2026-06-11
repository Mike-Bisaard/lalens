// lib/cv/crop.ts
import sharp from "sharp";
import { createRequire } from "module";
import path from "path";
var _require = createRequire(path.join(process.cwd(), "_anchor.js"));
var _cvRaw = _require("@techstark/opencv-js");
var _cvPromise = null;
async function getCV() {
  console.log("getCV: called, _cvPromise null?", _cvPromise === null, "Mat?", typeof _cvRaw.Mat);
  if (_cvPromise) return _cvPromise;
  _cvPromise = (async () => {
    console.log("getCV iife: Mat?", typeof _cvRaw.Mat);
    if (!_cvRaw.Mat) {
      console.log("getCV: waiting for WASM...");
      await new Promise((resolve) => {
        _cvRaw.onRuntimeInitialized = () => { console.log("getCV: callback!"); resolve(); };
        const poll = setInterval(() => {
          console.log("getCV poll: Mat?", typeof _cvRaw.Mat);
          if (_cvRaw.Mat) {
            clearInterval(poll);
            resolve();
          }
        }, 500);
        setTimeout(() => { console.log("getCV: 5s timeout, Mat?", typeof _cvRaw.Mat); clearInterval(poll); resolve(); }, 5000);
      });
    }
    console.log("getCV: returning cv, Mat?", typeof _cvRaw.Mat);
    return _cvRaw;
  })();
  return _cvPromise;
}
var RATIO_MIN = 0.52;
var RATIO_MAX = 0.88;
var CARD_OUT_W = 252;
var CARD_OUT_H = 352;
var DETECT_MAX_W = 1024;
var MIN_AREA_FRAC = 0.012;
async function detectAndCropCards(imageBuffer) { console.log("DCC:start");
  const cv = await getCV(); console.log("DCC:cv ok Mat=" + typeof cv.Mat);
  console.log("DCC:meta..."); const meta = await sharp(imageBuffer).metadata(); console.log("DCC:meta ok " + meta.width);
  const origW = meta.width ?? 0;
  const origH = meta.height ?? 0;
  if (!origW || !origH) return [];
  const scale = origW > DETECT_MAX_W ? origW / DETECT_MAX_W : 1;
  const dW = Math.round(origW / scale);
  const dH = Math.round(origH / scale);
  const { data: dRaw } = await sharp(imageBuffer).resize(dW, dH, { fit: "fill" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const src = cv.matFromImageData({
    data: new Uint8ClampedArray(dRaw.buffer, dRaw.byteOffset, dRaw.byteLength),
    width: dW,
    height: dH
  });
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  src.delete();
  const blurred = new cv.Mat();
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 1);
  gray.delete();
  const edges = new cv.Mat();
  cv.Canny(blurred, edges, 50, 150);
  blurred.delete();
  const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  const dilated = new cv.Mat();
  cv.dilate(edges, dilated, kernel, new cv.Point(-1, -1), 2);
  edges.delete();
  kernel.delete();
  const contours = new cv.MatVector();
  const hier = new cv.Mat();
  cv.findContours(dilated, contours, hier, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  dilated.delete();
  hier.delete();
  const minArea = dW * dH * MIN_AREA_FRAC;
  const candidates = [];
  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const area = cv.contourArea(contour);
    if (area < minArea) continue;
    const peri = cv.arcLength(contour, true);
    const approx = new cv.Mat();
    cv.approxPolyDP(contour, approx, 0.02 * peri, true);
    const nPts = approx.rows;
    approx.delete();
    if (nPts < 4 || nPts > 6) continue;
    const rect = cv.minAreaRect(contour);
    const w = rect.size.width;
    const h = rect.size.height;
    if (!w || !h) continue;
    const ratio = Math.min(w, h) / Math.max(w, h);
    if (ratio < RATIO_MIN || ratio > RATIO_MAX) continue;
    const corners = rotatedRectCorners(rect);
    candidates.push({
      corners,
      cx: rect.center.x,
      cy: rect.center.y,
      angle: rect.angle
    });
  }
  contours.delete();
  if (candidates.length === 0) return [];
  const rowTol = dH * 0.15;
  candidates.sort((a, b) => {
    const rA = Math.floor(a.cy / rowTol);
    const rB = Math.floor(b.cy / rowTol);
    return rA !== rB ? rA - rB : a.cx - b.cx;
  });
  const { data: origRaw } = await sharp(imageBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const origMat = cv.matFromImageData({
    data: new Uint8ClampedArray(origRaw.buffer, origRaw.byteOffset, origRaw.byteLength),
    width: origW,
    height: origH
  });
  const dstData = [0, 0, CARD_OUT_W, 0, CARD_OUT_W, CARD_OUT_H, 0, CARD_OUT_H];
  const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, dstData);
  const cards = [];
  for (let i = 0; i < candidates.length; i++) {
    const { corners, angle } = candidates[i];
    const origCorners = corners.map((c) => ({ x: c.x * scale, y: c.y * scale }));
    const sorted = sortClockwiseFromTL(origCorners);
    const srcData = sorted.flatMap((c) => [c.x, c.y]);
    const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, srcData);
    const M = cv.getPerspectiveTransform(srcPts, dstPts);
    const warped = new cv.Mat();
    cv.warpPerspective(origMat, warped, M, new cv.Size(CARD_OUT_W, CARD_OUT_H));
    srcPts.delete();
    M.delete();
    const rawBuf = Buffer.from(new Uint8Array(warped.data));
    warped.delete();
    let cropBuffer;
    try {
      cropBuffer = await sharp(rawBuf, {
        raw: { width: CARD_OUT_W, height: CARD_OUT_H, channels: 4 }
      }).removeAlpha().jpeg({ quality: 92 }).toBuffer();
    } catch {
      continue;
    }
    const xs = origCorners.map((c) => c.x);
    const ys = origCorners.map((c) => c.y);
    const x = Math.round(Math.max(0, Math.min(...xs)));
    const y = Math.round(Math.max(0, Math.min(...ys)));
    const w = Math.round(Math.min(origW - x, Math.max(...xs) - Math.min(...xs)));
    const h = Math.round(Math.min(origH - y, Math.max(...ys) - Math.min(...ys)));
    cards.push({
      index: cards.length,
      x,
      y,
      w,
      h,
      angle,
      corners: origCorners.map((c) => [Math.round(c.x), Math.round(c.y)]),
      cropBuffer
    });
  }
  dstPts.delete();
  origMat.delete();
  return cards;
}
async function cropCardManual(imageBuffer, x, y, w, h) {
  return sharp(imageBuffer).extract({ left: x, top: y, width: w, height: h }).toBuffer();
}
function rotatedRectCorners(rect) {
  const { center: { x: cx, y: cy }, size: { width: w, height: h }, angle } = rect;
  const rad = angle * Math.PI / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hw = w / 2;
  const hh = h / 2;
  const local = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh }
  ];
  return local.map(({ x, y }) => ({
    x: cx + x * cos - y * sin,
    y: cy + x * sin + y * cos
  }));
}
function sortClockwiseFromTL(pts) {
  const cx = pts.reduce((s, p) => s + p.x, 0) / 4;
  const cy = pts.reduce((s, p) => s + p.y, 0) / 4;
  const byAngle = [...pts].sort(
    (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
  );
  let tlIdx = 0;
  let minSum = Infinity;
  byAngle.forEach(({ x, y }, i) => {
    if (x + y < minSum) {
      minSum = x + y;
      tlIdx = i;
    }
  });
  return [...byAngle.slice(tlIdx), ...byAngle.slice(0, tlIdx)];
}
export {
  cropCardManual,
  detectAndCropCards
};
