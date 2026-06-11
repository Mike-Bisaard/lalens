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

export default function ShopView({ shop, batches }: Props) {
  const [cart, setCart] = useState<Card[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

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

            {/* Card grid — tap each card to add to cart */}
            <div className="grid grid-cols-3 gap-2">
              {batch.cards.map(card => {
                const inCart = cart.some(c => c.id === card.id)
                const unavailable = card.status !== 'available'
                return (
                  <button
                    key={card.id}
                    onClick={() => toggleCard(card)}
                    disabled={unavailable}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all text-left
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
                    {card.status === 'reserved' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-amber-400">
                        จองแล้ว
                      </div>
                    )}

                    <div className="p-2">
                      <p className="text-xs font-semibold truncate">{card.name || 'ไม่ระบุชื่อ'}</p>
                      <p className="text-xs text-emerald-400 font-bold">฿{(card.price / 100).toLocaleString()}</p>
                    </div>
                  </button>
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
    </div>
  )
}
