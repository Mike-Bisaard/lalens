'use client'

import { useState } from 'react'
import type { Shop, BatchUpload, Card } from '@/types'
import CartDrawer from './CartDrawer'

interface BatchWithCards extends BatchUpload {
  cards: Card[]
}

interface Props {
  shop: Shop
  batches: BatchWithCards[]
}

// ─── Notify popup ─────────────────────────────────────────────────────────────

function NotifyModal({
  cardId,
  cardName,
  onClose,
}: {
  cardId: string
  cardName: string
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || state === 'loading') return
    setState('loading')
    try {
      const res = await fetch(`/api/cards/${cardId}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok || res.status === 409) {
        setState('success')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 380,
          background: '#18181b',
          border: '1px solid #3f3f46',
          borderRadius: 20,
          padding: 28,
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.8)',
        }}
      >
        {state === 'success' ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔔</div>
            <h3 style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: 18, color: '#f4f4f5', margin: '0 0 8px' }}>
              ตั้งการแจ้งเตือนแล้ว!
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
              เราจะส่งอีเมลให้คุณทันทีเมื่อการ์ดนี้ปลดล็อค
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%', background: '#27272a', color: '#f4f4f5',
                border: 'none', borderRadius: 12, padding: '12px', fontSize: 15,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              ปิด
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔔</div>
              <h3 style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: 17, color: '#f4f4f5', margin: '0 0 8px' }}>
                แจ้งเตือนเมื่อปลดล็อค
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
                การ์ด <b style={{ color: '#e4e4e7' }}>{cardName || 'ใบนี้'}</b> ถูกจองอยู่
                ใส่อีเมลเพื่อรับแจ้งเตือนทันทีเมื่อปลดล็อค
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="อีเมลของคุณ"
                disabled={state === 'loading'}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#27272a', border: '1.5px solid #3f3f46',
                  borderRadius: 12, padding: '12px 14px',
                  color: '#f4f4f5', fontSize: 15,
                  outline: 'none', marginBottom: 12,
                }}
                onFocus={e => (e.target.style.borderColor = '#a855f7')}
                onBlur={e => (e.target.style.borderColor = '#3f3f46')}
              />

              {state === 'error' && (
                <p style={{ color: '#f87171', fontSize: 13, margin: '0 0 10px' }}>
                  เกิดข้อผิดพลาด กรุณาลองอีกครั้ง
                </p>
              )}

              <button
                type="submit"
                disabled={!email || state === 'loading'}
                style={{
                  width: '100%',
                  background: !email || state === 'loading'
                    ? '#3f3f46'
                    : 'linear-gradient(135deg,#7c3aed,#a21caf)',
                  color: !email || state === 'loading' ? '#71717a' : '#fff',
                  border: 'none', borderRadius: 12, padding: '13px',
                  fontSize: 15, fontWeight: 700, cursor: !email ? 'not-allowed' : 'pointer',
                  transition: 'background .15s',
                  marginBottom: 10,
                }}
              >
                {state === 'loading' ? 'กำลังบันทึก...' : 'แจ้งเตือนฉัน'}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%', background: 'transparent', color: '#71717a',
                  border: 'none', padding: '10px', fontSize: 14, cursor: 'pointer',
                }}
              >
                ยกเลิก
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main shop view ───────────────────────────────────────────────────────────

export default function ShopView({ shop, batches }: Props) {
  const [cart, setCart] = useState<Card[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notifyCardId, setNotifyCardId] = useState<string | null>(null)

  const notifyCard = notifyCardId
    ? batches.flatMap(b => b.cards).find(c => c.id === notifyCardId)
    : null

  function toggleCard(card: Card) {
    if (card.status !== 'available') return
    setCart(prev =>
      prev.find(c => c.id === card.id)
        ? prev.filter(c => c.id !== card.id)
        : [...prev, card]
    )
  }

  const total = cart.reduce((sum, c) => sum + c.price, 0)

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      {/* Shop Header */}
      <div className="border-b border-zinc-800 px-4 py-4 flex items-center justify-between sticky top-0 bg-[#09090f]/90 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg font-bold">
            {shop.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold">{shop.name}</h1>
            <span className="text-xs text-emerald-400 font-semibold">● Online</span>
          </div>
        </div>
        {cart.length > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition"
          >
            🛒 {cart.length} ใบ · ฿{(total / 100).toLocaleString()}
          </button>
        )}
      </div>

      {/* Batches */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-10">
        {batches.length === 0 && (
          <p className="text-center text-zinc-500 py-20">ยังไม่มีสินค้าในร้านนี้</p>
        )}
        {batches.map(batch => (
          <div key={batch.id}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">
                {new Date(batch.created_at).toLocaleDateString('th-TH')}
              </span>
              <span className="text-xs text-zinc-500">
                {batch.cards.filter(c => c.status === 'available').length} ใบพร้อมขาย
              </span>
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-3 gap-2">
              {batch.cards.map(card => {
                const inCart = cart.some(c => c.id === card.id)
                const isReserved = card.status === 'reserved'
                const unavailable = card.status !== 'available'
                return (
                  <div key={card.id} className="relative">
                    <button
                      onClick={() => toggleCard(card)}
                      disabled={unavailable}
                      className={`relative w-full rounded-xl overflow-hidden border-2 transition-all text-left
                        ${unavailable ? 'opacity-40 cursor-not-allowed border-transparent' : 'cursor-pointer'}
                        ${inCart ? 'border-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.4)]' : 'border-transparent hover:border-zinc-600'}
                      `}
                    >
                      {card.image_url ? (
                        <img
                          src={card.image_url}
                          alt={card.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full aspect-[5/7] object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-[5/7] bg-zinc-800 flex items-center justify-center text-3xl">🃏</div>
                      )}

                      {inCart && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center text-black text-xs font-bold">
                          ✓
                        </div>
                      )}
                      {card.status === 'sold' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-zinc-400">
                          ขายแล้ว
                        </div>
                      )}
                      {isReserved && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                          <span className="text-xs font-bold text-amber-400">จองแล้ว</span>
                        </div>
                      )}

                      <div className="p-2">
                        <p className="text-xs font-semibold truncate">{card.name || 'ไม่ระบุชื่อ'}</p>
                        <p className="text-xs text-emerald-400 font-bold">฿{(card.price / 100).toLocaleString()}</p>
                      </div>
                    </button>

                    {/* Notify button — only for reserved cards */}
                    {isReserved && (
                      <button
                        onClick={() => setNotifyCardId(card.id)}
                        style={{
                          position: 'absolute',
                          bottom: 36,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(168,85,247,0.85)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(168,85,247,0.5)',
                          borderRadius: 20,
                          padding: '5px 12px',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          whiteSpace: 'nowrap',
                          zIndex: 10,
                        }}
                      >
                        🔔 แจ้งเตือน
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        shop={shop}
        onRemove={(id) => setCart(c => c.filter(card => card.id !== id))}
      />

      {/* Notify modal */}
      {notifyCardId && (
        <NotifyModal
          cardId={notifyCardId}
          cardName={notifyCard?.name ?? ''}
          onClose={() => setNotifyCardId(null)}
        />
      )}
    </div>
  )
}
