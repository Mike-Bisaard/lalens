'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { displayPrice, formatBahtInput, inputToSatang } from '@/lib/money'

// ── Tokens ────────────────────────────────────────────────────
const C = {
  red: '#ee1c25', redDeep: '#c0141b',
  yellow: '#ffcb05', green: '#2e9e4f', greenDeep: '#207a3c',
  ink: '#1c1b24', muted: '#6b6a76', paper: '#fff',
  bg: '#faf7f2', line: '#eceaee',
  tintRed: '#fff1ef', tintGreen: '#e8f9ef', tintYellow: '#fffbe6',
} as const
const KAN: React.CSSProperties = { fontFamily: '"Kanit", sans-serif' }
const ANU: React.CSSProperties = { fontFamily: '"Anuphan", sans-serif' }

// ── Types ──────────────────────────────────────────────────────
type Step = 'upload' | 'detecting' | 'review' | 'pricing' | 'success'
type CondCode = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'

interface CardItem {
  index: number
  imageDataUrl: string
  name: string
  price: string
  condition: CondCode
}

// ── Constants ──────────────────────────────────────────────────
const STEP_LABELS = ['อัปโหลด', 'ตัดกรอบ', 'ตรวจกรอบ', 'ตั้งราคา', 'สำเร็จ']
const STEP_KEYS: Step[] = ['upload', 'detecting', 'review', 'pricing', 'success']

const CONDITIONS: { code: CondCode; full: string }[] = [
  { code: 'NM', full: 'Near Mint' },
  { code: 'LP', full: 'Light Play' },
  { code: 'MP', full: 'Medium Play' },
  { code: 'HP', full: 'Hard Play' },
  { code: 'DMG', full: 'Damaged' },
]

// ── Stepper ────────────────────────────────────────────────────
function StepperBar({ current }: { current: number }) {
  return (
    <div style={{ background: C.paper, borderBottom: `1.5px solid ${C.line}` }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center' }}>
        {STEP_LABELS.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <div key={label} style={{ display: 'contents' }}>
              {i > 0 && (
                <div style={{ flex: 1, height: 2, background: done ? C.red : C.line, margin: '0 6px', borderRadius: 1 }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: done || active ? C.red : '#f0ede8',
                  color: done || active ? '#fff' : C.muted,
                  display: 'grid', placeItems: 'center',
                  ...KAN, fontWeight: 700, fontSize: 12,
                  outline: active ? `3px solid rgba(238,28,37,.2)` : 'none',
                  outlineOffset: 2,
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{ ...KAN, fontWeight: active ? 700 : 500, fontSize: 11.5, color: active ? C.red : done ? C.ink : C.muted, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Share box ──────────────────────────────────────────────────
function ShareBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, maxWidth: 480, width: '100%' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f3ef', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...ANU, fontSize: 11.5, color: C.muted, marginBottom: 2 }}>ลิงก์หน้าร้านของคุณ</div>
        <div style={{ ...KAN, fontWeight: 700, fontSize: 13.5, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</div>
      </div>
      <button onClick={copy} style={{
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
        ...KAN, fontWeight: 600, fontSize: 13,
        padding: '7px 13px', borderRadius: 10, cursor: 'pointer',
        border: `1.5px solid ${copied ? C.green : C.line}`,
        background: copied ? C.tintGreen : C.paper,
        color: copied ? C.green : C.ink,
        transition: 'all .2s',
      }}>
        {copied
          ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>คัดลอกแล้ว</>
          : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>คัดลอก</>
        }
      </button>
    </div>
  )
}

// ── Crop Modal ─────────────────────────────────────────────────
function CropModal({ imgUrl, onClose, onConfirm }: {
  imgUrl: string
  onClose: () => void
  onConfirm: (dataUrl: string) => void
}) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })

  function getPos(e: React.MouseEvent, el: HTMLElement) {
    const b = el.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(e.clientX - b.left, b.width)),
      y: Math.max(0, Math.min(e.clientY - b.top, b.height)),
    }
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const pos = getPos(e, e.currentTarget)
    setStart(pos)
    setDrawing(true)
    setRect({ x: pos.x, y: pos.y, w: 0, h: 0 })
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!drawing) return
    const pos = getPos(e, e.currentTarget)
    setRect({
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      w: Math.abs(pos.x - start.x),
      h: Math.abs(pos.y - start.y),
    })
  }

  function stopDraw() { setDrawing(false) }

  function handleConfirm() {
    if (!rect || !imgRef.current || rect.w < 10 || rect.h < 10) return
    const img = imgRef.current
    const scaleX = img.naturalWidth / img.clientWidth
    const scaleY = img.naturalHeight / img.clientHeight
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(rect.w * scaleX)
    canvas.height = Math.round(rect.h * scaleY)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, rect.x * scaleX, rect.y * scaleY, rect.w * scaleX, rect.h * scaleY, 0, 0, canvas.width, canvas.height)
    onConfirm(canvas.toDataURL('image/jpeg', 0.9))
  }

  const valid = rect && rect.w >= 10 && rect.h >= 10

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: C.paper, borderRadius: 20, maxWidth: 740, width: '100%', maxHeight: '93vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px -16px rgba(0,0,0,.45)' }}>

        {/* Head */}
        <div style={{ padding: '18px 22px', borderBottom: `1.5px solid ${C.line}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div>
            <b style={{ ...KAN, fontWeight: 700, fontSize: 17, color: C.ink, display: 'block' }}>เพิ่มกรอบเอง</b>
            <span style={{ ...ANU, fontSize: 13, color: C.muted }}>ลากกล่องให้ครอบการ์ดที่ระบบยังไม่เจอ</span>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${C.line}`, background: C.paper, cursor: 'pointer', display: 'grid', placeItems: 'center', color: C.muted, flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Hint */}
        <div style={{ padding: '9px 22px', borderBottom: `1px solid ${C.line}`, background: C.tintYellow, flexShrink: 0 }}>
          <span style={{ ...ANU, fontSize: 12.5, color: '#6b5200' }}>
            เส้นประขาว = กรอบใหม่ที่กำลังวาด &nbsp;·&nbsp; ลากจากมุมหนึ่งไปอีกมุมหนึ่งให้ครอบการ์ด &nbsp;·&nbsp; เส้นประเทา = ที่ตัดกรอบแล้ว
          </span>
        </div>

        {/* Image */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div
            style={{ position: 'relative', display: 'inline-block', cursor: 'crosshair', userSelect: 'none', lineHeight: 0 }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={imgUrl} alt="ต้นฉบับ" draggable={false}
              style={{ display: 'block', maxWidth: '100%', maxHeight: '54vh', borderRadius: 10 }} />
            {rect && rect.w > 4 && rect.h > 4 && (
              <div style={{
                position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h,
                border: '2px dashed #fff', boxShadow: '0 0 0 1.5px rgba(0,0,0,.4)', pointerEvents: 'none',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(238,28,37,.12)' }} />
                {/* corner handles */}
                {([{ top: '-5px', left: '-5px' }, { top: '-5px', right: '-5px' }, { bottom: '-5px', left: '-5px' }, { bottom: '-5px', right: '-5px' }] as React.CSSProperties[]).map((pos, i) => (
                  <div key={i} style={{ position: 'absolute', width: 10, height: 10, background: '#fff', border: `2px solid ${C.red}`, borderRadius: 2, ...pos }} />
                ))}
                <span style={{ position: 'absolute', top: 5, left: 7, ...KAN, fontWeight: 700, fontSize: 10, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,.6)', pointerEvents: 'none' }}>กรอบใหม่</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: `1.5px solid ${C.line}`, display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 13, border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink, cursor: 'pointer', ...KAN, fontWeight: 600, fontSize: 15 }}>ยกเลิก</button>
          <button onClick={handleConfirm} disabled={!valid} style={{
            flex: 2, padding: '12px 0', borderRadius: 13, border: 'none',
            background: valid ? C.red : '#e0dde3', color: valid ? '#fff' : C.muted,
            cursor: valid ? 'pointer' : 'not-allowed', ...KAN, fontWeight: 700, fontSize: 15,
            boxShadow: valid ? `0 4px 0 ${C.redDeep}` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            ยืนยันเพิ่มกรอบ
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function NewListingView({ shopSlug }: { shopSlug: string }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('upload')
  const [detectError, setDetectError] = useState<string | null>(null)
  const [cards, setCards] = useState<CardItem[]>([])
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string>('')
  const [publishing, setPublishing] = useState(false)
  const [cropModal, setCropModal] = useState(false)
  const [batchId, setBatchId] = useState('')
  const [previewCard, setPreviewCard] = useState<{ dataUrl: string; index: number } | null>(null)

  const activeCards = cards
  const totalValue = activeCards.reduce((s, c) => s + inputToSatang(c.price), 0)
  const stepIdx = STEP_KEYS.indexOf(step)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${shopSlug}${batchId ? `?batch=${batchId}` : ''}`
    : `https://web-kappa-nine-28.vercel.app/${shopSlug}${batchId ? `?batch=${batchId}` : ''}`

  // ── Detect ────────────────────────────────────────────────────
  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { setDetectError('ไฟล์ใหญ่เกินไป (สูงสุด 20 MB)'); return }

    setOriginalFile(file)
    setOriginalUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file) })
    setDetectError(null)
    setStep('detecting')

    try {
      const fd = new FormData(); fd.append('image', file)
      const ctrl = new AbortController()
      const to = setTimeout(() => ctrl.abort(), 30_000)
      let res: Response
      try { res = await fetch('/api/upload/detect', { method: 'POST', body: fd, signal: ctrl.signal }) }
      finally { clearTimeout(to) }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 413 || err.error === 'file_too_large') throw new Error('ไฟล์ใหญ่เกินไป (สูงสุด 20 MB)')
        if (res.status === 504 || err.error === 'detection_timeout') throw new Error('ใช้เวลานานเกินไป — ลองรูปที่เล็กกว่านี้')
        throw new Error(err.error ?? `เกิดข้อผิดพลาด (${res.status})`)
      }

      const data = await res.json()
      if (!data.cards?.length) throw new Error('ไม่พบการ์ดในรูป — ลองถ่ายบนพื้นที่ตัดกัน แสงสว่างพอ')

      setCards(data.cards.map((c: { index: number; imageDataUrl: string }) => ({ ...c, name: '', price: '', condition: 'NM' as CondCode })))
      setStep('review')
    } catch (err) {
      setDetectError(err instanceof Error ? (err.name === 'AbortError' ? 'หมดเวลา — ลองรูปที่เล็กกว่านี้' : err.message) : 'เกิดข้อผิดพลาดที่ไม่คาดคิด')
      setStep('upload')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 })

  // ── Publish ───────────────────────────────────────────────────
  async function handlePublish() {
    if (!originalFile || publishing) return
    setPublishing(true)
    const fd = new FormData()
    fd.append('image', originalFile)
    fd.append('cards', JSON.stringify(activeCards))
    const res = await fetch('/api/upload/publish', { method: 'POST', body: fd })
    setPublishing(false)
    if (res.ok) {
      const { batchId: id } = await res.json()
      setBatchId(id)
      setStep('success')
    } else {
      const err = await res.json().catch(() => ({}))
      alert(`เกิดข้อผิดพลาด: ${err.error ?? res.status}`)
    }
  }

  function handleCropConfirm(dataUrl: string) {
    setCards(prev => [...prev, { index: prev.length, imageDataUrl: dataUrl, name: '', price: '', condition: 'NM' }])
    setCropModal(false)
  }

  function removeCard(i: number) {
    setCards(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateCard(i: number, patch: Partial<CardItem>) {
    setCards(prev => prev.map((c, idx) => idx === i ? { ...c, ...patch } : c))
  }

  function resetAll() {
    setStep('upload'); setCards([])
    setOriginalFile(null)
    if (originalUrl) { URL.revokeObjectURL(originalUrl); setOriginalUrl('') }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, ...ANU }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background: C.paper, borderBottom: `1.5px solid ${C.line}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.red, display: 'grid', placeItems: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2.5 4.5 5.5v6c0 5 3.5 8 7.5 9.5 4-1.5 7.5-4.5 7.5-9.5v-6L12 2.5Z"/></svg>
            </div>
            <span style={{ ...KAN, fontWeight: 700, fontSize: 17, color: C.ink }}>ละเล่น</span>
          </div>
          <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, ...ANU, fontSize: 13.5, color: C.muted, background: 'none', border: `1.5px solid ${C.line}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            กลับแดชบอร์ด
          </button>
        </div>
      </div>

      {/* Stepper */}
      <StepperBar current={stepIdx} />

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px 140px' }}>

        {/* ── Upload ──────────────────────────────────────────── */}
        {step === 'upload' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ ...KAN, fontWeight: 800, fontSize: 25, color: C.ink, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: C.tintRed, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </span>
                ลงขายแบบยกกอง
              </h1>
              <p style={{ ...ANU, fontSize: 15, color: C.muted, margin: 0 }}>ถ่ายรูปการ์ดหลายใบในรูปเดียว ระบบจะตัดกรอบแยกให้เอง — ไม่ต้องถ่ายทีละใบ</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 26, alignItems: 'stretch' }}>
              {/* Drop zone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div {...getRootProps()} style={{
                  flex: 1,
                  border: `2.5px dashed ${isDragActive ? C.red : '#d8d3ca'}`,
                  borderRadius: 18, textAlign: 'center', cursor: 'pointer',
                  background: isDragActive ? C.tintRed : '#faf9f7',
                  transition: 'border-color .15s, background .15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '40px 28px',
                }}>
                  <input {...getInputProps()} />
                  <div style={{ width: 74, height: 74, borderRadius: 22, background: isDragActive ? C.redDeep : C.red, display: 'grid', placeItems: 'center', margin: '0 auto 18px', boxShadow: `0 6px 0 ${isDragActive ? '#8a0e13' : C.redDeep}`, transition: 'background .15s' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                  <p style={{ ...KAN, fontWeight: 700, fontSize: 20, color: C.ink, margin: '0 0 8px' }}>
                    {isDragActive ? 'วางรูปได้เลย' : 'ลากรูปมาวาง หรือ คลิกเพื่อเลือกรูป'}
                  </p>
                  <p style={{ ...ANU, fontSize: 14, color: C.muted, margin: 0 }}>รองรับหลายใบในรูปเดียว · JPG / PNG / HEIC</p>
                </div>

                {detectError && (
                  <div style={{ background: C.tintRed, border: `1.5px solid #ffc5c0`, borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <div>
                      <b style={{ ...KAN, fontWeight: 600, fontSize: 13.5, color: C.red, display: 'block', marginBottom: 2 }}>ตรวจจับไม่สำเร็จ</b>
                      <span style={{ ...ANU, fontSize: 13, color: '#9b3a35' }}>{detectError}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tips + Example */}
              <div style={{ background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 16, padding: '20px 22px' }}>
                <div style={{ background: '#eff6ff', borderRadius: 14, padding: '18px 20px', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 17 }}>📸</span>
                    <b style={{ ...KAN, fontWeight: 700, fontSize: 14.5, color: '#1e40af' }}>ถ่ายให้ตัดกรอบแม่นๆ</b>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {['วางการ์ดเรียงกัน อย่าให้ซ้อนทับ', 'แสงสว่างพอ ไม่มีเงาทับการ์ด', 'ถ่ายตรงๆ จากด้านบน เห็นทั้งใบ'].map(tip => (
                      <div key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#dbeafe', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                        </div>
                        <span style={{ ...ANU, fontSize: 13.5, color: C.ink, lineHeight: 1.45 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={C.yellow} stroke={C.yellow} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style={{ ...ANU, fontSize: 13, color: C.muted }}>ตัวอย่างรูปที่ดี</span>
                </div>
                {/* Group photo mockup */}
                <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(150deg,#2b2620,#191510)', padding: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      'linear-gradient(150deg,#b5470b,#e8692a)',
                      'linear-gradient(150deg,#1a5a8a,#2a8fd0)',
                      'linear-gradient(150deg,#1a7a40,#27b55a)',
                      'linear-gradient(150deg,#6b2a8a,#b040e0)',
                      'linear-gradient(150deg,#8a6a1a,#d4a820)',
                      'linear-gradient(150deg,#8a1a2a,#c84060)',
                    ].map((bg, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <div style={{ aspectRatio: '63/88', borderRadius: 8, background: bg, border: '1.5px solid rgba(255,255,255,.15)', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '8%', gap: '6%' }}>
                          <div style={{ height: '14%', background: 'rgba(255,255,255,.15)', borderRadius: 3 }} />
                          <div style={{ flex: 1, borderRadius: 5, background: 'rgba(0,0,0,.25)', display: 'grid', placeItems: 'center' }}>
                            <div style={{ width: '45%', aspectRatio: '1', borderRadius: '50%', background: 'rgba(255,255,255,.25)' }} />
                          </div>
                          <div style={{ height: '12%', background: 'rgba(255,255,255,.12)', borderRadius: 3 }} />
                        </div>
                        <div style={{ position: 'absolute', inset: '-7%', border: `2px dashed ${C.yellow}`, borderRadius: 9, pointerEvents: 'none' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Detecting ───────────────────────────────────────── */}
        {step === 'detecting' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, gap: 20, textAlign: 'center' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: C.tintRed, display: 'grid', placeItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${C.red}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            </div>
            <div>
              <b style={{ ...KAN, fontWeight: 700, fontSize: 22, color: C.ink, display: 'block', marginBottom: 8 }}>กำลังตัดกรอบการ์ด…</b>
              <span style={{ ...ANU, fontSize: 14.5, color: C.muted }}>ระบบกำลังวิเคราะห์รูปและแยกการ์ดแต่ละใบ อาจใช้เวลา 5–15 วินาที</span>
            </div>
          </div>
        )}

        {/* ── Review ──────────────────────────────────────────── */}
        {step === 'review' && (
          <div>
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ ...KAN, fontWeight: 800, fontSize: 24, color: C.ink, margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: C.tintYellow, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d48806" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </span>
                ตรวจกรอบการ์ด
              </h1>
              <p style={{ ...ANU, fontSize: 14.5, color: C.muted, margin: 0 }}>ดูว่าระบบตัดกรอบครบทุกใบไหม เอาใบที่ไม่ใช่ออก หรือเพิ่มกรอบที่ตกหล่นเอง</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.tintGreen, border: `1.5px solid #b8edcc`, borderRadius: 999, padding: '5px 14px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                <span style={{ ...KAN, fontWeight: 700, fontSize: 13, color: C.greenDeep }}>ระบบเจอ {activeCards.length} ใบ</span>
              </div>
              <button onClick={() => setCropModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, ...KAN, fontWeight: 600, fontSize: 13.5, color: C.red, background: C.tintRed, border: `1.5px solid #ffcec9`, borderRadius: 10, padding: '7px 14px', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                เพิ่มกรอบเอง
              </button>
            </div>

            <div style={{ background: C.tintYellow, border: `1px solid #f0e4b0`, borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d48806" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              <span style={{ ...ANU, fontSize: 13, color: '#6b5200' }}>แตะ ✕ ที่ใบที่ไม่ใช่เพื่อเอาออก · ตกหล่นใบไหน กด "เพิ่มกรอบเอง" แล้วลากกรอบบนรูปเดิม</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
              {cards.map((card, i) => (
                <div key={i} style={{ position: 'relative', cursor: 'zoom-in' }} onClick={() => card.imageDataUrl && setPreviewCard({ dataUrl: card.imageDataUrl, index: i })}>
                  <div style={{ aspectRatio: '63/88', borderRadius: 10, overflow: 'hidden', background: '#f0ede8', border: `2px solid ${C.green}` }}>
                    {card.imageDataUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.imageDataUrl} alt={`card-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    )}
                  </div>
                  <div style={{ position: 'absolute', top: 5, left: 5, width: 20, height: 20, borderRadius: '50%', background: 'rgba(28,27,36,.7)', color: '#fff', display: 'grid', placeItems: 'center', ...KAN, fontWeight: 700, fontSize: 10 }}>
                    {i + 1}
                  </div>
                  <button onClick={e => { e.stopPropagation(); removeCard(i) }} style={{
                    position: 'absolute', top: 4, right: 4, width: 24, height: 24,
                    borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: C.red, color: '#fff',
                    display: 'grid', placeItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,.3)',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Pricing ─────────────────────────────────────────── */}
        {step === 'pricing' && (
          <div>
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ ...KAN, fontWeight: 800, fontSize: 24, color: C.ink, margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: '#e8f2ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2a75bb" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                </span>
                ตั้งราคาและสภาพ
              </h1>
              <p style={{ ...ANU, fontSize: 14.5, color: C.muted, margin: 0 }}>แก้ทีละใบได้เลย — ระบบเติมค่าแนะนำให้แล้ว</p>
            </div>

            <div style={{ background: C.tintYellow, border: `1.5px solid #f5e4a0`, borderRadius: 12, padding: '11px 16px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill={C.yellow} stroke={C.yellow} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{ ...ANU, fontSize: 13.5, color: '#6b5200', flex: 1 }}>ระบบเติมสภาพ <b>NM (Near Mint)</b> ให้แล้ว แก้เฉพาะที่อยากแก้</span>
              <button onClick={() => setCards(prev => prev.map(c => ({ ...c, condition: 'NM' })))} style={{ ...KAN, fontWeight: 600, fontSize: 12.5, color: '#7a5c00', background: 'none', border: `1.5px solid #e5d080`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                รีเซ็ตค่าแนะนำ
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
              {activeCards.map((card, activeIdx) => {
                const realIdx = cards.indexOf(card)
                return (
                  <div key={card.index} style={{ background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 16, overflow: 'hidden' }}>
                    {/* Thumbnail */}
                    <div style={{ height: 160, background: '#f0ede8', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {card.imageDataUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.imageDataUrl} alt={`card-${activeIdx}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
                      )}
                      <div style={{ position: 'absolute', top: 8, left: 8, ...KAN, fontWeight: 700, fontSize: 11, background: 'rgba(28,27,36,.55)', color: '#fff', borderRadius: 6, padding: '2px 7px' }}>#{activeIdx + 1}</div>
                    </div>

                    <div style={{ padding: '13px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Name */}
                      <div>
                        <label style={{ ...KAN, fontWeight: 500, fontSize: 12, color: C.muted, display: 'block', marginBottom: 5 }}>ชื่อการ์ด (เว้นว่างได้)</label>
                        <input type="text" placeholder={`การ์ด #${activeIdx + 1}`} value={card.name}
                          onChange={e => updateCard(realIdx, { name: e.target.value })}
                          style={{ width: '100%', border: `1.5px solid ${C.line}`, borderRadius: 9, padding: '8px 11px', fontSize: 14, ...ANU, background: '#faf9f7', color: C.ink, outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => { e.target.style.borderColor = C.red; e.target.style.boxShadow = '0 0 0 3px rgba(238,28,37,.1)' }}
                          onBlur={e => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none' }}
                        />
                      </div>

                      {/* Condition */}
                      <div>
                        <label style={{ ...KAN, fontWeight: 500, fontSize: 12, color: C.muted, display: 'block', marginBottom: 7 }}>สภาพการ์ด</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {CONDITIONS.map(cond => {
                            const active = card.condition === cond.code
                            return (
                              <button key={cond.code} onClick={() => updateCard(realIdx, { condition: cond.code })} style={{
                                ...KAN, fontWeight: active ? 700 : 500, fontSize: 11,
                                padding: '4px 8px', borderRadius: 7, cursor: 'pointer',
                                border: `1.5px solid ${active ? C.red : C.line}`,
                                background: active ? C.tintRed : C.paper,
                                color: active ? C.red : C.muted, whiteSpace: 'nowrap',
                              }}>
                                {cond.code} ({cond.full})
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Price */}
                      <div>
                        <label style={{ ...KAN, fontWeight: 500, fontSize: 12, color: C.muted, display: 'block', marginBottom: 5 }}>ราคา (บาท)</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', ...KAN, fontWeight: 600, color: C.muted, fontSize: 14, pointerEvents: 'none' }}>฿</span>
                          <input type="text" inputMode="numeric" placeholder="0" value={card.price}
                            onChange={e => updateCard(realIdx, { price: formatBahtInput(e.target.value) })}
                            style={{ width: '100%', border: `1.5px solid ${C.line}`, borderRadius: 9, padding: '8px 11px 8px 25px', fontSize: 14, ...KAN, fontWeight: 600, background: '#faf9f7', color: C.ink, outline: 'none', boxSizing: 'border-box' }}
                            onFocus={e => { e.target.style.borderColor = C.red; e.target.style.boxShadow = '0 0 0 3px rgba(238,28,37,.1)' }}
                            onBlur={e => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Success ─────────────────────────────────────────── */}
        {step === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.tintGreen, display: 'grid', placeItems: 'center', marginBottom: 20 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 style={{ ...KAN, fontWeight: 800, fontSize: 27, color: C.ink, margin: '0 0 8px' }}>
              ขึ้นขายแล้ว <span style={{ color: C.red }}>{activeCards.length} ใบ</span> 🎉
            </h1>
            <p style={{ ...ANU, fontSize: 15, color: C.muted, margin: '0 0 28px', maxWidth: 440, lineHeight: 1.6 }}>
              แชร์ลิงก์หน้าร้านลงโซเชียลได้เลย ลูกค้าแตะการ์ดในรูปแล้วจ่ายจบในเว็บ
            </p>

            <ShareBox url={shareUrl} />

            <div style={{ display: 'flex', gap: 20, marginTop: 26, marginBottom: 32 }}>
              <div style={{ background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: '16px 32px', textAlign: 'center' }}>
                <div style={{ ...KAN, fontWeight: 800, fontSize: 30, color: C.ink }}>{activeCards.length}</div>
                <div style={{ ...ANU, fontSize: 13, color: C.muted, marginTop: 3 }}>ใบที่ขึ้นขาย</div>
              </div>
              <div style={{ background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: '16px 32px', textAlign: 'center' }}>
                <div style={{ ...KAN, fontWeight: 800, fontSize: 30, color: C.ink }}>{displayPrice(totalValue)}</div>
                <div style={{ ...ANU, fontSize: 13, color: C.muted, marginTop: 3 }}>มูลค่ารวม</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={resetAll} style={{ display: 'flex', alignItems: 'center', gap: 7, ...KAN, fontWeight: 700, fontSize: 15, padding: '13px 22px', borderRadius: 13, border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink, cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                ลงกองใหม่
              </button>
              <a href={`/${shopSlug}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 7, ...KAN, fontWeight: 700, fontSize: 15, padding: '13px 22px', borderRadius: 13, border: 'none', background: C.red, color: '#fff', textDecoration: 'none', boxShadow: `0 4px 0 ${C.redDeep}` }}>
                ดูหน้าร้าน →
              </a>
            </div>
          </div>
        )}

      </div>

      {/* ── Sticky action bar ──────────────────────────────────── */}
      {(step === 'review' || step === 'pricing') && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: C.paper, borderTop: `1.5px solid ${C.line}`, boxShadow: '0 -4px 20px rgba(0,0,0,.07)', padding: '14px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, ...ANU, fontSize: 14, color: C.muted }}>
              {step === 'review' && <>ตรวจแล้ว <b style={{ color: C.ink }}>{activeCards.length} ใบ</b> · พร้อมตั้งราคา</>}
              {step === 'pricing' && <>รวม <b style={{ color: C.ink }}>{activeCards.length} ใบ</b> · มูลค่า <b style={{ color: C.ink }}>{displayPrice(totalValue)}</b></>}
            </div>

            <button onClick={() => step === 'review' ? setStep('upload') : setStep('review')} style={{ ...KAN, fontWeight: 600, fontSize: 14, padding: '10px 18px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink, cursor: 'pointer' }}>
              ย้อนกลับ
            </button>

            {step === 'review' && (
              <button onClick={() => setStep('pricing')} disabled={activeCards.length === 0} style={{
                ...KAN, fontWeight: 700, fontSize: 15, padding: '11px 24px', borderRadius: 12, border: 'none',
                background: activeCards.length > 0 ? C.red : '#e0dde3',
                color: activeCards.length > 0 ? '#fff' : C.muted,
                cursor: activeCards.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: activeCards.length > 0 ? `0 4px 0 ${C.redDeep}` : 'none',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                ถัดไป · ตั้งราคา
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            )}

            {step === 'pricing' && (
              <button onClick={handlePublish} disabled={publishing || activeCards.length === 0} style={{
                ...KAN, fontWeight: 700, fontSize: 15, padding: '11px 24px', borderRadius: 12, border: 'none',
                background: (!publishing && activeCards.length > 0) ? C.red : '#e0dde3',
                color: (!publishing && activeCards.length > 0) ? '#fff' : C.muted,
                cursor: (!publishing && activeCards.length > 0) ? 'pointer' : 'not-allowed',
                boxShadow: (!publishing && activeCards.length > 0) ? `0 4px 0 ${C.redDeep}` : 'none',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                {publishing ? (
                  <><div style={{ width: 15, height: 15, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,.35)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />กำลังขึ้นขาย…</>
                ) : (
                  <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2.5 4.5 5.5v6c0 5 3.5 8 7.5 9.5 4-1.5 7.5-4.5 7.5-9.5v-6L12 2.5Z"/></svg>ขึ้นขายทั้งหมด {activeCards.length} ใบ</>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Card preview lightbox */}
      {previewCard && (
        <div
          onClick={() => setPreviewCard(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxHeight: '90vh', maxWidth: 'min(360px, 90vw)', width: '100%' }}>
            {/* Card number badge */}
            <div style={{ position: 'absolute', top: -12, left: -12, width: 30, height: 30, borderRadius: '50%', background: C.red, color: '#fff', display: 'grid', placeItems: 'center', ...KAN, fontWeight: 700, fontSize: 13, border: '2.5px solid #fff', zIndex: 1, boxShadow: '0 3px 10px rgba(0,0,0,.4)' }}>
              {previewCard.index + 1}
            </div>
            {/* Close button */}
            <button
              onClick={() => setPreviewCard(null)}
              style={{ position: 'absolute', top: -12, right: -12, width: 30, height: 30, borderRadius: '50%', background: C.ink, color: '#fff', border: '2.5px solid #fff', display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 1, boxShadow: '0 3px 10px rgba(0,0,0,.4)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewCard.dataUrl}
              alt={`card-${previewCard.index + 1}`}
              style={{ width: '100%', aspectRatio: '63/88', objectFit: 'cover', borderRadius: 16, display: 'block', boxShadow: '0 24px 60px rgba(0,0,0,.6)' }}
            />
            <p style={{ ...ANU, textAlign: 'center', color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 12, margin: '12px 0 0' }}>กดนอกรูปหรือ ✕ เพื่อปิด</p>
          </div>
        </div>
      )}

      {/* Crop modal */}
      {cropModal && originalUrl && (
        <CropModal imgUrl={originalUrl} onClose={() => setCropModal(false)} onConfirm={handleCropConfirm} />
      )}
    </div>
  )
}
