'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui'

type CardStatus = 'available' | 'reserved' | 'sold' | 'removed'
type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'

interface CardRow {
  id: string
  name: string
  image_url: string
  price: number
  condition: CardCondition
  status: CardStatus
  quantity: number
  sort_order: number
  created_at: string
}

export function ListingsGrid({ cards }: { cards: CardRow[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => Object.fromEntries(cards.map(c => [c.id, c.quantity]))
  )
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const availableIds = cards.filter(c => c.status === 'available').map(c => c.id)
  const allSelected = availableIds.length > 0 && availableIds.every(id => selected.has(id))

  function toggleCard(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(availableIds))
  }

  async function bulkDelete() {
    if (!selected.size) return
    if (!confirm(`ลบการ์ด ${selected.size} ใบที่เลือก?`)) return
    setBulkBusy(true)
    await fetch('/api/cards/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected] }),
    })
    setSelected(new Set())
    router.refresh()
    setBulkBusy(false)
  }

  function changeQty(id: string, delta: number) {
    setQuantities(prev => {
      const next = Math.max(1, (prev[id] ?? 1) + delta)
      clearTimeout(debounceRef.current[id])
      debounceRef.current[id] = setTimeout(() => {
        fetch(`/api/cards/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: next }),
        })
      }, 600)
      return { ...prev, [id]: next }
    })
  }

  async function markSold(id: string) {
    if (!confirm('ทำเครื่องหมายว่าขายแล้ว (จากช่องทางอื่น)?')) return
    setBusyIds(prev => new Set([...prev, id]))
    await fetch(`/api/cards/${id}/sold`, { method: 'POST' })
    router.refresh()
    setBusyIds(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  async function remove(id: string) {
    if (!confirm('ลบการ์ดนี้?')) return
    setBusyIds(prev => new Set([...prev, id]))
    await fetch(`/api/cards/${id}`, { method: 'DELETE' })
    router.refresh()
    setBusyIds(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  if (!cards.length) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <div className="text-5xl mb-4">🃏</div>
        <p className="text-lg mb-2">ยังไม่มีการ์ด</p>
      </div>
    )
  }

  return (
    <>
      {/* Select-all toolbar (only when there are available cards) */}
      {availableIds.length > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${
              allSelected ? 'bg-violet-600 border-violet-600' : 'border-zinc-600 hover:border-zinc-400'
            }`}>
              {allSelected && <span className="text-[9px] font-bold text-white leading-none">✓</span>}
            </div>
            {allSelected ? 'ยกเลิกทั้งหมด' : `เลือกทั้งหมด (${availableIds.length})`}
          </button>
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {cards.map(card => {
          const isSelected = selected.has(card.id)
          const isBusy = busyIds.has(card.id)
          const qty = quantities[card.id] ?? card.quantity

          return (
            <div
              key={card.id}
              className={`bg-zinc-900 rounded-xl overflow-hidden flex flex-col border transition-all ${
                card.status === 'sold' || card.status === 'removed' ? 'opacity-50' : ''
              } ${isSelected ? 'border-violet-500 ring-1 ring-violet-500/60' : 'border-zinc-800'}`}
            >
              {/* Image area */}
              <div className="relative aspect-[5/7]">
                <Image
                  src={card.image_url}
                  alt={card.name || 'การ์ด'}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover"
                />

                {/* Overlays for non-available cards */}
                {card.status === 'reserved' && (
                  <div className="absolute inset-0 bg-amber-900/30" />
                )}
                {card.status === 'sold' && (
                  <div className="absolute inset-0 bg-black/50" />
                )}

                {/* Checkbox for available cards */}
                {card.status === 'available' && (
                  <button
                    onClick={() => toggleCard(card.id)}
                    className="absolute top-2 right-2 z-10"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shadow-md transition ${
                      isSelected
                        ? 'bg-violet-600 border-violet-600'
                        : 'bg-black/40 border-white/50 hover:border-white'
                    }`}>
                      {isSelected && <span className="text-[9px] font-bold text-white leading-none">✓</span>}
                    </div>
                  </button>
                )}
              </div>

              {/* Info section */}
              <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                <p className="text-xs text-zinc-300 font-medium truncate leading-tight">
                  {card.name || <span className="text-zinc-600">ไม่มีชื่อ</span>}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    ฿{(card.price / 100).toLocaleString()}
                  </span>
                  <Badge variant={card.condition as CardCondition} />
                </div>

                {/* Quantity stepper — available cards only */}
                {card.status === 'available' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-500">จำนวน</span>
                    <div className="flex items-center">
                      <button
                        onClick={() => changeQty(card.id, -1)}
                        className="w-5 h-5 rounded-l bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 text-xs flex items-center justify-center transition"
                      >−</button>
                      <span className="w-6 text-center text-xs font-bold text-white bg-zinc-800 border-y border-zinc-700 h-5 flex items-center justify-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => changeQty(card.id, +1)}
                        className="w-5 h-5 rounded-r bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 text-xs flex items-center justify-center transition"
                      >+</button>
                    </div>
                  </div>
                )}

                {/* Status badge — moved from image overlay to here */}
                <div className="mt-auto pt-0.5">
                  <Badge variant={card.status as Exclude<CardStatus, 'removed'>} />
                </div>

                {/* Action buttons — available cards only */}
                {card.status === 'available' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => markSold(card.id)}
                      disabled={isBusy}
                      className="flex-1 text-xs py-1 rounded-md border border-zinc-700 text-zinc-400 hover:border-amber-600 hover:text-amber-400 transition disabled:opacity-40"
                    >
                      ขายแล้ว
                    </button>
                    <button
                      onClick={() => remove(card.id)}
                      disabled={isBusy}
                      className="px-2 py-1 rounded-md border border-zinc-700 text-zinc-500 hover:border-red-800 hover:text-red-400 transition disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating bulk-delete bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-3 shadow-2xl shadow-black/60">
          <span className="text-sm text-zinc-300 font-medium">เลือก {selected.size} ใบ</span>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-zinc-500 hover:text-white transition px-2"
          >
            ยกเลิก
          </button>
          <button
            onClick={bulkDelete}
            disabled={bulkBusy}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
          >
            {bulkBusy ? 'กำลังลบ...' : `ลบ ${selected.size} ใบ`}
          </button>
        </div>
      )}
    </>
  )
}
