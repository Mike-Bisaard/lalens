'use client'

import { useId } from 'react'
import { CardFace } from '@/components/ui'

const KAN: React.CSSProperties = { fontFamily: '"Kanit", sans-serif' }

export type AuthMode = 'signin' | 'signup'

interface AuthLayoutProps {
  mode?: AuthMode
  subtitle?: string   // legacy (dashboard/setup)
  children: React.ReactNode
  footer?: React.ReactNode  // legacy
}

// ────────────────────────────────────────────────────────────
// Lalens logo icon — two fanned cards + star on gradient
// ────────────────────────────────────────────────────────────
function LalenIcon({ size = 32 }: { size?: number }) {
  const gid = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden style={{ flex: 'none', display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffd633"/>
          <stop offset=".5" stopColor="#ffae00"/>
          <stop offset="1" stopColor="#ee1c25"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${gid})`}/>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="none" stroke="#1c1b24" strokeWidth="2.5" opacity=".9"/>
      <g transform="rotate(-15 24 27)">
        <rect x="11.5" y="15" width="15.5" height="21" rx="3.4" fill="#fff" stroke="#1c1b24" strokeWidth="2.4"/>
      </g>
      <g transform="rotate(13 24 27)">
        <rect x="20" y="14" width="15.5" height="21" rx="3.4" fill="#fff" stroke="#1c1b24" strokeWidth="2.4"/>
        <path d="M27.8 19.6l1.7 3.5 3.9.5-2.8 2.7.7 3.9-3.5-1.9-3.5 1.9.7-3.9-2.8-2.7 3.9-.5z" fill="#ffcb05" stroke="#1c1b24" strokeWidth="1.5" strokeLinejoin="round"/>
      </g>
    </svg>
  )
}

// ────────────────────────────────────────────────────────────
// Brand panel (left / desktop only)
// ────────────────────────────────────────────────────────────
function BrandPanel({ mode }: { mode: AuthMode }) {
  const signin = mode === 'signin'
  const bullets = [
    {
      icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.4"/></svg>,
      text: 'ลงขายยกกอง — ระบบตัดกรอบให้อัตโนมัติ',
    },
    {
      icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3.5h14v17l-2.3-1.4L14.4 21 12 19.6 9.6 21l-2.3-1.9L5 20.5v-17Z"/><path d="M8.5 8h7M8.5 12h7M8.5 15.5h4"/></svg>,
      text: 'ตรวจสลิป + ตัดสต็อกให้ ไม่ต้องเช็คเอง',
    },
    {
      icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5 4.5 5.5v6c0 5 3.5 8 7.5 9.5 4-1.5 7.5-4.5 7.5-9.5v-6L12 2.5Z"/><path d="m8.7 12 2.3 2.3 4.3-4.6"/></svg>,
      text: 'เงินโอนตรงถึงคุณ เราไม่ถือเงินใคร',
    },
  ]

  return (
    <div
      className="auth-brand-side"
      style={{
        position: 'relative', overflow: 'hidden',
        padding: '48px 56px', color: '#fff',
        display: 'flex', flexDirection: 'column',
        background: `
          linear-gradient(108deg, rgba(86,7,9,.40) 0%, rgba(86,7,9,.10) 40%, transparent 62%, rgba(86,7,9,.24) 100%),
          radial-gradient(120% 80% at 12% 8%, #ff7a45 0%, transparent 52%),
          radial-gradient(120% 90% at 92% 100%, #ffcb05 0%, transparent 46%),
          linear-gradient(150deg, #ee1c25 0%, #c0141b 100%)`,
      }}
    >
      {/* Shine overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(60% 50% at 80% 30%, rgba(255,255,255,.12), transparent 70%)' }}/>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, ...KAN, fontWeight: 700, fontSize: 23, position: 'relative', zIndex: 2, textShadow: '0 1px 8px rgba(78,6,8,.34)' }}>
        <span style={{ background: '#fff', borderRadius: 13, padding: 4, display: 'grid', placeItems: 'center', boxShadow: '0 6px 16px -6px rgba(0,0,0,.35)' }}>
          <LalenIcon size={30}/>
        </span>
        ละเล่น
      </div>

      {/* ── Card 1 — top-right ────────────────────────────── */}
      <div style={{ position: 'absolute', zIndex: 1, top: '8%', right: 40, width: 148, transform: 'rotate(-8deg)', filter: 'drop-shadow(0 22px 44px rgba(0,0,0,.44))', pointerEvents: 'none' }}>
        <CardFace tone="fire" emblem="Bolt" name="ริซาร์ดอน" hp={130} stars={3} rarity="EX" holo price={990}/>
      </div>

      {/* ── Card 2 — mid-right ────────────────────────────── */}
      <div style={{ position: 'absolute', zIndex: 1, top: '47%', right: -18, width: 148, transform: 'rotate(11deg)', filter: 'drop-shadow(0 22px 44px rgba(0,0,0,.44))', pointerEvents: 'none' }}>
        <CardFace tone="psychic" emblem="Spark" name="มิว" hp={110} stars={3} rarity="UR" holo/>
      </div>

      {/* ── Chip A: ตัดกรอบ (red) — top ──────────────────── */}
      <div style={{ position: 'absolute', zIndex: 3, top: '6%', right: 210, background: '#fff', color: '#1c1b24', borderRadius: 15, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', boxShadow: '0 14px 32px -10px rgba(0,0,0,.42)', ...KAN, pointerEvents: 'none' }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: '#ee1c25', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M2 6h14a2 2 0 0 1 2 2v14"/>
          </svg>
        </span>
        <span>
          <b style={{ display: 'block', fontSize: 15, fontWeight: 700, lineHeight: 1 }}>ตัดกรอบ</b>
          <span style={{ fontSize: 11.5, color: '#6b6a76', fontWeight: 500 }}>แยกการ์ดอัตโนมัติ</span>
        </span>
      </div>

      {/* ── Chip B: ตรวจสลิป QR (green) — upper-mid ─────── */}
      <div style={{ position: 'absolute', zIndex: 3, top: '29%', right: 200, background: '#fff', color: '#1c1b24', borderRadius: 15, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', boxShadow: '0 14px 32px -10px rgba(0,0,0,.42)', ...KAN, pointerEvents: 'none' }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: '#2e9e4f', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.5 4.5 5.5v6c0 5 3.5 8 7.5 9.5 4-1.5 7.5-4.5 7.5-9.5v-6L12 2.5Z"/>
            <path d="m8.7 12 2.3 2.3 4.3-4.6"/>
          </svg>
        </span>
        <span>
          <b style={{ display: 'block', fontSize: 15, fontWeight: 700, lineHeight: 1 }}>ตรวจสลิป QR</b>
          <span style={{ fontSize: 11.5, color: '#6b6a76', fontWeight: 500 }}>อัตโนมัติใน 2 วิ</span>
        </span>
      </div>

      {/* ── Chip C: เงินเข้าตรง (blue) — lower-mid ──────── */}
      <div style={{ position: 'absolute', zIndex: 3, top: '55%', right: 200, background: '#fff', color: '#1c1b24', borderRadius: 15, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', boxShadow: '0 14px 32px -10px rgba(0,0,0,.42)', ...KAN, pointerEvents: 'none' }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: '#2a75bb', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3.5" y="6" width="17" height="13" rx="2.5"/>
            <path d="M3.5 9.5h11M16.5 13.5h.01"/>
            <path d="M16 6V4.5a1.5 1.5 0 0 0-2-1.4L5 6"/>
          </svg>
        </span>
        <span>
          <b style={{ display: 'block', fontSize: 15, fontWeight: 700, lineHeight: 1 }}>เงินเข้าตรง</b>
          <span style={{ fontSize: 11.5, color: '#6b6a76', fontWeight: 500 }}>ไม่ผ่านคนกลาง</span>
        </span>
      </div>

      {/* ── Chip D: ล็อกสต็อก (amber) — bottom ──────────── */}
      <div style={{ position: 'absolute', zIndex: 3, top: '74%', right: 44, background: '#fff', color: '#1c1b24', borderRadius: 15, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', boxShadow: '0 14px 32px -10px rgba(0,0,0,.42)', ...KAN, pointerEvents: 'none' }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: '#d48806', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="11" rx="2.5"/>
            <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
          </svg>
        </span>
        <span>
          <b style={{ display: 'block', fontSize: 15, fontWeight: 700, lineHeight: 1 }}>ล็อกสต็อก</b>
          <span style={{ fontSize: 11.5, color: '#6b6a76', fontWeight: 500 }}>กันขายซ้ำ 2 คน</span>
        </span>
      </div>

      {/* Headline + bullets */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto' }}>
        <h1 style={{ color: '#fff', fontSize: 'clamp(32px,3.4vw,46px)', lineHeight: 1.12, ...KAN, fontWeight: 700, margin: 0, textShadow: '0 2px 16px rgba(78,6,8,.42)' }}>
          เปิดขายร้านการ์ด<br/>
          <span style={{ position: 'relative', zIndex: 0 }}>
            ง่ายๆ
            <span style={{ position: 'absolute', bottom: '0.05em', left: '-2%', right: '-2%', height: '0.34em', background: '#ffcb05', zIndex: -1, borderRadius: 4 }}/>
          </span>
          ในที่เดียว
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,.96)', marginTop: 18, maxWidth: '17em', lineHeight: 1.6, textShadow: '0 1px 10px rgba(78,6,8,.38)' }}>
          {signin
            ? 'เข้าสู่ระบบเพื่อจัดการร้าน ดูออเดอร์ และลงขายการ์ดเพิ่มได้ทันที'
            : 'ถ่ายรูปเดียวลงขายได้ทั้งกอง ลูกค้าจ่ายจบในเว็บ เงินเข้าบัญชีคุณโดยตรง'}
        </p>
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bullets.map(({ icon, text }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, fontSize: 16, fontWeight: 500, textShadow: '0 1px 8px rgba(78,6,8,.34)', maxWidth: '20em' }}>
              <span style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,.2)', border: '1.5px solid rgba(255,255,255,.36)', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 4px 12px -4px rgba(60,4,6,.4)' }}>
                {icon}
              </span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto', paddingTop: 36, display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: 'rgba(255,255,255,.88)', textShadow: '0 1px 8px rgba(78,6,8,.34)' }}>
        ✦ ฟรีช่วงเปิดตัว · เริ่มที่การ์ด Pokemon
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Exported component
// ────────────────────────────────────────────────────────────
export function AuthLayout({ mode, subtitle, children, footer }: AuthLayoutProps) {
  if (mode === 'signin' || mode === 'signup') {
    return (
      <>
        <style>{`
          .auth-split { min-height:100vh; min-height:100dvh; display:grid; grid-template-columns:1.05fr .95fr; }
          .auth-form-side { display:flex; align-items:flex-start; justify-content:center; padding:32px 28px; overflow-y:auto; background:#faf7f2; }
          .auth-form-inner { width:100%; max-width:404px; margin:auto; }
          .auth-mobile-logo { display:none; }
          @media (max-width:920px){
            .auth-split { grid-template-columns:1fr !important; }
            .auth-brand-side { display:none !important; }
            .auth-form-side { min-height:100dvh; }
            .auth-mobile-logo { display:flex; align-items:center; justify-content:center; gap:10px; font-family:"Kanit",sans-serif; font-weight:700; font-size:22px; color:#1c1b24; margin-bottom:22px; }
          }
        `}</style>
        <div className="auth-split">
          <BrandPanel mode={mode}/>
          <div className="auth-form-side">
            <div className="auth-form-inner">
              <div className="auth-mobile-logo">
                <LalenIcon size={30}/> ละเล่น
              </div>
              {children}
            </div>
          </div>
        </div>
      </>
    )
  }

  // Legacy simple layout (dashboard/setup)
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-black text-3xl mb-2" style={{ ...KAN, background: 'linear-gradient(to right, #7c3aed, #c026d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ละเล่น
          </div>
          {subtitle && <p className="text-zinc-400 mt-2">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  )
}
