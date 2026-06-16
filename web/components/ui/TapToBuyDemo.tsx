'use client'

import { useState } from 'react'

const KAN = { fontFamily: 'var(--font-kanit), sans-serif' } as const

type Tone = 'fire' | 'water' | 'electric' | 'grass' | 'psychic'

const ART: Record<Tone, string> = {
  fire:     'radial-gradient(120% 120% at 30% 20%, #ffd9a8, #ff7a45 55%, #e3350d)',
  water:    'radial-gradient(120% 120% at 30% 20%, #bae0ff, #4096ff 55%, #0958d9)',
  grass:    'radial-gradient(120% 120% at 30% 20%, #d9f7be, #73d13d 55%, #389e0d)',
  electric: 'radial-gradient(120% 120% at 30% 20%, #fff1b8, #ffcb05 55%, #d48806)',
  psychic:  'radial-gradient(120% 120% at 30% 20%, #efdbff, #b37feb 55%, #722ed1)',
}

const CARDS: { tone: Tone; name: string; hp: number; price: number; stars: number; rarity: string }[] = [
  { tone: 'fire',     name: 'ชาร์ระดับ', hp: 120, price: 850,  stars: 3, rarity: 'EX' },
  { tone: 'water',    name: 'เกียวคู',   hp: 90,  price: 320,  stars: 2, rarity: 'R'  },
  { tone: 'electric', name: 'พิคา',      hp: 60,  price: 1500, stars: 3, rarity: 'SR' },
  { tone: 'grass',    name: 'บัลบา',     hp: 70,  price: 180,  stars: 1, rarity: 'C'  },
  { tone: 'psychic',  name: 'มิว',       hp: 110, price: 2400, stars: 3, rarity: 'UR' },
  { tone: 'fire',     name: 'ริซาร์',    hp: 130, price: 990,  stars: 3, rarity: 'EX' },
]

function Star() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}

function CardItem({ card, picked, onToggle }: {
  card: typeof CARDS[0]
  picked: boolean
  onToggle: () => void
}) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: 'pointer',
        position: 'relative',
        transform: hov ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform .18s ease',
        containerType: 'inline-size',
      }}
    >
      {/* Card body */}
      <div style={{
        aspectRatio: '63/88',
        borderRadius: 10,
        background: '#fff',
        padding: '7%',
        display: 'flex',
        flexDirection: 'column',
        gap: '5%',
        boxShadow: '0 10px 26px -8px rgba(20,18,15,.35)',
        border: '2.5px solid #1b1b22',
        overflow: 'hidden',
        position: 'relative',
        outline: picked ? '3px solid #ffcb05' : '3px solid transparent',
        outlineOffset: 2,
        transition: 'outline-color .15s',
      }}>
        {/* Price tag */}
        <div style={{
          position: 'absolute', right: -6, top: '11%',
          background: '#ffcb05', color: '#1b1b22',
          fontWeight: 800, fontSize: 'clamp(9px,2.2cqw,13px)',
          padding: '5px 12px 5px 10px',
          borderRadius: '999px 0 0 999px',
          boxShadow: '-3px 4px 0 rgba(0,0,0,.18)',
          border: '2px solid #1b1b22', borderRight: 'none',
          ...KAN, whiteSpace: 'nowrap',
        }}>
          ฿{card.price.toLocaleString()}
        </div>

        {/* Top: name + HP */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4, lineHeight: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 'clamp(10px,2.6cqw,15px)', color: '#1b1b22', ...KAN, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
            {card.name}
          </span>
          <span style={{ fontWeight: 800, fontSize: 'clamp(8px,2cqw,12px)', color: '#ee1c25', whiteSpace: 'nowrap', flexShrink: 0, ...KAN }}>
            <small style={{ color: '#1b1b22', opacity: .55, fontSize: '.7em' }}>HP</small> {card.hp}
          </span>
        </div>

        {/* Art */}
        <div style={{
          flex: 1, borderRadius: 6, border: '2px solid rgba(0,0,0,.12)',
          background: ART[card.tone], display: 'grid', placeItems: 'center',
          overflow: 'hidden', position: 'relative',
        }}>
          <div style={{ position: 'absolute', width: '130%', height: '130%', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,.7), transparent 55%)', opacity: .6 }} />
          <svg width="46%" height="46%" viewBox="0 0 24 24" fill="rgba(255,255,255,.85)" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.18))', position: 'relative' }}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </div>

        {/* Foot: stars + rarity */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ display: 'flex', gap: 3, color: '#ffcb05', filter: 'drop-shadow(0 1px 0 rgba(0,0,0,.25))' }}>
            {Array.from({ length: card.stars }, (_, k) => <Star key={k} />)}
          </span>
          <span style={{ fontSize: 'clamp(8px,1.8cqw,10px)', fontWeight: 700, color: '#1b1b22', opacity: .5, ...KAN }}>{card.rarity}</span>
        </div>
      </div>

      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        opacity: hov ? 1 : 0, transition: 'opacity .15s', pointerEvents: 'none',
      }}>
        <span style={{
          background: '#ee1c25', color: '#fff', fontWeight: 800, fontSize: 13,
          padding: '7px 14px', borderRadius: 999,
          boxShadow: '0 6px 16px rgba(0,0,0,.4)',
          display: 'flex', alignItems: 'center', gap: 5, ...KAN,
        }}>
          {picked ? (
            <>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              ในตะกร้า
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              ใส่ตะกร้า
            </>
          )}
        </span>
      </div>
    </div>
  )
}

export function TapToBuyDemo() {
  const [picked, setPicked] = useState<number[]>([])
  const total = picked.reduce((s, i) => s + CARDS[i].price, 0)
  const toggle = (i: number) => setPicked(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])

  return (
    <div style={{
      background: 'linear-gradient(150deg,#3a3f4b,#262a33)',
      borderRadius: 22, overflow: 'hidden',
      maxWidth: 420, margin: '0 auto',
      boxShadow: '0 32px 80px -20px rgba(28,27,36,.5)',
    }}>
      {/* Shop header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        padding: '16px 22px',
        background: 'rgba(255,255,255,.08)',
        borderBottom: '1.5px solid rgba(255,255,255,.13)',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 11,
            background: '#ee1c25', color: '#fff',
            display: 'grid', placeItems: 'center',
            fontWeight: 800, fontSize: 18, flexShrink: 0,
            boxShadow: '0 4px 10px -3px rgba(238,28,37,.6)',
            ...KAN,
          }}>ร</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.15, ...KAN }}>
              ร้านการ์ดลุงโต้ง
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3fcf6a', boxShadow: '0 0 0 3px rgba(63,207,106,.22)', flexShrink: 0, display: 'block' }} />
            </div>
            <span style={{ display: 'block', color: 'rgba(255,255,255,.62)', fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>lalen.app/card-lungtong</span>
          </div>
        </div>

        {/* Cart */}
        <div style={{
          flexShrink: 0, background: '#fff', color: '#1c1b24',
          fontWeight: 800, borderRadius: 999, padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 9,
          boxShadow: '0 8px 20px rgba(0,0,0,.3)', fontSize: 14,
          ...KAN, whiteSpace: 'nowrap',
          transition: 'all .2s',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          ตะกร้า
          <span style={{
            background: picked.length > 0 ? '#ee1c25' : '#e0e0e0',
            color: picked.length > 0 ? '#fff' : '#999',
            minWidth: 22, height: 22, borderRadius: 999,
            display: 'grid', placeItems: 'center',
            fontSize: 12, padding: '0 6px',
            transition: 'background .2s, color .2s',
          }}>
            {picked.length}
          </span>
          {total > 0 && (
            <span style={{ opacity: .75, fontWeight: 600, fontSize: 13 }}>฿{total.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5%', padding: '0 5% 5%' }}>
        {CARDS.map((card, i) => (
          <CardItem key={i} card={card} picked={picked.includes(i)} onToggle={() => toggle(i)} />
        ))}
      </div>

      {/* Hint */}
      <div style={{
        textAlign: 'center', paddingBottom: 16,
        color: 'rgba(255,255,255,.8)',
        fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11V6a3 3 0 0 1 6 0v5" />
          <path d="M15 11h1a2 2 0 0 1 2 2v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3a2 2 0 0 1 2-2h1" />
        </svg>
        ลองแตะการ์ดในรูปดูสิ
      </div>
    </div>
  )
}
