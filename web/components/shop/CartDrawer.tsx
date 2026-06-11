'use client'

import { useState, useEffect } from 'react'
import type { Shop, Card } from '@/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  cart: Card[]
  shop: Shop
  onRemove: (id: string) => void
}

export default function CartDrawer({ isOpen, onClose, cart, shop, onRemove }: Props) {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'cart' | 'checkout'>('cart')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [error, setError] = useState('')

  const total = cart.reduce((sum, c) => sum + c.price, 0)

  // Reset to cart step when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => { setStep('cart'); setError('') }, 300)
    }
  }, [isOpen])

  async function handleCheckout() {
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
      setError(data.error === 'cards_unavailable'
        ? 'การ์ดบางใบถูกจองไปแล้ว กรุณาตรวจสอบตะกร้าของคุณ'
        : 'เกิดข้อผิดพลาด กรุณาลองใหม่')
      return
    }

    setOrderId(data.orderId)
    setExpiresAt(data.expiresAt)
    setStep('checkout')
  }

  // Mask bank account: show last 4 digits only
  const maskedAccount = shop.bank_account_encrypted.length > 4
    ? '•'.repeat(shop.bank_account_encrypted.length - 4) + shop.bank_account_encrypted.slice(-4)
    : shop.bank_account_encrypted

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-[#0f0f1a] border-l border-zinc-800 flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="font-bold text-lg">
            {step === 'cart' ? `ตะกร้า (${cart.length} ใบ)` : 'ชำระเงิน'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {step === 'cart' && (
          <>
            <div className="flex-1 p-5 space-y-3">
              {cart.map(card => (
                <div key={card.id} className="flex items-center gap-3 bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                  {card.image_url ? (
                    <img src={card.image_url} alt={card.name} className="w-10 h-14 object-cover rounded-lg" />
                  ) : (
                    <div className="w-10 h-14 bg-zinc-800 rounded-lg flex items-center justify-center text-xl">🃏</div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{card.name || 'ไม่ระบุชื่อ'}</p>
                    <p className="text-xs text-zinc-500">{card.condition}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">฿{(card.price / 100).toLocaleString()}</p>
                    <button onClick={() => onRemove(card.id)} className="text-xs text-zinc-600 hover:text-red-400 transition mt-1">ลบ</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-400">รวม</span>
                <span className="text-xl font-black text-emerald-400">฿{(total / 100).toLocaleString()}</span>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-zinc-400 mb-2">อีเมล (รับใบเสร็จ + ติดตามออเดอร์)</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              <button
                onClick={handleCheckout}
                disabled={!email || loading || cart.length === 0}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'กำลังจอง...' : 'ไปชำระเงิน →'}
              </button>
              <p className="text-xs text-zinc-600 text-center mt-3">การ์ดจะถูกล็อก 10 นาทีหลังกด</p>
            </div>
          </>
        )}

        {step === 'checkout' && orderId && expiresAt && (
          <div className="flex-1 p-5">
            {/* Countdown */}
            <Countdown expiresAt={expiresAt} />

            {/* Bank transfer info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
              <p className="text-xs text-zinc-500 mb-1">โอนเงินมาที่</p>
              <p className="text-lg font-black text-white mb-1">฿{(total / 100).toLocaleString()}</p>
              <div className="border-t border-zinc-800 mt-3 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">ธนาคาร</span>
                  <span className="font-semibold">{shop.bank_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">เลขบัญชี</span>
                  <span className="font-mono font-semibold tracking-wider">{maskedAccount}</span>
                </div>
              </div>
              <p className="text-xs text-amber-400 mt-3">ยอดต้องตรงทุกบาท</p>
            </div>

            <SlipUpload orderId={orderId} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Countdown timer ────────────────────────────────────────────
function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    function update() {
      setRemaining(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)))
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [expiresAt])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const isUrgent = remaining < 120

  if (remaining === 0) return (
    <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 mb-4 text-center">
      <p className="text-red-400 text-sm font-semibold">หมดเวลา — การจองถูกยกเลิกแล้ว</p>
    </div>
  )

  return (
    <div className={`rounded-xl p-3 mb-4 flex items-center justify-between ${
      isUrgent ? 'bg-red-900/20 border border-red-800' : 'bg-zinc-900 border border-zinc-800'
    }`}>
      <span className="text-sm text-zinc-400">เวลาที่เหลือ</span>
      <span className={`font-mono text-lg font-black ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  )
}

// ── Slip upload + verify ───────────────────────────────────────
function SlipUpload({ orderId }: { orderId: string }) {
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<'success' | 'fail' | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleVerify() {
    if (!slipFile) return
    setVerifying(true)
    setResult(null)

    const reader = new FileReader()
    reader.onload = async () => {
      const slipUrl = reader.result as string
      const res = await fetch('/api/slip/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, slipUrl }),
      })
      const data = await res.json()
      setVerifying(false)
      if (data.success) {
        setResult('success')
      } else {
        setResult('fail')
        setErrorMsg(
          data.error === 'slip_mismatch'   ? 'ยอดหรือบัญชีไม่ตรง กรุณาตรวจสอบ' :
          data.error === 'duplicate_slip'  ? 'สลิปนี้ถูกใช้แล้ว' :
          data.error === 'order_expired'   ? 'ออเดอร์หมดเวลาแล้ว' :
          'ตรวจสอบไม่ผ่าน กรุณาลองอีกครั้ง'
        )
      }
    }
    reader.readAsDataURL(slipFile)
  }

  if (result === 'success') return (
    <div className="text-center py-10">
      <div className="text-5xl mb-4">✅</div>
      <h3 className="font-bold text-lg text-emerald-400 mb-2">ชำระเงินสำเร็จ!</h3>
      <p className="text-zinc-400 text-sm">ระบบตัดสต็อกแล้ว ตรวจสอบ email ของคุณเพื่อดูใบเสร็จ</p>
    </div>
  )

  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-3">แนบสลิปการโอนเงิน</label>
      <label className={`block w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
        slipFile ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-700 hover:border-zinc-500'
      }`}>
        <input type="file" accept="image/*" className="hidden" onChange={e => setSlipFile(e.target.files?.[0] ?? null)} />
        {slipFile ? (
          <p className="text-sm font-semibold text-violet-400">✓ {slipFile.name}</p>
        ) : (
          <>
            <div className="text-3xl mb-2">📎</div>
            <p className="text-sm text-zinc-400">แตะเพื่อเลือกสลิป</p>
          </>
        )}
      </label>
      {result === 'fail' && <p className="text-red-400 text-sm mt-3">{errorMsg}</p>}
      <button
        onClick={handleVerify}
        disabled={!slipFile || verifying}
        className="w-full mt-4 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 transition disabled:opacity-50"
      >
        {verifying ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            กำลังตรวจสลิป...
          </span>
        ) : 'ส่งสลิปเพื่อยืนยัน'}
      </button>
    </div>
  )
}
