'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { Shop, Card } from '@/types'
import { displayPrice } from '@/lib/money'
import CartDrawer from './CartDrawer'

interface BatchWithCards {
  id: string
  caption: string | null
  created_at: string
  cards: Card[]
}

interface Props {
  shop: Shop
  batches: BatchWithCards[]
}

// ── Design tokens ──────────────────────────────────────────────────────────────
const KAN: React.CSSProperties = { fontFamily: '"Kanit", sans-serif' }
const ANU: React.CSSProperties = { fontFamily: '"Anuphan", sans-serif' }
function relDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  const t = new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  if (d === 0) return `วันนี้ ${t}`
  if (d === 1) return 'เมื่อวาน'
  if (d < 30) return `${d} วันที่แล้ว`
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}
const TONES = ['#ff7a45','#2a75bb','#2e9e4f','#e3350d','#c026d3','#6b6a76']
function tone(s: string) { let h=0; for(const c of s) h=(h*31+c.charCodeAt(0))>>>0; return TONES[h%TONES.length] }

// ── Notify modal ───────────────────────────────────────────────────────────────
function NotifyModal({ cardId, cardName, onClose }: { cardId: string; cardName: string; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle'|'loading'|'success'|'error'>('idle')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || state === 'loading') return
    setState('loading')
    try {
      const r = await fetch(`/api/cards/${cardId}/waitlist`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) })
      setState(r.ok || r.status === 409 ? 'success' : 'error')
    } catch { setState('error') }
  }
  return createPortal(
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(28,27,36,.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:380, background:'#fff', border:'1.5px solid #eceaee', borderRadius:20, padding:28, boxShadow:'0 24px 60px -18px rgba(28,27,36,.4)' }}>
        {state === 'success' ? (
          <div style={{ textAlign:'center', padding:'12px 0' }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'#e8f9ef', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:28 }}>🔔</div>
            <h3 style={{ ...KAN, fontWeight:700, fontSize:18, color:'#1c1b24', margin:'0 0 8px' }}>ตั้งการแจ้งเตือนแล้ว!</h3>
            <p style={{ ...ANU, color:'#6b6a76', fontSize:14, margin:'0 0 24px', lineHeight:1.6 }}>เราจะส่งอีเมลให้คุณทันทีเมื่อการ์ดนี้ปลดล็อค</p>
            <button onClick={onClose} style={{ width:'100%', background:'#1c1b24', color:'#fff', border:'none', borderRadius:12, padding:'13px', ...KAN, fontWeight:600, fontSize:15, cursor:'pointer' }}>ปิด</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:28, marginBottom:10 }}>🔔</div>
              <h3 style={{ ...KAN, fontWeight:700, fontSize:17, color:'#1c1b24', margin:'0 0 8px' }}>แจ้งเตือนเมื่อปลดล็อค</h3>
              <p style={{ ...ANU, color:'#6b6a76', fontSize:13.5, margin:0, lineHeight:1.6 }}>การ์ด <strong style={{ color:'#1c1b24' }}>{cardName||'ใบนี้'}</strong> ถูกจองอยู่ ใส่อีเมลเพื่อรับแจ้งเตือนเมื่อปลดล็อค</p>
            </div>
            <form onSubmit={submit}>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="อีเมลของคุณ" disabled={state==='loading'} style={{ width:'100%', boxSizing:'border-box', background:'#faf7f2', border:'1.5px solid #eceaee', borderRadius:12, padding:'12px 14px', color:'#1c1b24', fontSize:15, outline:'none', marginBottom:12, ...ANU }} />
              {state==='error' && <p style={{ color:'#ee1c25', fontSize:13, margin:'0 0 10px', ...ANU }}>เกิดข้อผิดพลาด กรุณาลองอีกครั้ง</p>}
              <button type="submit" disabled={!email||state==='loading'} style={{ width:'100%', background:(!email||state==='loading')?'#ededf0':'#ee1c25', color:(!email||state==='loading')?'#a1a1aa':'#fff', border:'none', borderRadius:12, padding:'13px', ...KAN, fontWeight:700, fontSize:15, cursor:!email?'not-allowed':'pointer', marginBottom:10, boxShadow:(email&&state!=='loading')?'0 3px 0 #c0141b':'none' }}>{state==='loading'?'กำลังบันทึก...':'แจ้งเตือนฉัน'}</button>
              <button type="button" onClick={onClose} style={{ width:'100%', background:'transparent', color:'#6b6a76', border:'none', padding:'10px', fontSize:14, cursor:'pointer', ...ANU }}>ยกเลิก</button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, hasBar }: { message: string; hasBar: boolean }) {
  return createPortal(
    <div style={{ position:'fixed', left:'50%', bottom:hasBar?100:30, transform:'translateX(-50%)', background:'#1c1b24', color:'#fff', ...KAN, fontWeight:500, fontSize:14, padding:'12px 22px', borderRadius:999, boxShadow:'0 8px 24px -6px rgba(28,27,36,.5)', zIndex:300, whiteSpace:'nowrap', pointerEvents:'none', transition:'bottom .2s ease' }}>
      <span style={{ color:'#ffcb05', marginRight:8 }}>✦</span>{message}
    </div>,
    document.body
  )
}

// ── Card tile ──────────────────────────────────────────────────────────────────
function CardTile({ card, inCart, onAdd, onRemove, onNotify }: {
  card: Card; inCart: boolean
  onAdd: () => void; onRemove: () => void; onNotify: () => void
}) {
  const isSold = card.status === 'sold'
  const isReserved = card.status === 'reserved'
  const unavailable = card.status !== 'available'
  const qty = card.quantity ?? 1
  const avail = isSold
    ? { label:'หมด', bg:'#ededf0', color:'#6b6a76' }
    : isReserved
    ? { label:'จองแล้ว', bg:'#fff8d8', color:'#b47a00' }
    : qty <= 3
    ? { label:`มี ${qty}`, bg:'#fff5e0', color:'#d98800' }
    : { label:`มี ${qty}`, bg:'#e8f9ef', color:'#2e9e4f' }

  return (
    <div>
      {/* Tile wrapper */}
      <div style={{ position:'relative', background:inCart?'rgba(255,203,5,.1)':'rgba(255,255,255,.07)', border:`1.5px solid ${inCart?'#ffcb05':unavailable?'rgba(255,255,255,.08)':'rgba(255,255,255,.14)'}`, borderRadius:15, padding:11, boxShadow:inCart?'0 0 0 3px rgba(255,203,5,.22)':'none', transition:'border-color .15s, box-shadow .15s', cursor: unavailable ? 'default' : 'pointer' }}
        onClick={unavailable ? undefined : onAdd}
      >
        {/* Avail badge */}
        <div style={{ position:'absolute', top:-8, right:-8, zIndex:2, background:avail.bg, color:avail.color, ...KAN, fontWeight:700, fontSize:10.5, padding:'3px 8px', borderRadius:999, border:'2px solid rgba(30,24,20,.85)', boxShadow:'0 2px 6px rgba(28,27,36,.3)' }}>{avail.label}</div>

        {/* Image */}
        <div style={{ position:'relative', aspectRatio:'63/88', borderRadius:10, overflow:'hidden' }}>
          {card.image_url
            ? <img src={card.image_url} alt={card.name||'การ์ด'} style={{ width:'100%', height:'100%', objectFit:'cover', opacity:unavailable?.5:1, filter:unavailable?'grayscale(.4)':'none' }} />
            : <div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg,${tone(card.name||card.id)}cc,${tone(card.name||card.id)}44)`, display:'flex', alignItems:'center', justifyContent:'center', opacity:unavailable?.5:1 }}><span style={{ fontSize:'2.2em' }}>🃏</span></div>
          }
          {/* Sold overlay */}
          {isSold && <div style={{ position:'absolute', inset:0, background:'rgba(10,8,6,.62)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ ...KAN, fontWeight:600, fontSize:13, color:'rgba(255,255,255,.7)' }}>ขายแล้ว</span></div>}
          {/* Reserved overlay */}
          {isReserved && (
            <div style={{ position:'absolute', inset:0, background:'rgba(10,8,6,.5)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
              <span style={{ ...KAN, fontWeight:700, fontSize:12, color:'#ffcb05' }}>จองแล้ว</span>
              <button onClick={e=>{e.stopPropagation();onNotify()}} style={{ background:'rgba(255,255,255,.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.3)', borderRadius:20, padding:'5px 12px', color:'#fff', ...KAN, fontWeight:700, fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>🔔 แจ้งเตือน</button>
            </div>
          )}
          {/* In-cart check */}
          {inCart && <div style={{ position:'absolute', top:6, left:6, width:22, height:22, borderRadius:'50%', background:'#ffcb05', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, boxShadow:'0 2px 6px rgba(0,0,0,.3)' }}>✓</div>}
          {/* Price pill */}
          {!isSold && <div style={{ position:'absolute', bottom:7, left:'50%', transform:'translateX(-50%)', background:'#ffcb05', color:'#1c1b24', ...KAN, fontWeight:700, fontSize:11.5, padding:'3px 10px', borderRadius:999, boxShadow:'0 2px 8px rgba(0,0,0,.35)', whiteSpace:'nowrap', pointerEvents:'none' }}>{displayPrice(card.price)}</div>}
        </div>
      </div>

      {/* Control row */}
      <div style={{ height:40, marginTop:8, display:'flex', alignItems:'center' }}>
        {isSold ? (
          <span style={{ ...KAN, fontWeight:600, fontSize:13, color:'rgba(255,255,255,.4)', textAlign:'center', width:'100%' }}>ขายแล้ว</span>
        ) : isReserved ? (
          <span style={{ ...KAN, fontWeight:600, fontSize:12, color:'rgba(255,203,5,.7)', textAlign:'center', width:'100%' }}>กำลังจอง…</span>
        ) : inCart ? (
          <div style={{ display:'flex', alignItems:'center', background:'#fff', borderRadius:11, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.28)', width:'100%', height:40 }}>
            <button onClick={e=>{e.stopPropagation();onRemove()}} style={{ flex:1, height:40, background:'#fff', border:'none', cursor:'pointer', color:'#ee1c25', fontSize:18, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>✕</button>
            <span style={{ ...KAN, fontWeight:700, fontSize:16, color:'#1c1b24', width:32, textAlign:'center' }}>1</span>
            <button disabled style={{ flex:1, height:40, background:'#f0eee9', border:'none', cursor:'not-allowed', color:'#c0bdc8', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>+</button>
          </div>
        ) : (
          <button onClick={e=>{e.stopPropagation();onAdd()}} style={{ width:'100%', height:40, background:'#ffcb05', color:'#1c1b24', border:'none', borderRadius:11, ...KAN, fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:'0 3px 0 #eaa600' }}>ใส่ตะกร้า</button>
        )}
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ShopView({ shop, batches }: Props) {
  const [cart, setCart] = useState<Set<string>>(new Set())
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string|null>(null)
  const [notifyCardId, setNotifyCardId] = useState<string|null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeBatchId, setActiveBatchId] = useState<string|null>(null)
  const toastRef = useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(() => {
    setMounted(true)
    // Read ?batch= from URL on client
    const p = new URLSearchParams(window.location.search)
    const b = p.get('batch')
    if (b) setActiveBatchId(b)
  }, [])

  const displayBatches = activeBatchId
    ? batches.filter(b => b.id === activeBatchId)
    : batches

  const allCards = batches.flatMap(b => b.cards)
  const notifyCard = notifyCardId ? allCards.find(c => c.id === notifyCardId) : null

  function addCard(card: Card) {
    setCart(prev => new Set([...prev, card.id]))
    if (toastRef.current) clearTimeout(toastRef.current)
    setToastMsg(`${card.name||'การ์ด'} — ใส่ตะกร้าแล้ว`)
    toastRef.current = setTimeout(() => setToastMsg(null), 2000)
  }
  function removeCard(cardId: string) {
    setCart(prev => { const n = new Set(prev); n.delete(cardId); return n })
  }

  const cartCards = [...cart].map(id => allCards.find(c => c.id === id)).filter(Boolean) as Card[]
  const totalAmount = cartCards.reduce((s, c) => s + c.price, 0)
  const initial = shop.name.charAt(0).toUpperCase()

  return (
    <div style={{ minHeight:'100vh', background:'#f4efe7', ...ANU }}>

      {/* ── Trust bar ─────────────────────────────────────────── */}
      <div style={{ background:'#fff', borderBottom:'1.5px solid #eceaee', position:'sticky', top:0, zIndex:40 }}>
        <div style={{ maxWidth:880, margin:'0 auto', padding:'11px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:'linear-gradient(135deg,#ffcb05,#ee1c25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>🃏</div>
            <span style={{ ...KAN, fontWeight:700, fontSize:17, color:'#1c1b24' }}>ละเล่น</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, color:'#6b6a76', fontSize:13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ee1c25" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            โพสต์ขายที่แชร์ผ่านลิงก์
          </div>
        </div>
      </div>

      {/* ── Hero banner ───────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(110deg,rgba(86,7,9,.28),transparent 55%),radial-gradient(120% 130% at 88% 0%,#ff7a45 0%,transparent 55%),linear-gradient(150deg,#ee1c25,#c0141b)' }}>
        <div style={{ maxWidth:880, margin:'0 auto', padding:'30px 24px 34px', display:'flex', alignItems:'flex-start', gap:22, flexWrap:'wrap' }}>
          {/* Avatar */}
          <div style={{ width:74, height:74, borderRadius:22, flexShrink:0, background:'rgba(255,255,255,.15)', border:'2px solid rgba(255,255,255,.3)', display:'flex', alignItems:'center', justifyContent:'center', ...KAN, fontWeight:800, fontSize:34, color:'#fff', boxShadow:'0 10px 26px -8px rgba(60,4,6,.5)' }}>{initial}</div>

          {/* Meta */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
              <h1 style={{ ...KAN, fontWeight:700, fontSize:27, color:'#fff', margin:0, textShadow:'0 2px 14px rgba(78,6,8,.4)', lineHeight:1.15 }}>{shop.name}</h1>
              <span style={{ background:'rgba(255,255,255,.18)', border:'1.5px solid rgba(255,255,255,.32)', borderRadius:999, padding:'4px 11px', ...KAN, fontWeight:600, fontSize:12, color:'#fff' }}>ยืนยันบัญชีแล้ว</span>
            </div>
            {shop.description && <p style={{ fontSize:14, color:'rgba(255,255,255,.85)', margin:0, lineHeight:1.55 }}>{shop.description}</p>}
          </div>

          {/* Trust box */}
          <div style={{ background:'rgba(255,255,255,.13)', border:'1.5px solid rgba(255,255,255,.22)', borderRadius:14, padding:'12px 16px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
              <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>💳</span>
              <div>
                <p style={{ ...KAN, fontWeight:700, fontSize:13, color:'#fff', margin:'0 0 3px' }}>โอนตรงเข้าบัญชีผู้ขาย</p>
                <p style={{ ...ANU, fontSize:12, color:'rgba(255,255,255,.8)', margin:0, lineHeight:1.55 }}>เงินไม่ผ่านระบบ · ตรวจสอบสลิปอัตโนมัติ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Posts ─────────────────────────────────────────────── */}
      <div style={{ maxWidth:880, margin:'0 auto', padding:'0 24px' }}>
        {displayBatches.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 20px', color:'#6b6a76', ...ANU }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🃏</div>
            <p style={{ fontSize:16 }}>ยังไม่มีสินค้าในร้านนี้</p>
          </div>
        )}

        {displayBatches.map((batch) => {
          const batchCards = batch.cards
          const availableCount = batchCards.filter(c => c.status === 'available').length
          const totalCount = batchCards.length

          return (
            <div key={batch.id}>
              {/* Post title panel */}
              <div style={{ padding:'26px 0 16px' }}>
                <div style={{ background:'#fff', border:'1.5px solid #eceaee', borderLeft:'5px solid #ffcb05', borderRadius:14, padding:'20px 24px', boxShadow:'0 8px 24px -18px rgba(28,27,36,.4)' }}>
                  <span style={{ background:'#ee1c25', color:'#fff', ...KAN, fontWeight:700, fontSize:12, padding:'5px 12px', borderRadius:999, letterSpacing:'.02em' }}>✦ โพสต์ขาย</span>
                  <h2 style={{ ...KAN, fontWeight:700, fontSize:22, color:'#1c1b24', margin:'10px 0 0', lineHeight:1.2 }}>
                    {batch.caption?.trim() || `โพสต์ขาย ${totalCount} ใบ`}
                  </h2>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:14, paddingTop:14, borderTop:'1.5px solid #eceaee', fontSize:13.5, color:'#6b6a76', flexWrap:'wrap' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ color:'#ee1c25', fontSize:15 }}>⬡</span>{totalCount} ใบ
                    </span>
                    <span>·</span>
                    <span>ลงเมื่อ {relDate(batch.created_at)}</span>
                    {availableCount < totalCount && <>
                      <span>·</span>
                      <span style={{ color:'#2e9e4f', ...KAN, fontWeight:600 }}>เหลือ {availableCount} ใบ</span>
                    </>}
                  </div>
                </div>
              </div>

              {/* Card grid */}
              <div style={{ paddingBottom: 20 }}>
                <div style={{ background:'#fff', border:'1.5px solid #eceaee', borderRadius:20, overflow:'hidden', boxShadow:'0 18px 44px -26px rgba(28,27,36,.4)' }}>
                  {/* Top bar */}
                  <div style={{ padding:'13px 16px', borderBottom:'1.5px solid #eceaee', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:7, ...KAN, fontWeight:600, color:'#ee1c25' }}>🎴 รูปจากผู้ขาย</span>
                    <span style={{ color:'#6b6a76', ...ANU, fontSize:12.5, textAlign:'right' }}>แตะการ์ด หรือกด "ใส่ตะกร้า" เพื่อซื้อ</span>
                  </div>

                  {/* Dark grid area */}
                  <div style={{ background:'linear-gradient(150deg,#2b2620,#191510)', padding:'24px 18px 18px' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                      {batchCards.map(card => (
                        <CardTile
                          key={card.id}
                          card={card}
                          inCart={cart.has(card.id)}
                          onAdd={() => addCard(card)}
                          onRemove={() => removeCard(card.id)}
                          onNotify={() => setNotifyCardId(card.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bottom help */}
                  <div style={{ padding:'12px 16px', borderTop:'1.5px solid #eceaee', fontSize:12.5, color:'#6b6a76', display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ color:'#2e9e4f' }}>🏷</span>
                    ตัวเลขมุมการ์ดคือจำนวนใบที่มีขาย · เลือกได้ตามจำนวนที่มี
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div style={{ background:'#fff', borderTop:'1.5px solid #eceaee', marginTop:20, paddingBottom: cart.size > 0 ? 92 : 0 }}>
        <div style={{ maxWidth:880, margin:'0 auto', padding:'22px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:22, height:22, borderRadius:6, background:'linear-gradient(135deg,#ffcb05,#ee1c25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>🃏</div>
            <span style={{ ...KAN, fontWeight:700, fontSize:15, color:'#1c1b24' }}>ละเล่น</span>
          </div>
          <p style={{ ...ANU, fontSize:12.5, color:'#6b6a76', margin:0, maxWidth:'60ch', textAlign:'right', lineHeight:1.6 }}>
            ละเล่นเป็นเครื่องมือช่วยขาย ไม่ใช่ตัวกลางถือเงิน — เงินโอนตรงระหว่างผู้ซื้อกับผู้ขาย โปรดตรวจสอบผู้ขายก่อนโอนทุกครั้ง
          </p>
        </div>
      </div>

      {/* ── Sticky checkout bar ───────────────────────────────── */}
      {cart.size > 0 && (
        <div style={{ position:'fixed', left:0, right:0, bottom:0, background:'#fff', borderTop:'1.5px solid #e0dde3', boxShadow:'0 -8px 24px -12px rgba(28,27,36,.3)', zIndex:50 }}>
          <div style={{ maxWidth:880, margin:'0 auto', padding:'14px 24px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ flex:1 }}>
              <span style={{ ...KAN, fontSize:16, color:'#1c1b24' }}>
                {cart.size} ใบ · <span style={{ color:'#ee1c25', fontWeight:700, fontSize:19 }}>{displayPrice(totalAmount)}</span>
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, color:'#d98800', ...KAN, fontWeight:600, fontSize:12.5 }}>
              <span>⏱</span> จองราคาให้ 10 นาที
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              style={{ background:'#ee1c25', color:'#fff', border:'none', borderRadius:13, padding:'13px 30px', ...KAN, fontWeight:600, fontSize:16, cursor:'pointer', boxShadow:'0 4px 0 #c0141b', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}
            >💳 ชำระเงิน</button>
          </div>
        </div>
      )}

      {/* ── CartDrawer ────────────────────────────────────────── */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cartCards} shop={shop} onRemove={removeCard} />

      {/* ── Notify modal ──────────────────────────────────────── */}
      {mounted && notifyCardId && (
        <NotifyModal cardId={notifyCardId} cardName={notifyCard?.name??''} onClose={() => setNotifyCardId(null)} />
      )}

      {/* ── Toast ──────────────────────────────────────────────── */}
      {mounted && toastMsg && <Toast message={toastMsg} hasBar={cart.size > 0} />}
    </div>
  )
}
