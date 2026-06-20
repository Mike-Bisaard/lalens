'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

type CardStatus = 'available' | 'reserved' | 'sold'
type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'

export interface CardRow {
  id: string
  name: string
  image_url: string
  price: number
  condition: CardCondition
  status: CardStatus
  quantity: number
  created_at: string
}

// ─── Color tokens ─────────────────────────────────────────────────────────────

const C = {
  red: '#ee1c25',
  redDeep: '#c0141b',
  ink: '#1c1b24',
  muted: '#6b6a76',
  paper: '#fff',
  line: '#eceaee',
  bg: '#faf7f2',
  tintAmber: '#fff5e0',
  tintGreen: '#e9f7ee',
  green: '#2e9e4f',
  greenDeep: '#207a3c',
  amber: '#d98800',
} as const

const KAN: React.CSSProperties = { fontFamily: '"Kanit", sans-serif' }
const ANU: React.CSSProperties = { fontFamily: '"Anuphan", sans-serif' }

const CONDITION_LABEL: Record<CardCondition, string> = {
  NM: 'Near Mint',
  LP: 'Lightly Played',
  MP: 'Moderately Played',
  HP: 'Heavily Played',
  DMG: 'Damaged',
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const iconBase: React.SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
}

function IconWallet({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg {...iconBase} width={size} height={size} style={{ color }}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v16a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>
}
function IconReceipt({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg {...iconBase} width={size} height={size} style={{ color }}><path d="M4 2v20l3-3 3 3 3-3 3 3 3-3V2z"/><path d="M8 7h8M8 11h6"/></svg>
}
function IconTag({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg {...iconBase} width={size} height={size} style={{ color }}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
}
function IconLock({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg {...iconBase} width={size} height={size} style={{ color }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}
function IconTimer({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg {...iconBase} width={size} height={size} style={{ color }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
}
function IconCheck({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg {...iconBase} width={size} height={size} style={{ color }}><path d="M20 6L9 17l-5-5"/></svg>
}
function IconX({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg {...iconBase} width={size} height={size} style={{ color }}><path d="M18 6L6 18M6 6l12 12"/></svg>
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

function CardThumb({ imageUrl, name, width = 38 }: { imageUrl: string; name: string; width?: number }) {
  const height = Math.round(width * (88 / 63))
  return (
    <div style={{ width, height, borderRadius: 6, overflow: 'hidden', background: '#f6f3ee', flexShrink: 0, position: 'relative' }}>
      {imageUrl && <Image src={imageUrl} alt={name || 'การ์ด'} fill sizes="60px" style={{ objectFit: 'cover' }}/>}
    </div>
  )
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: CardStatus }) {
  const map: Record<CardStatus, { bg: string; color: string; label: string }> = {
    available: { bg: C.tintGreen, color: C.greenDeep, label: 'กำลังขาย' },
    reserved:  { bg: '#fbe6c0',   color: C.amber,     label: 'ถูกจอง' },
    sold:      { bg: C.line,      color: C.muted,     label: 'ขายแล้ว' },
  }
  const s = map[status]
  return <span style={{ ...KAN, fontWeight: 700, fontSize: 11.5, padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>
}

// ─── Manage button ────────────────────────────────────────────────────────────

function ManageBtn({ status, onClick }: { status: CardStatus; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const configs: Record<CardStatus, { icon: React.ReactNode; label: string }> = {
    available: { icon: <IconTag size={14}/>,   label: 'แก้ไข' },
    reserved:  { icon: <IconTimer size={14}/>, label: 'ดู' },
    sold:      { icon: <IconLock size={14}/>,  label: 'ดู' },
  }
  const { icon, label } = configs[status]
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ ...KAN, fontWeight: 600, fontSize: 13, padding: '7px 14px', borderRadius: 9, border: `1.5px solid ${hovered ? C.red : '#e0dde3'}`, background: C.paper, color: hovered ? C.red : C.ink, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'border-color .15s, color .15s' }}>
      {icon}{label}
    </button>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const PULSE_KF = `@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.45 } }`

function SkeletonRows() {
  return (
    <>
      <style>{PULSE_KF}</style>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} style={{ padding: '13px 18px', borderBottom: `1.5px solid ${C.line}` }}>
              <div style={{ height: j === 0 ? 38 : 18, borderRadius: 7, background: '#f0ede8', animation: 'pulse 1.5s ease-in-out infinite' }}/>
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message }: { message: string }) {
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: C.ink, color: '#fff', ...KAN, fontWeight: 500, fontSize: 14, padding: '12px 22px', borderRadius: 999, boxShadow: '0 12px 30px -8px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 100, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#ffcb05" stroke="#ffcb05" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      {message}
    </div>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface ModalProps {
  card: CardRow
  onClose: () => void
  onSaved: (updated: CardRow) => void
  onMarkedSold: (id: string) => void
  onDeleted: (id: string) => void
}

function EditModal({ card, onClose, onSaved, onMarkedSold, onDeleted }: ModalProps) {
  const locked = card.status === 'reserved' || card.status === 'sold'
  const soldCount = 0
  const minQty = Math.max(1, soldCount)

  const [editName, setEditName] = useState<string>(card.name)
  const [editPrice, setEditPrice] = useState<string>((card.price / 100).toFixed(2))
  const [editQty, setEditQty] = useState<number>(card.quantity)
  const [saving, setSaving] = useState(false)
  const [marking, setMarking] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/cards/${card.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName, price: Math.round(parseFloat(editPrice) * 100), quantity: editQty }) })
    setSaving(false)
    if (res.ok) onSaved({ ...card, name: editName, price: Math.round(parseFloat(editPrice) * 100), quantity: editQty })
  }

  async function handleMarkSold() {
    setMarking(true)
    const res = await fetch(`/api/cards/${card.id}/sold`, { method: 'POST' })
    setMarking(false)
    if (res.ok) onMarkedSold(card.id)
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/cards/${card.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) onDeleted(card.id)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,18,22,.45)', zIndex: 60, display: 'grid', placeItems: 'center' }}>
      <div style={{ maxWidth: 440, width: 'calc(100% - 32px)', background: C.paper, borderRadius: 20, boxShadow: '0 24px 60px -18px rgba(0,0,0,.4)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        {/* Head */}
        <div style={{ padding: '20px 22px', borderBottom: `1.5px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 13 }}>
          <CardThumb imageUrl={card.image_url} name={card.name} width={44}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ ...KAN, fontWeight: 700, fontSize: 17, display: 'block', color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.name || 'ไม่มีชื่อ'}</b>
            <div style={{ marginTop: 4 }}><StatusPill status={card.status}/></div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #e0dde3', background: C.paper, display: 'grid', placeItems: 'center', cursor: 'pointer', color: C.muted, flexShrink: 0 }}><IconX size={15}/></button>
        </div>

        {/* Body */}
        <div style={{ padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {card.status === 'reserved' && (
            <div style={{ background: C.tintAmber, border: '1.5px solid #f3dca0', borderRadius: 12, padding: '12px 15px', display: 'flex', gap: 10 }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}><IconTimer size={18} color="#d98800"/></div>
              <div>
                <b style={{ ...KAN, fontWeight: 600, fontSize: 14, color: '#7a5a16', display: 'block' }}>มีคนกำลังชำระเงินใบนี้</b>
                <span style={{ ...ANU, fontSize: 12.5, color: '#7a5a16', lineHeight: 1.5 }}>ราคาถูก freeze และแก้/ลบไม่ได้จนกว่าจะจบดีลหรือหมดเวลาจอง — กันเคส &apos;จ่ายแล้วของหาย&apos;</span>
              </div>
            </div>
          )}
          {card.status === 'sold' && (
            <div style={{ background: '#f3f2f4', border: `1.5px solid ${C.line}`, borderRadius: 12, padding: '12px 15px', display: 'flex', gap: 10 }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}><IconLock size={18} color={C.muted}/></div>
              <div>
                <b style={{ ...KAN, fontWeight: 600, fontSize: 14, color: C.ink, display: 'block' }}>ใบนี้ขายแล้ว — แก้ไขไม่ได้</b>
                <span style={{ ...ANU, fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>ข้อมูลถูกล็อกถาวรเพราะเป็นบันทึกของดีลจริง ใช้อ้างอิงราคากลางในอนาคต</span>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label style={{ ...KAN, fontWeight: 500, fontSize: 13, color: C.ink, display: 'block', marginBottom: 7 }}>ชื่อการ์ด</label>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              disabled={locked}
              placeholder="เช่น Charizard EX"
              style={{ width: '100%', border: '1.5px solid #e0dde3', borderRadius: 11, padding: '12px 14px', fontSize: 15, ...KAN, background: locked ? '#f3f2f4' : '#faf9f7', color: locked ? C.muted : C.ink, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { if (!locked) { e.target.style.borderColor = C.red; e.target.style.boxShadow = '0 0 0 3px rgba(238,28,37,.1)' } }}
              onBlur={e => { e.target.style.borderColor = '#e0dde3'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Price */}
          <div>
            <label style={{ ...KAN, fontWeight: 500, fontSize: 13, color: C.ink, display: 'block', marginBottom: 7 }}>ราคา (บาท)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', ...KAN, fontWeight: 600, color: C.muted, pointerEvents: 'none', fontSize: 15 }}>฿</span>
              <input type="number" min="0" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} disabled={locked}
                style={{ width: '100%', border: '1.5px solid #e0dde3', borderRadius: 11, padding: '12px 14px 12px 28px', fontSize: 15, ...KAN, fontWeight: 600, background: locked ? '#f3f2f4' : '#faf9f7', color: locked ? C.muted : C.ink, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { if (!locked) { e.target.style.borderColor = C.red; e.target.style.boxShadow = '0 0 0 3px rgba(238,28,37,.1)' } }}
                onBlur={e => { e.target.style.borderColor = '#e0dde3'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          {/* Quantity */}
          {card.status === 'available' && (
            <div>
              <label style={{ ...KAN, fontWeight: 500, fontSize: 13, color: C.ink, display: 'block', marginBottom: 7 }}>จำนวน</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ display: 'flex', border: '1.5px solid #e0dde3', borderRadius: 11, overflow: 'hidden' }}>
                  <button onClick={() => setEditQty(q => Math.max(minQty, q - 1))} disabled={editQty <= minQty}
                    style={{ width: 44, height: 46, background: '#faf9f7', border: 'none', fontSize: 21, cursor: editQty <= minQty ? 'not-allowed' : 'pointer', color: editQty <= minQty ? '#c0bec8' : C.ink, display: 'grid', placeItems: 'center' }}>−</button>
                  <div style={{ width: 52, display: 'grid', placeItems: 'center', ...KAN, fontWeight: 700, fontSize: 17, color: C.ink, borderLeft: '1.5px solid #e0dde3', borderRight: '1.5px solid #e0dde3' }}>{editQty}</div>
                  <button onClick={() => setEditQty(q => q + 1)} style={{ width: 44, height: 46, background: '#faf9f7', border: 'none', fontSize: 21, cursor: 'pointer', color: C.ink, display: 'grid', placeItems: 'center' }}>+</button>
                </div>
                <span style={{ ...ANU, fontSize: 12, color: C.muted }}>ลดได้ต่ำสุด 1 ใบ</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '18px 22px', borderTop: `1.5px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {card.status === 'available' ? (
            <>
              <button onClick={handleSave} disabled={saving}
                style={{ width: '100%', background: saving ? '#f08a8e' : C.red, color: '#fff', ...KAN, fontWeight: 600, fontSize: 16, padding: 13, borderRadius: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : `0 4px 0 ${C.redDeep}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {saving ? <span style={{ ...ANU, fontSize: 14 }}>กำลังบันทึก...</span> : <><IconCheck size={17} color="#fff"/>บันทึก</>}
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleMarkSold} disabled={marking} style={{ flex: 1, background: C.ink, color: '#fff', ...KAN, fontWeight: 600, fontSize: 14, padding: '11px 14px', borderRadius: 11, border: 'none', cursor: marking ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: marking ? 0.6 : 1 }}>
                  <IconTag size={14} color="#fff"/>ขายแล้ว (ที่อื่น)
                </button>
                <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, background: C.paper, color: C.red, ...KAN, fontWeight: 600, fontSize: 14, padding: '11px 14px', borderRadius: 11, border: '1.5px solid #f3c0bd', cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: deleting ? 0.45 : 1 }}>
                  <IconX size={14} color={C.red}/>ลบ
                </button>
              </div>
            </>
          ) : (
            <button onClick={onClose} style={{ width: '100%', background: C.paper, color: C.ink, ...KAN, fontWeight: 600, fontSize: 15, padding: 13, borderRadius: 12, border: '1.5px solid #e0dde3', cursor: 'pointer' }}>ปิด</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Table row ────────────────────────────────────────────────────────────────

function TableRow({ card, isLast, rowBg, rowHoverBg, onOpen }: { card: CardRow; isLast: boolean; rowBg: string; rowHoverBg: string; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false)
  const tdBase: React.CSSProperties = { padding: '13px 18px', fontSize: 14.5, borderBottom: isLast ? 'none' : `1.5px solid ${C.line}`, background: hovered ? rowHoverBg : rowBg, opacity: card.status === 'sold' ? 0.62 : 1, transition: 'background .1s', verticalAlign: 'middle' }
  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <td style={tdBase}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <CardThumb imageUrl={card.image_url} name={card.name} width={38}/>
          <div>
            <b style={{ ...KAN, fontWeight: 600, fontSize: 14.5, color: C.ink, display: 'block' }}>{card.name || '—'}</b>
            <span style={{ ...ANU, fontSize: 12, color: C.muted }}>การ์ด Pokemon</span>
          </div>
        </div>
      </td>
      <td style={{ ...tdBase, ...ANU }}>{CONDITION_LABEL[card.condition] ?? card.condition}</td>
      <td style={{ ...tdBase, textAlign: 'right' }}><span style={{ ...KAN, fontWeight: 700, fontSize: 15, color: C.ink }}>฿{(card.price / 100).toLocaleString()}</span></td>
      <td style={{ ...tdBase, textAlign: 'center', ...ANU }}>{card.status === 'sold' ? '—' : card.quantity}</td>
      <td style={{ ...tdBase, textAlign: 'center' }}><StatusPill status={card.status}/></td>
      <td style={{ ...tdBase, textAlign: 'right' }}><ManageBtn status={card.status} onClick={onOpen}/></td>
    </tr>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function ListingsView({ shopId, initialCards }: { shopId: string; initialCards: CardRow[] }) {
  const [cards, setCards] = useState<CardRow[]>(initialCards)
  const [loading, setLoading] = useState(false)
  const [modalCard, setModalCard] = useState<CardRow | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  async function refreshCards() {
    setLoading(true)
    const supabase = createClient()
    const { data: shop } = await supabase.from('shops').select('id').eq('id', shopId).maybeSingle()
    if (!shop) return
    const { data } = await supabase.from('cards').select('id, name, image_url, price, condition, status, quantity, created_at').eq('shop_id', shopId).neq('status', 'removed').order('created_at', { ascending: false })
    setCards((data as CardRow[]) ?? [])
    setLoading(false)
  }

  // Derived stats
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const soldThisMonth = cards.filter(c => c.status === 'sold' && new Date(c.created_at) >= monthStart)
  const salesSum = soldThisMonth.reduce((acc, c) => acc + c.price, 0)
  const reservedCount = cards.filter(c => c.status === 'reserved').length
  const availableCount = cards.filter(c => c.status === 'available').length
  const stockValue = cards.filter(c => c.status === 'available').reduce((acc, c) => acc + c.price * c.quantity, 0)

  function handleSaved(updated: CardRow) {
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
    setModalCard(null)
    showToast('บันทึกแล้ว — หน้าร้านอัปเดตตาม')
  }
  function handleMarkedSold(id: string) {
    setCards(prev => prev.map(c => c.id === id ? { ...c, status: 'sold' as CardStatus } : c))
    setModalCard(null)
    showToast('ทำเป็นขายแล้ว · เกรย์ใบในร้าน')
  }
  function handleDeleted(id: string) {
    setCards(prev => prev.filter(c => c.id !== id))
    setModalCard(null)
    showToast('ลบรายการแล้ว')
  }

  const statCards = [
    { label: 'ยอดขายเดือนนี้', value: `฿${(salesSum / 100).toLocaleString()}`, bg: C.red,      icon: <IconWallet size={18} color="#fff"/> },
    { label: 'ออเดอร์รอส่ง',    value: String(reservedCount),                    bg: '#2a75bb',  icon: <IconReceipt size={18} color="#fff"/> },
    { label: 'กำลังขาย',        value: String(availableCount),                   bg: C.green,    icon: <IconTag size={18} color="#fff"/> },
    { label: 'มูลค่าสต็อก',     value: `฿${(stockValue / 100).toLocaleString()}`, bg: '#eaa600', icon: <svg viewBox="0 0 24 24" width={18} height={18} fill="#ffcb05" stroke="#ffcb05" strokeWidth={1}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  ]

  return (
    <>
      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 13, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: s.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ ...ANU, fontSize: 12.5, color: C.muted }}>{s.label}</div>
              <div style={{ ...KAN, fontWeight: 700, fontSize: 21, color: C.ink }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
        <h2 style={{ ...KAN, fontWeight: 700, fontSize: 18, color: C.ink, margin: 0 }}>รายการสินค้า</h2>
        <span style={{ ...ANU, fontSize: 13, color: C.muted }}>{cards.length} รายการ</span>
      </div>

      {/* Table */}
      <div style={{ background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {[{ label: 'การ์ด', align: 'left' }, { label: 'สภาพ', align: 'left' }, { label: 'ราคา', align: 'right' }, { label: 'คงเหลือ', align: 'center' }, { label: 'สถานะ', align: 'center' }, { label: 'จัดการ', align: 'right' }].map(col => (
                <th key={col.label} style={{ ...KAN, fontWeight: 600, fontSize: 12.5, color: C.muted, padding: '13px 18px', borderBottom: `1.5px solid ${C.line}`, background: '#fcfbf9', textAlign: col.align as React.CSSProperties['textAlign'], whiteSpace: 'nowrap' }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows/>
            ) : cards.length === 0 ? (
              <tr><td colSpan={6}>
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f0ede8', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}><IconTag size={24} color={C.muted}/></div>
                  <div style={{ ...KAN, fontWeight: 600, fontSize: 16, color: C.ink, marginBottom: 8 }}>ยังไม่มีสินค้า</div>
                  <Link href="/dashboard/listings/new" style={{ ...KAN, fontSize: 14, color: C.red, textDecoration: 'none' }}>ลงขายการ์ดใบแรก →</Link>
                </div>
              </td></tr>
            ) : (
              cards.map((card, idx) => (
                <TableRow key={card.id} card={card} isLast={idx === cards.length - 1} rowBg={card.status === 'reserved' ? C.tintAmber : C.paper} rowHoverBg={card.status === 'reserved' ? '#fdeecb' : '#fcfbf9'} onOpen={() => setModalCard(card)}/>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalCard && <EditModal card={modalCard} onClose={() => setModalCard(null)} onSaved={handleSaved} onMarkedSold={handleMarkedSold} onDeleted={handleDeleted}/>}
      {toast && <Toast message={toast}/>}
    </>
  )
}
