'use client'

const KAN = { fontFamily: 'var(--font-kanit), sans-serif' } as const

type Tone = 'fire' | 'water' | 'electric' | 'grass' | 'psychic'
type Emblem = 'Bolt' | 'Spark' | 'Star'

const ART: Record<Tone, string> = {
  fire:     'radial-gradient(120% 120% at 30% 20%, #ffd9a8, #ff7a45 55%, #e3350d)',
  water:    'radial-gradient(120% 120% at 30% 20%, #bae0ff, #4096ff 55%, #0958d9)',
  grass:    'radial-gradient(120% 120% at 30% 20%, #d9f7be, #73d13d 55%, #389e0d)',
  electric: 'radial-gradient(120% 120% at 30% 20%, #fff1b8, #ffcb05 55%, #d48806)',
  psychic:  'radial-gradient(120% 120% at 30% 20%, #efdbff, #b37feb 55%, #722ed1)',
}

const EMBLEM_PATHS: Record<Emblem, string> = {
  Bolt:  'M13 2 4 13.5h6.2L11 22l9-11.5h-6.3L13 2Z',
  Spark: 'M12 2.5c.4 4.7 2.3 6.6 7 7-4.7.4-6.6 2.3-7 7-.4-4.7-2.3-6.6-7-7 4.7-.4 6.6-2.3 7-7Z',
  Star:  'm12 3 2.6 5.6 6.1.7-4.5 4.1 1.2 6L12 16.9 6.6 19.4l1.2-6L3.3 9.3l6.1-.7L12 3Z',
}

const STAR_PATH = 'm12 3 2.6 5.6 6.1.7-4.5 4.1 1.2 6L12 16.9 6.6 19.4l1.2-6L3.3 9.3l6.1-.7L12 3Z'

const GRID_CARDS: { tone: Tone; emblem: Emblem; hp: number; holo: boolean }[] = [
  { tone: 'fire',     emblem: 'Bolt',  hp: 120, holo: true  },
  { tone: 'water',    emblem: 'Spark', hp: 90,  holo: false },
  { tone: 'grass',    emblem: 'Star',  hp: 70,  holo: true  },
  { tone: 'electric', emblem: 'Bolt',  hp: 60,  holo: false },
  { tone: 'psychic',  emblem: 'Spark', hp: 110, holo: true  },
  { tone: 'fire',     emblem: 'Star',  hp: 130, holo: false },
]

const PILE_CARDS: { tone: Tone; emblem: Emblem; hp: number; holo: boolean }[] = [
  { tone: 'grass',    emblem: 'Spark', hp: 80,  holo: false },
  { tone: 'psychic',  emblem: 'Star',  hp: 150, holo: true  },
  { tone: 'fire',     emblem: 'Bolt',  hp: 100, holo: false },
  { tone: 'water',    emblem: 'Bolt',  hp: 70,  holo: true  },
  { tone: 'electric', emblem: 'Star',  hp: 90,  holo: false },
  { tone: 'grass',    emblem: 'Spark', hp: 60,  holo: true  },
]

const PILE_POS = [
  { l: '2%',  t: '6%',  r: -13 },
  { l: '35%', t: '1%',  r: 5   },
  { l: '67%', t: '9%',  r: -6  },
  { l: '8%',  t: '44%', r: 9   },
  { l: '39%', t: '49%', r: -9  },
  { l: '66%', t: '42%', r: 14  },
]

function CardFace({ tone, emblem, hp, holo, name = '', price, rarity = '', stars = 2 }: {
  tone: Tone; emblem: Emblem; hp: number; holo?: boolean
  name?: string; price?: number; rarity?: string; stars?: number
}) {
  return (
    <div style={{
      aspectRatio: '63/88', borderRadius: 10, background: '#fff',
      padding: '7%', display: 'flex', flexDirection: 'column', gap: '5%',
      boxShadow: '0 10px 26px -8px rgba(20,18,15,.35)',
      border: '2.5px solid #1b1b22', overflow: 'hidden', position: 'relative',
      containerType: 'inline-size' as const,
    }}>
      {price != null && (
        <div style={{
          position: 'absolute', right: -6, top: '11%',
          background: '#ffcb05', color: '#1b1b22',
          fontWeight: 800, fontSize: 'clamp(9px,2.2cqw,13px)',
          padding: '5px 12px 5px 10px', borderRadius: '999px 0 0 999px',
          boxShadow: '-3px 4px 0 rgba(0,0,0,.18)',
          border: '2px solid #1b1b22', borderRight: 'none',
          ...KAN, whiteSpace: 'nowrap',
        }}>฿{price.toLocaleString()}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4, lineHeight: 1 }}>
        {name ? (
          <span style={{ fontWeight: 700, fontSize: 'clamp(10px,2.6cqw,15px)', color: '#1b1b22', ...KAN, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{name}</span>
        ) : <span />}
        <span style={{ fontWeight: 800, fontSize: 'clamp(8px,2cqw,12px)', color: '#ee1c25', whiteSpace: 'nowrap', flexShrink: 0, ...KAN }}>
          <small style={{ color: '#1b1b22', opacity: .55, fontSize: '.7em' }}>HP</small> {hp}
        </span>
      </div>
      <div style={{ flex: 1, borderRadius: 6, border: '2px solid rgba(0,0,0,.12)', background: ART[tone], display: 'grid', placeItems: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', width: '130%', height: '130%', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,.7), transparent 55%)', opacity: .6 }} />
        <svg width="46%" height="46%" viewBox="0 0 24 24" fill="rgba(255,255,255,.85)" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.18))', position: 'relative' }}>
          <path d={EMBLEM_PATHS[emblem]} />
        </svg>
        {holo && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(125deg, transparent 30%, rgba(255,255,255,.55) 45%, transparent 60%)', backgroundSize: '250% 250%', mixBlendMode: 'screen', opacity: .9 }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        <span style={{ display: 'flex', gap: 3, color: '#ffcb05', filter: 'drop-shadow(0 1px 0 rgba(0,0,0,.25))' }}>
          {Array.from({ length: stars }, (_, k) => (
            <svg key={k} width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d={STAR_PATH} />
            </svg>
          ))}
        </span>
        {rarity && <span style={{ fontSize: 'clamp(8px,1.8cqw,10px)', fontWeight: 700, color: '#1b1b22', opacity: .5, ...KAN }}>{rarity}</span>}
      </div>
    </div>
  )
}

function BoundingBox({ delay }: { delay: number }) {
  return (
    <div style={{
      position: 'absolute', inset: '-7%',
      border: '2.5px dashed #ffcb05', borderRadius: 10,
      animationName: 'bsBoxIn', animationDuration: '.5s',
      animationTimingFunction: 'ease', animationFillMode: 'both',
      animationDelay: `${delay}s`,
    }}>
      <div style={{
        position: 'absolute', top: -11, right: -11,
        width: 22, height: 22, display: 'grid', placeItems: 'center',
        background: '#ee1c25', color: '#fff', borderRadius: '50%',
        fontSize: 13, fontWeight: 900, boxShadow: '0 3px 7px rgba(0,0,0,.35)',
        animationName: 'bsTickIn', animationDuration: '.4s',
        animationTimingFunction: 'ease', animationFillMode: 'both',
        animationDelay: `${delay + 0.1}s`,
      }}>✓</div>
    </div>
  )
}

const CHIP_LABEL = (
  <>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M2 6h14a2 2 0 0 1 2 2v14" />
    </svg>
    ตัดกรอบอัตโนมัติ <b style={{ color: '#ee1c25' }}>6 ใบ</b>
  </>
)

const chipStyle: React.CSSProperties = {
  position: 'absolute', left: '50%', bottom: 14,
  transform: 'translateX(-50%)', zIndex: 20,
  background: '#fff', color: '#1b1b22', ...KAN,
  fontWeight: 800, padding: '9px 18px', borderRadius: 999,
  display: 'flex', alignItems: 'center', gap: 8,
  boxShadow: '0 8px 20px rgba(0,0,0,.3)', fontSize: 15,
  whiteSpace: 'nowrap',
}

const containerStyle: React.CSSProperties = {
  position: 'relative', borderRadius: 22, overflow: 'hidden',
  background: 'linear-gradient(150deg,#3a3f4b,#262a33)',
  padding: '7% 6%',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.06)',
}

export function BatchScanDemo({ variant = 'grid' }: { variant?: 'grid' | 'pile' }) {
  const cards = variant === 'pile' ? PILE_CARDS : GRID_CARDS

  if (variant === 'pile') {
    return (
      <div style={containerStyle}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '7/5.4' }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              position: 'absolute', width: '30%',
              left: PILE_POS[i].l, top: PILE_POS[i].t,
              transform: `rotate(${PILE_POS[i].r}deg)`,
              zIndex: i + 1,
            }}>
              <CardFace {...c} />
              <BoundingBox delay={0.25 + i * 0.2} />
            </div>
          ))}
        </div>
        <div style={chipStyle}>{CHIP_LABEL}</div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5%', transform: 'rotate(-3deg)' }}>
        {cards.map((c, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <CardFace {...c} />
            <BoundingBox delay={0.2 + i * 0.22} />
          </div>
        ))}
      </div>
      <div style={chipStyle}>{CHIP_LABEL}</div>
    </div>
  )
}

export { CardFace }
