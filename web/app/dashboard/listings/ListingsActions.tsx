'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ListingsActions({ cardId }: { cardId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function markSold() {
    if (!confirm('ทำเครื่องหมายว่าขายแล้ว (จากช่องทางอื่น)?')) return
    setBusy(true)
    await fetch(`/api/cards/${cardId}/sold`, { method: 'POST' })
    router.refresh()
    setBusy(false)
  }

  async function remove() {
    if (!confirm('ลบการ์ดนี้?')) return
    setBusy(true)
    await fetch(`/api/cards/${cardId}`, { method: 'DELETE' })
    router.refresh()
    setBusy(false)
  }

  return (
    <div className="flex gap-1 mt-0.5">
      <button
        onClick={markSold}
        disabled={busy}
        className="flex-1 text-xs py-1 rounded-md border border-zinc-700 text-zinc-400 hover:border-amber-600 hover:text-amber-400 transition disabled:opacity-40"
      >
        ขายแล้ว
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="px-2 py-1 rounded-md border border-zinc-700 text-zinc-500 hover:border-red-800 hover:text-red-400 transition disabled:opacity-40"
      >
        ✕
      </button>
    </div>
  )
}
