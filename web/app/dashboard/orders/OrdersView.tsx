'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending_payment' | 'verifying' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export interface OrderItem {
  id: string
  price_snapshot: number
  cards: { id: string; name: string; image_url: string; condition: string } | null
}

export interface Order {
  id: string
  status: OrderStatus
  total_amount: number
  buyer_email: string | null
  tracking_number: string | null
  created_at: string
  buyer_name: string | null
  buyer_phone: string | null
  buyer_address: string | null
  expires_at: string | null
  order_items: OrderItem[]
}

// ─── Color tokens ─────────────────────────────────────────────────────────────

const C = {
  red: '#ee1c25', redDeep: '#c0141b', blue: '#2a75bb',
  green: '#2e9e4f', greenDeep: '#207a3c',
  ink: '#1c1b24', muted: '#6b6a76', paper: '#fff',
  line: '#eceaee', tintRed: '#fff1ef', tintBlue: '#eef5ff', tintGreen: '#e9f7ee',
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconReceipt({ s = 16, c = 'currentColor' }: { s?: number; c?: string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l3-3 3 3 3-3 3 3 3-3V2z"/><path d="M8 7h8M8 11h6"/></svg>
}
function IconTag({ s = 16, c = 'currentColor' }: { s?: number; c?: string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
}
function IconStore({ s = 16, c = 'currentColor' }: { s?: number; c?: string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1-6h16l1 6"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M5 9v12h14V9"/><rect x="9" y="14" width="6" height="7"/></svg>
}
function IconCheck({ s = 16, c = 'currentColor' }: { s?: number; c?: string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
}
function IconX({ s = 16, c = 'currentColor' }: { s?: number; c?: string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
}
function IconBell({ s = 16, c = 'currentColor' }: { s?: number; c?: string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
}
function IconStar() {
  return <svg width={15} height={15} viewBox="0 0 24 24" fill="#ffcb05" stroke="#ffcb05" strokeWidth={1}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}

// ─── Countdown timer ──────────────────────────────────────────────────────────

function useCountdown(expiresAt: string | null) {
  const [secs, setSecs] = useState(() =>
    expiresAt ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)) : 0
  )
  useEffect(() => {
    if (!expiresAt) return
    const id = setInterval(() => {
      setSecs(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)))
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  return secs
}

function Countdown({ expiresAt }: { expiresAt: string | null }) {
  const secs = useCountdown(expiresAt)
  if (!expiresAt) return null
  if (secs <= 0) return (
    <span style={{ fontFamily: 'Kanit,sans-serif', fontSize: 11.5, fontWeight: 700, color: C.muted, background: '#f3f2f4', padding: '4px 10px', borderRadius: 999 }}>
      หมดเวลา
    </span>
  )
  const m = Math.floor(secs / 60)
  const s = secs % 60
  const urgent = secs < 120
  return (
    <span style={{
      fontFamily: 'Kanit,sans-serif', fontSize: 12, fontWeight: 700,
      color: urgent ? '#c05c00' : '#a36b00',
      background: urgent ? '#fff0e0' : '#fff5e0',
      border: `1px solid ${urgent ? '#f5c08a' : '#f0d890'}`,
      padding: '4px 10px', borderRadius: 999,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      ⏱ {m}:{s.toString().padStart(2, '0')}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { bg: string; color: string; label: string }> = {
    paid:            { bg: C.tintRed,   color: C.red,       label: 'รอส่ง' },
    shipped:         { bg: C.tintBlue,  color: C.blue,      label: 'ส่งแล้ว' },
    completed:       { bg: C.tintGreen, color: C.greenDeep, label: 'จบแล้ว' },
    verifying:       { bg: '#f6f3ee',   color: C.muted,     label: 'รอตรวจสลิป' },
    pending_payment: { bg: '#fff5e0',   color: '#a36b00',   label: 'จอง' },
    cancelled:       { bg: '#f6f3ee',   color: C.muted,     label: 'ยกเลิก' },
  }
  const s = map[status]
  return <span style={{ fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: 11.5, padding: '4px 11px', borderRadius: 999, background: s.bg, color: s.color, display: 'inline-block' }}>{s.label}</span>
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  return (
    <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 16}px)`, opacity: visible ? 1 : 0, transition: 'opacity .22s, transform .22s', zIndex: 100, background: C.ink, color: '#fff', fontFamily: 'Kanit,sans-serif', fontWeight: 500, fontSize: 14, padding: '12px 22px', borderRadius: 999, boxShadow: '0 12px 30px -8px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
      <IconStar />{msg}
    </div>
  )
}

// ─── Ship Modal ───────────────────────────────────────────────────────────────

function ShipModal({ order, onClose, onSuccess }: { order: Order; onClose: () => void; onSuccess: (id: string, tracking: string) => void }) {
  const [tracking, setTracking] = useState(order.tracking_number ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (tracking.length < 6 || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tracking_number: tracking }) })
      if (res.ok) { onSuccess(order.id, tracking); onClose() }
    } finally { setSubmitting(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440, background: C.paper, borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 60px -12px rgba(0,0,0,.28)' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1.5px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: 17 }}>ใส่เลขพัสดุ <span style={{ color: C.muted, fontWeight: 500, fontSize: 14 }}>#{order.id.slice(-8).toUpperCase()}</span></span>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${C.line}`, background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted }}><IconX s={16}/></button>
        </div>
        <div style={{ padding: '22px 22px 0' }}>
          <label style={{ display: 'block', fontFamily: 'Kanit,sans-serif', fontWeight: 500, fontSize: 13, color: C.ink, marginBottom: 8 }}>เลขพัสดุ (พิมพ์เอง)</label>
          <input
            autoFocus
            value={tracking}
            onChange={e => setTracking(e.target.value.toUpperCase().slice(0, 20))}
            placeholder="เช่น EM123456789TH"
            style={{ width: '100%', boxSizing: 'border-box', background: '#faf9f7', border: `1.5px solid ${C.line}`, borderRadius: 11, padding: '12px 14px', fontSize: 15, fontFamily: 'Anuphan,sans-serif', outline: 'none', letterSpacing: '0.04em' }}
            onFocus={e => { e.target.style.borderColor = C.red; e.target.style.boxShadow = '0 0 0 3px rgba(238,28,37,.1)' }}
            onBlur={e => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, marginBottom: 22 }}>
            <IconBell s={14} c={C.blue}/>
            <span style={{ fontSize: 12, color: C.muted, fontFamily: 'Kanit,sans-serif' }}>ระบบจะแจ้งผู้ซื้อทางอีเมลว่าจัดส่งแล้ว พร้อมเลขนี้</span>
          </div>
        </div>
        <div style={{ padding: '0 22px 22px' }}>
          <button onClick={handleSubmit} disabled={tracking.length < 6 || submitting} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: tracking.length < 6 ? '#e0dde3' : C.red, color: tracking.length < 6 ? C.muted : '#fff', border: 'none', borderRadius: 13, padding: '13px 0', fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: 15, cursor: tracking.length < 6 ? 'not-allowed' : 'pointer', boxShadow: tracking.length >= 6 ? `0 4px 0 ${C.redDeep}` : 'none' }}>
            <IconCheck s={16} c={tracking.length < 6 ? C.muted : '#fff'}/> ยืนยันจัดส่ง
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ order, onClose, onOpenShip, onComplete }: { order: Order; onClose: () => void; onOpenShip: (o: Order) => void; onComplete: (id: string) => void }) {
  const [copied, setCopied] = useState(false)
  const [completing, setCompleting] = useState(false)

  const idSuffix = order.id.slice(-8).toUpperCase()
  const dateStr = new Date(order.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
  const timeStr = new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  const items = order.order_items ?? []

  function copyTracking() {
    if (!order.tracking_number) return
    navigator.clipboard.writeText(order.tracking_number)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  async function handleComplete() {
    if (completing) return
    setCompleting(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed' }) })
      if (res.ok) { onComplete(order.id); onClose() }
    } finally { setCompleting(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440, background: C.paper, borderRadius: 20, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px -12px rgba(0,0,0,.28)' }}>
        {/* Head */}
        <div style={{ padding: '20px 22px', borderBottom: `1.5px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: 17 }}>ออเดอร์ #{idSuffix}</span>
          <span style={{ fontSize: 12, color: C.muted }}>{dateStr} {timeStr}</span>
          <StatusBadge status={order.status}/>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', marginLeft: 'auto', flexShrink: 0, border: `1.5px solid ${C.line}`, background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted }}><IconX s={16}/></button>
        </div>

        {/* Body */}
        <div style={{ padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* รายการ */}
          <div>
            <div style={{ textTransform: 'uppercase', fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: 12, letterSpacing: '0.04em', color: C.muted, marginBottom: 10 }}>รายการ ({items.length} ใบ)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {items.map(item => (
                <div key={item.id} style={{ border: `1.5px solid ${C.line}`, borderRadius: 13, padding: 11, display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div style={{ width: 38, aspectRatio: '63/88', borderRadius: 6, overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#f0eeeb' }}>
                    {item.cards?.image_url && <Image src={item.cards.image_url} alt={item.cards.name} fill sizes="38px" style={{ objectFit: 'cover' }}/>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: 14, color: C.ink }}>{item.cards?.name ?? 'การ์ด'}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{item.cards?.condition ?? ''}</div>
                  </div>
                  <div style={{ fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: 15, color: C.ink, flexShrink: 0 }}>฿{(item.price_snapshot / 100).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 13, borderTop: `1.5px dashed ${C.line}`, marginTop: 4 }}>
              <span style={{ fontSize: 13.5, color: C.muted, fontFamily: 'Kanit,sans-serif' }}>ยอดรวมทั้งหมด</span>
              <span style={{ fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: 24, color: C.ink }}>฿{(order.total_amount / 100).toLocaleString()}</span>
            </div>
          </div>

          {/* ผู้ซื้อ */}
          <div>
            <div style={{ textTransform: 'uppercase', fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: 12, letterSpacing: '0.04em', color: C.muted, marginBottom: 10 }}>ผู้ซื้อ</div>
            {[{ key: 'อีเมล', value: order.buyer_email ?? '-' }, { key: 'การชำระเงิน', value: 'ตรวจสลิปผ่าน', vc: C.green }].map(row => (
              <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, padding: '5px 0' }}>
                <span style={{ color: C.muted, fontFamily: 'Kanit,sans-serif' }}>{row.key}</span>
                <span style={{ fontFamily: 'Kanit,sans-serif', fontWeight: 600, color: row.vc ?? C.ink }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* การจัดส่ง */}
          {order.tracking_number && (
            <div>
              <div style={{ textTransform: 'uppercase', fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: 12, letterSpacing: '0.04em', color: C.muted, marginBottom: 10 }}>การจัดส่ง</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.tintBlue, border: '1.5px solid #cfe1f5', borderRadius: 12, padding: '12px 14px' }}>
                <IconStore s={18} c={C.blue}/>
                <span style={{ fontSize: 14, fontFamily: 'Kanit,sans-serif', color: C.ink }}>เลขพัสดุ <b style={{ fontFamily: 'Anuphan,sans-serif', fontWeight: 600, letterSpacing: '0.02em' }}>{order.tracking_number}</b></span>
                <button onClick={copyTracking} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.blue, fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}>
                  {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(order.status === 'paid' || order.status === 'shipped') && (
          <div style={{ padding: '18px 22px', borderTop: `1.5px solid ${C.line}`, flexShrink: 0 }}>
            {order.status === 'paid' && (
              <button onClick={() => { onClose(); onOpenShip(order) }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: C.red, color: '#fff', border: 'none', borderRadius: 13, padding: '13px 0', fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: `0 4px 0 ${C.redDeep}` }}>
                <IconStore s={16} c="#fff"/> ใส่เลขพัสดุ + แจ้งส่ง
              </button>
            )}
            {order.status === 'shipped' && (
              <button onClick={handleComplete} disabled={completing} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: C.green, color: '#fff', border: 'none', borderRadius: 13, padding: '13px 0', fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: 15, cursor: completing ? 'not-allowed' : 'pointer', boxShadow: `0 4px 0 ${C.greenDeep}`, opacity: completing ? 0.7 : 1 }}>
                <IconCheck s={16} c="#fff"/> ผู้ซื้อได้รับแล้ว · ปิดออเดอร์
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function OrdersView({ shopId, initialOrders }: { shopId: string; initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [activeTab, setActiveTab] = useState<'reserved' | 'toship' | 'shipped' | 'done'>('reserved')
  const [query, setQuery] = useState('')
  const [shipOrder, setShipOrder] = useState<Order | null>(null)
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, visible: true })
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000)
  }

  async function refreshOrders() {
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select(`id, status, total_amount, buyer_email, tracking_number, created_at, buyer_name, buyer_phone, buyer_address, order_items(id, price_snapshot, cards(id, name, image_url, condition))`)
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
    if (data) setOrders(data as unknown as Order[])
  }

  const counts = {
    reserved: orders.filter(o => o.status === 'pending_payment').length,
    toship:   orders.filter(o => o.status === 'paid').length,
    shipped:  orders.filter(o => o.status === 'shipped').length,
    done:     orders.filter(o => o.status === 'completed').length,
  }

  const tabFiltered = orders.filter(o => {
    if (activeTab === 'reserved') return o.status === 'pending_payment'
    if (activeTab === 'toship')   return o.status === 'paid'
    if (activeTab === 'shipped')  return o.status === 'shipped'
    if (activeTab === 'done')     return o.status === 'completed'
    return false
  })
  const filteredOrders = query.trim() ? tabFiltered.filter(o => o.id.slice(-8).toUpperCase().includes(query.toUpperCase()) || (o.buyer_email ?? '').toLowerCase().includes(query.toLowerCase())) : tabFiltered

  function handleShipSuccess(orderId: string, tracking: string) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped' as OrderStatus, tracking_number: tracking } : o))
    showToast('บันทึกเลขพัสดุ · แจ้งผู้ซื้อแล้ว')
  }
  function handleComplete(orderId: string) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' as OrderStatus } : o))
    showToast('ปิดออเดอร์เรียบร้อย')
  }

  const liveDetailOrder = detailOrder ? (orders.find(o => o.id === detailOrder.id) ?? detailOrder) : null
  const tabs: { key: 'reserved' | 'toship' | 'shipped' | 'done'; label: string }[] = [
    { key: 'reserved', label: 'จอง' },
    { key: 'toship',   label: 'รอส่ง' },
    { key: 'shipped',  label: 'ส่งแล้ว' },
    { key: 'done',     label: 'จบ' },
  ]

  return (
    <div style={{ fontFamily: 'Kanit,sans-serif', color: C.ink }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {/* Segmented tabs */}
        <div style={{ display: 'inline-flex', background: C.paper, border: '1.5px solid #e0dde3', borderRadius: 11, padding: 4, gap: 2 }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: 13.5, padding: '8px 16px', borderRadius: 8, border: 'none', background: activeTab === tab.key ? C.ink : 'transparent', color: activeTab === tab.key ? '#fff' : C.muted, cursor: 'pointer', transition: 'background .15s, color .15s' }}>
              {tab.label} <span style={{ opacity: 0.6 }}>{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, maxWidth: 340, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.muted, display: 'flex' }}>
            <IconReceipt s={15}/>
          </span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาเลขออเดอร์ เช่น 1042…"
            style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #e0dde3', borderRadius: 11, padding: '10px 36px 10px 38px', fontSize: 14, fontFamily: 'Kanit,sans-serif', background: C.paper, color: C.ink, outline: 'none' }}
            onFocus={e => { e.target.style.borderColor = C.red; e.target.style.boxShadow = '0 0 0 3px rgba(238,28,37,.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e0dde3'; e.target.style.boxShadow = 'none' }}
          />
          {query && <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: C.muted }}><IconX s={14}/></button>}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 16, overflow: 'hidden' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: '54px 20px', textAlign: 'center', color: C.muted, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 58, height: 58, background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconReceipt s={26} c={C.muted}/></div>
            <span style={{ fontFamily: 'Kanit,sans-serif', fontSize: 15 }}>ยังไม่มีออเดอร์ในสถานะนี้</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['ออเดอร์', 'สินค้า', 'ผู้ซื้อ', 'ยอดรวม', 'สถานะ', 'จัดการ'].map((col, i) => (
                  <th key={col} style={{ fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: 12.5, color: C.muted, padding: '13px 18px', borderBottom: `1.5px solid ${C.line}`, background: '#fcfbf9', textAlign: (i === 3 ? 'right' : i === 4 ? 'center' : i === 5 ? 'right' : 'left') as React.CSSProperties['textAlign'], whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => {
                const idSuffix = '#' + order.id.slice(-8).toUpperCase()
                const dateStr = new Date(order.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
                const timeStr = new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                const itemCount = (order.order_items ?? []).length
                const isLast = idx === filteredOrders.length - 1
                return (
                  <tr key={order.id} onClick={() => setDetailOrder(order)} style={{ cursor: 'pointer', borderBottom: isLast ? 'none' : `1.5px solid ${C.line}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fcfbf9')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <b style={{ fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: 14.5 }}>{idSuffix}</b>
                        <span style={{ fontSize: 11.5, color: C.muted }}>{dateStr} · {timeStr}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f6f3ee', border: '1.5px solid #e0dde3', borderRadius: 999, padding: '5px 12px', fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                        <IconTag s={13} c={C.red}/>{itemCount} ใบ
                      </span>
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 13.5, color: C.muted, maxWidth: 160 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.buyer_email ?? '-'}</span>
                    </td>
                    <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                      <span style={{ fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: 15 }}>฿{(order.total_amount / 100).toLocaleString()}</span>
                    </td>
                    <td style={{ padding: '13px 18px', textAlign: 'center' }}>
                      {order.status === 'pending_payment'
                        ? <Countdown expiresAt={order.expires_at}/>
                        : <StatusBadge status={order.status}/>
                      }
                    </td>
                    <td style={{ padding: '13px 18px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      {order.status === 'pending_payment' && (
                        <button onClick={() => setDetailOrder(order)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1.5px solid #e0dde3', background: C.paper, fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: 13, padding: '7px 14px', borderRadius: 9, cursor: 'pointer', color: C.ink, transition: 'border-color .15s, color .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0dde3'; e.currentTarget.style.color = C.ink }}>
                          <IconReceipt s={13}/> ดู
                        </button>
                      )}
                      {order.status === 'paid' && (
                        <button onClick={() => setShipOrder(order)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1.5px solid #e0dde3', background: C.paper, fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: 13, padding: '7px 14px', borderRadius: 9, cursor: 'pointer', color: C.ink, transition: 'border-color .15s, color .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0dde3'; e.currentTarget.style.color = C.ink }}>
                          <IconStore s={13}/> ส่งของ
                        </button>
                      )}
                      {(order.status === 'shipped' || order.status === 'completed') && (
                        <button onClick={() => setDetailOrder(order)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1.5px solid #e0dde3', background: C.paper, fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: 13, padding: '7px 14px', borderRadius: 9, cursor: 'pointer', color: C.ink, transition: 'border-color .15s, color .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0dde3'; e.currentTarget.style.color = C.ink }}>
                          <IconReceipt s={13}/> ดู
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {shipOrder && <ShipModal order={shipOrder} onClose={() => setShipOrder(null)} onSuccess={handleShipSuccess}/>}
      {liveDetailOrder && <DetailModal order={liveDetailOrder} onClose={() => setDetailOrder(null)} onOpenShip={o => { setDetailOrder(null); setShipOrder(o) }} onComplete={handleComplete}/>}
      <Toast msg={toast.msg} visible={toast.visible}/>
    </div>
  )
}
