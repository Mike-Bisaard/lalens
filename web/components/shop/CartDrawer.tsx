'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { Shop, Card } from '@/types'
import { displayPrice } from '@/lib/money'

interface Props {
  isOpen: boolean
  onClose: () => void
  cart: Card[]
  shop: Shop
  onRemove: (id: string) => void
}

// ── Design tokens ──────────────────────────────────────────────────────────────
const KAN: React.CSSProperties = { fontFamily: '"Kanit", sans-serif' }
const ANU: React.CSSProperties = { fontFamily: '"Anuphan", sans-serif' }

type Step = 'cart' | 'payment' | 'verifying' | 'success' | 'fail'

// ── Countdown ──────────────────────────────────────────────────────────────────
function Countdown({ expiresAt }: { expiresAt: string }) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const update = () => setSecs(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [expiresAt])

  const mins = Math.floor(secs / 60)
  const s = secs % 60
  const isUrgent = secs > 0 && secs < 120
  const expired = secs === 0

  if (expired) return (
    <div style={{ background: '#fff1ef', border: '1.5px solid #f3c0bd', borderRadius: 13, padding: '13px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 18 }}>⏱</span>
      <div>
        <p style={{ ...KAN, fontWeight: 700, fontSize: 14, color: '#ee1c25', margin: 0 }}>หมดเวลาแล้ว</p>
        <p style={{ ...ANU, fontSize: 13, color: '#b04030', margin: 0 }}>การจองถูกยกเลิก กรุณาเลือกใหม่อีกครั้ง</p>
      </div>
    </div>
  )

  return (
    <div style={{ background: isUrgent ? '#fff1ef' : '#fff5e0', border: `1.5px solid ${isUrgent ? '#f3c0bd' : '#f3dca0'}`, borderRadius: 13, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16, color: isUrgent ? '#ee1c25' : '#d98800' }}>⏱</span>
        <span style={{ ...ANU, fontSize: 13.5, color: isUrgent ? '#b04030' : '#7a5a16' }}>เวลาจองที่เหลือ</span>
      </div>
      <span style={{ ...KAN, fontWeight: 700, fontSize: 22, color: isUrgent ? '#ee1c25' : '#d98800', fontVariantNumeric: 'tabular-nums' }}>
        {mins}:{s.toString().padStart(2, '0')}
      </span>
    </div>
  )
}

// ── Slip upload ────────────────────────────────────────────────────────────────
function SlipUpload({ orderId, onSuccess, onFail }: {
  orderId: string
  onSuccess: () => void
  onFail: (msg: string) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function pickFile(f: File) {
    setFile(f)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  async function handleVerify() {
    if (!file || loading) return
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const res = await fetch('/api/slip/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, slipUrl: reader.result }),
      })
      const data = await res.json()
      setLoading(false)
      if (data.success) {
        onSuccess()
      } else {
        onFail(
          data.error === 'slip_mismatch'  ? 'ยอดหรือบัญชีไม่ตรง กรุณาตรวจสอบ' :
          data.error === 'duplicate_slip' ? 'สลิปนี้ถูกใช้ไปแล้ว' :
          data.error === 'order_expired'  ? 'ออเดอร์หมดเวลา กรุณาเลือกการ์ดใหม่' :
          'ตรวจสอบไม่ผ่าน กรุณาลองอีกครั้ง'
        )
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <p style={{ ...KAN, fontWeight: 600, fontSize: 14, color: '#1c1b24', marginBottom: 10 }}>แนบสลิปการโอนเงิน</p>

      <label style={{ display: 'block', cursor: 'pointer' }}>
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f) }} />
        {preview ? (
          <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '2px solid #ee1c25', background: '#fff1ef' }}>
            <img src={preview} alt="slip" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(238,28,37,.85)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>✓</span>
              <span style={{ ...KAN, fontWeight: 600, fontSize: 13, color: '#fff' }}>{file?.name}</span>
              <span style={{ ...ANU, fontSize: 12, color: 'rgba(255,255,255,.8)', marginLeft: 'auto' }}>แตะเพื่อเปลี่ยน</span>
            </div>
          </div>
        ) : (
          <div style={{ border: '2px dashed #eceaee', borderRadius: 14, padding: '32px 20px', textAlign: 'center', background: '#faf7f2', transition: 'border-color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#ee1c25')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#eceaee')}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>📎</div>
            <p style={{ ...KAN, fontWeight: 600, fontSize: 14.5, color: '#1c1b24', margin: '0 0 4px' }}>แตะเพื่อเลือกสลิป</p>
            <p style={{ ...ANU, fontSize: 13, color: '#6b6a76', margin: 0 }}>รองรับ JPG, PNG</p>
          </div>
        )}
      </label>

      <button
        onClick={handleVerify}
        disabled={!file || loading}
        style={{
          width: '100%', marginTop: 14, padding: '15px',
          background: (!file || loading) ? '#ededf0' : '#ee1c25',
          color: (!file || loading) ? '#a1a1aa' : '#fff',
          border: 'none', borderRadius: 14,
          ...KAN, fontWeight: 600, fontSize: 16,
          cursor: (!file || loading) ? 'not-allowed' : 'pointer',
          boxShadow: (file && !loading) ? '0 4px 0 #c0141b' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background .15s, box-shadow .15s',
        }}
      >
        {loading ? (
          <>
            <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }} />
            กำลังตรวจสอบสลิป…
          </>
        ) : '✓ ส่งสลิปเพื่อยืนยัน'}
      </button>
    </div>
  )
}

// ── Main CartDrawer ────────────────────────────────────────────────────────────
export default function CartDrawer({ isOpen, onClose, cart, shop, onRemove }: Props) {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<Step>('cart')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [failMsg, setFailMsg] = useState('')
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => { setStep('cart'); setError(''); setFailMsg('') }, 300)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  const total = cart.reduce((s, c) => s + c.price, 0)
  const maskedAccount = `•••• •••• ${shop.bank_account_last4 ?? '????'}`

  async function handleCheckout() {
    if (!email || loading || cart.length === 0) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardIds: cart.map(c => c.id), buyerEmail: email }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok || data.error) {
      setError(
        data.error === 'cards_unavailable'
          ? 'การ์ดบางใบถูกจองไปแล้ว กรุณาตรวจสอบตะกร้า'
          : 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'
      )
      return
    }
    setOrderId(data.orderId)
    setExpiresAt(data.expiresAt)
    setStep('payment')
  }

  if (!mounted) return null

  const content = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'stretch',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'opacity .2s ease',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ flex: 1, background: 'rgba(28,27,36,.45)', backdropFilter: 'blur(4px)' }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          width: '100%', maxWidth: 420,
          background: '#fff',
          borderLeft: '1.5px solid #eceaee',
          display: 'flex', flexDirection: 'column',
          height: '100%', overflowY: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .28s cubic-bezier(.32,0,.67,0)',
          boxShadow: '-24px 0 60px -20px rgba(28,27,36,.35)',
        }}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{ padding: '18px 20px 16px', borderBottom: '1.5px solid #eceaee', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
          {step !== 'cart' && step !== 'success' && (
            <button
              onClick={() => setStep('cart')}
              style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #eceaee', background: '#faf7f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, color: '#6b6a76' }}
            >←</button>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ ...KAN, fontWeight: 700, fontSize: 17, color: '#1c1b24', margin: 0 }}>
              {step === 'cart'      && `ตะกร้า (${cart.length} ใบ)`}
              {step === 'payment'   && 'ชำระเงิน'}
              {step === 'verifying' && 'กำลังตรวจสอบ'}
              {step === 'success'   && 'สำเร็จแล้ว!'}
              {step === 'fail'      && 'ตรวจสอบไม่ผ่าน'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #eceaee', background: '#faf7f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20, color: '#6b6a76', lineHeight: 1 }}
          >×</button>
        </div>

        {/* ── Step: Cart ───────────────────────────────────────── */}
        {step === 'cart' && (
          <>
            <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b6a76', ...ANU }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                  <p style={{ fontSize: 15 }}>ตะกร้าว่างเปล่า</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cart.map(card => (
                    <div key={card.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#faf7f2', border: '1.5px solid #eceaee', borderRadius: 14, padding: '11px 13px' }}>
                      {card.image_url
                        ? <img src={card.image_url} alt={card.name} style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                        : <div style={{ width: 40, height: 56, borderRadius: 8, background: '#eceaee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🃏</div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ ...KAN, fontWeight: 700, fontSize: 14, color: '#1c1b24', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.name || 'ไม่ระบุชื่อ'}</p>
                        <p style={{ ...ANU, fontSize: 12.5, color: '#6b6a76', margin: '2px 0 0' }}>{card.condition}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ ...KAN, fontWeight: 700, fontSize: 15, color: '#ee1c25', margin: 0 }}>{displayPrice(card.price)}</p>
                        <button
                          onClick={() => onRemove(card.id)}
                          style={{ ...ANU, fontSize: 12, color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', marginTop: 3 }}
                        >ลบออก</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart footer */}
            {cart.length > 0 && (
              <div style={{ padding: '16px 20px 24px', borderTop: '1.5px solid #eceaee', background: '#fff' }}>
                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', borderBottom: '1.5px dashed #eceaee', marginBottom: 16 }}>
                  <span style={{ ...ANU, fontSize: 14, color: '#6b6a76' }}>รวมทั้งหมด</span>
                  <span style={{ ...KAN, fontWeight: 700, fontSize: 26, color: '#1c1b24' }}>{displayPrice(total)}</span>
                </div>
                {/* Email */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ ...ANU, fontSize: 13, color: '#6b6a76', display: 'block', marginBottom: 7 }}>อีเมล — รับใบเสร็จ + ติดตามออเดอร์</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#faf7f2', border: '1.5px solid #eceaee', borderRadius: 12, padding: '12px 14px', ...ANU, fontSize: 15, color: '#1c1b24', outline: 'none' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#ee1c25')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#eceaee')}
                  />
                </div>
                {error && (
                  <div style={{ background: '#fff1ef', border: '1.5px solid #f3c0bd', borderRadius: 11, padding: '10px 13px', marginBottom: 12, ...ANU, fontSize: 13.5, color: '#c0141b' }}>
                    ⚠️ {error}
                  </div>
                )}
                {/* CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={!email || loading || cart.length === 0}
                  style={{
                    width: '100%', padding: '15px',
                    background: (!email || loading) ? '#ededf0' : '#ee1c25',
                    color: (!email || loading) ? '#a1a1aa' : '#fff',
                    border: 'none', borderRadius: 14,
                    ...KAN, fontWeight: 600, fontSize: 16,
                    cursor: (!email || loading) ? 'not-allowed' : 'pointer',
                    boxShadow: (email && !loading) ? '0 5px 0 #c0141b' : 'none',
                    marginBottom: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }} />
                      กำลังจองการ์ด…
                    </>
                  ) : `💳 จองและไปชำระเงิน`}
                </button>
                {/* Lock note */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, ...ANU, fontSize: 12.5, color: '#6b6a76' }}>
                  <span style={{ color: '#2a75bb' }}>ℹ</span>
                  การ์ดจะถูกล็อก 10 นาทีหลังกดจอง
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Step: Payment ─────────────────────────────────────── */}
        {step === 'payment' && orderId && expiresAt && (
          <div style={{ flex: 1, padding: '20px 20px 32px', overflowY: 'auto' }}>
            {/* Countdown */}
            <Countdown expiresAt={expiresAt} />

            {/* Bank info */}
            <div style={{ background: '#faf7f2', border: '1.5px solid #eceaee', borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
              <p style={{ ...ANU, fontSize: 12.5, color: '#6b6a76', margin: '0 0 4px' }}>โอนเงินมาที่</p>
              <p style={{ ...KAN, fontWeight: 700, fontSize: 28, color: '#ee1c25', margin: '0 0 16px' }}>{displayPrice(total)}</p>
              <div style={{ borderTop: '1.5px solid #eceaee', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...ANU, fontSize: 13.5, color: '#6b6a76' }}>ธนาคาร</span>
                  <span style={{ ...KAN, fontWeight: 600, fontSize: 14, color: '#1c1b24' }}>{shop.bank_name || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...ANU, fontSize: 13.5, color: '#6b6a76' }}>เลขบัญชี</span>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 16, color: '#1c1b24', letterSpacing: '0.06em' }}>{maskedAccount}</span>
                </div>
              </div>
              <div style={{ marginTop: 14, background: '#fff8d8', border: '1.5px solid #f3dca0', borderRadius: 9, padding: '9px 13px', ...ANU, fontSize: 12.5, color: '#7a5a16' }}>
                ⚠️ ยอดต้องตรงทุกบาท หากยอดไม่ตรงระบบจะปฏิเสธสลิปอัตโนมัติ
              </div>
            </div>

            {/* Slip upload */}
            <SlipUpload
              orderId={orderId}
              onSuccess={() => setStep('success')}
              onFail={msg => { setFailMsg(msg); setStep('fail') }}
            />
          </div>
        )}

        {/* ── Step: Success ─────────────────────────────────────── */}
        {step === 'success' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: '#e8f9ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 22 }}>✅</div>
            <h3 style={{ ...KAN, fontWeight: 700, fontSize: 22, color: '#1c1b24', margin: '0 0 10px' }}>ชำระเงินสำเร็จ!</h3>
            <p style={{ ...ANU, fontSize: 14.5, color: '#6b6a76', margin: '0 0 28px', lineHeight: 1.7, maxWidth: '32ch' }}>
              ระบบตัดสต็อกแล้ว เช็คอีเมล <strong style={{ color: '#1c1b24' }}>{email}</strong> เพื่อดูใบเสร็จและ link ติดตามสถานะ
            </p>
            {orderId && (
              <div style={{ background: '#faf7f2', border: '1.5px solid #eceaee', borderRadius: 14, padding: '14px 20px', marginBottom: 24, width: '100%' }}>
                <p style={{ ...ANU, fontSize: 12.5, color: '#6b6a76', margin: '0 0 4px' }}>เลขออเดอร์</p>
                <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, fontWeight: 700, color: '#1c1b24', margin: 0, letterSpacing: '.04em' }}>{orderId.slice(0, 8).toUpperCase()}</p>
              </div>
            )}
            <button
              onClick={onClose}
              style={{ width: '100%', padding: '14px', background: '#1c1b24', color: '#fff', border: 'none', borderRadius: 14, ...KAN, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
            >ปิด</button>
          </div>
        )}

        {/* ── Step: Fail ────────────────────────────────────────── */}
        {step === 'fail' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: '#fff1ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 22 }}>❌</div>
            <h3 style={{ ...KAN, fontWeight: 700, fontSize: 20, color: '#1c1b24', margin: '0 0 10px' }}>ตรวจสอบไม่ผ่าน</h3>
            <p style={{ ...ANU, fontSize: 14.5, color: '#6b6a76', margin: '0 0 28px', lineHeight: 1.7, maxWidth: '34ch' }}>{failMsg || 'กรุณาตรวจสอบสลิปและลองอีกครั้ง'}</p>
            <button
              onClick={() => setStep('payment')}
              style={{ width: '100%', padding: '14px', background: '#ee1c25', color: '#fff', border: 'none', borderRadius: 14, ...KAN, fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 0 #c0141b', marginBottom: 10 }}
            >ลองอัปโหลดสลิปอีกครั้ง</button>
            <button
              onClick={onClose}
              style={{ width: '100%', padding: '12px', background: 'transparent', color: '#6b6a76', border: 'none', ...ANU, fontSize: 14, cursor: 'pointer' }}
            >ยกเลิก</button>
          </div>
        )}
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return createPortal(content, document.body)
}
