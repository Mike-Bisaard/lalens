'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const KAN: React.CSSProperties = { fontFamily: '"Kanit", sans-serif' }

interface DashSidebarProps {
  shopName: string
  shopSlug: string
  pendingOrders: number
  avatarUrl?: string | null
}

// ── Nav items ─────────────────────────────────────────────────
const NAV = [
  {
    href: '/dashboard',
    exact: true,
    label: 'ภาพรวม',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/posts',
    exact: false,
    label: 'โพสต์ขาย',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/listings',
    exact: true,
    label: 'สินค้า',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/orders',
    exact: false,
    label: 'ออเดอร์',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
]
const NAV_BOTTOM = [
  {
    href: '/dashboard/settings',
    exact: false,
    label: 'ตั้งค่าร้าน',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

function NavItem({ href, label, icon, active, badge }: {
  href: string; label: string; icon: React.ReactNode
  active: boolean; badge?: number
}) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 10, textDecoration: 'none',
      transition: '.13s',
      background: active ? 'rgba(238,28,37,.09)' : 'transparent',
      color: active ? '#ee1c25' : '#4a4a55',
      fontWeight: active ? 600 : 500,
      fontSize: 14.5, ...KAN,
    }}
    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f5f4f0' }}
    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <span style={{ flexShrink: 0, color: active ? '#ee1c25' : '#6b6a76' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && badge > 0 && (
        <span style={{ background: '#ee1c25', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 6px', lineHeight: 1.6, ...KAN }}>
          {badge}
        </span>
      )}
    </Link>
  )
}

export function DashSidebar({ shopName, shopSlug, pendingOrders, avatarUrl }: DashSidebarProps) {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const initial = shopName.charAt(0).toUpperCase()
  const AVATAR_COLORS = ['#ee1c25','#2a75bb','#2e9e4f','#7c3aed','#ff7a45','#d48806']
  const avatarBg = AVATAR_COLORS[shopName.charCodeAt(0) % AVATAR_COLORS.length]

  return (
    <aside style={{
      width: 220, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: '#fff', borderRight: '1.5px solid #ededf0',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <LogoIcon size={30} />
        <span style={{ ...KAN, fontWeight: 700, fontSize: 20, color: '#1c1b24', letterSpacing: '-.02em' }}>ละเล่น</span>
      </div>

      {/* Main nav */}
      <nav style={{ padding: '4px 8px', flex: 1 }}>
        {NAV.map(item => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href, item.exact)}
            badge={item.href === '/dashboard/orders' ? pendingOrders : undefined}
          />
        ))}

        <div style={{ height: 1, background: '#ededf0', margin: '10px 4px' }} />

        {NAV_BOTTOM.map(item => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href, item.exact)}
          />
        ))}
      </nav>

      {/* Shop info at bottom */}
      <div style={{ padding: '12px 12px 16px' }}>
        {/* Shop card */}
        <div style={{ background: '#f5f4f0', borderRadius: 12, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarUrl ? 'transparent' : avatarBg, color: '#fff', display: 'grid', placeItems: 'center', ...KAN, fontWeight: 700, fontSize: 16, flexShrink: 0, overflow: 'hidden' }}>
            {avatarUrl
              ? <img src={avatarUrl} alt={shopName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initial
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...KAN, fontWeight: 600, fontSize: 13.5, color: '#1c1b24', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {shopName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2e9e4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.5 4.5 5.5v6c0 5 3.5 8 7.5 9.5 4-1.5 7.5-4.5 7.5-9.5v-6L12 2.5Z"/>
                <path d="m8.7 12 2.3 2.3 4.3-4.6"/>
              </svg>
              <span style={{ fontSize: 11, color: '#2e9e4f', fontWeight: 500 }}>ยืนยันบัญชีแล้ว</span>
            </div>
          </div>
        </div>

        {/* Shop URL */}
        {shopSlug && (
          <Link href={`/${shopSlug}`} target="_blank" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 10px', borderRadius: 9, border: '1.5px solid #ededf0',
            color: '#6b6a76', textDecoration: 'none', fontSize: 12, ...KAN, fontWeight: 500,
            transition: '.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#ee1c25')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#ededf0')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              lalen.app/{shopSlug}
            </span>
          </Link>
        )}
      </div>
    </aside>
  )
}

function LogoIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="sbl" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffd633"/><stop offset=".5" stopColor="#ffae00"/><stop offset="1" stopColor="#ee1c25"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#sbl)"/>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="none" stroke="#1c1b24" strokeWidth="2.5" opacity=".85"/>
      <g transform="rotate(-15 24 27)"><rect x="11.5" y="15" width="15.5" height="21" rx="3.4" fill="#fff" stroke="#1c1b24" strokeWidth="2.2"/></g>
      <rect x="21" y="14" width="15.5" height="21" rx="3.4" fill="#fff" stroke="#1c1b24" strokeWidth="2.2"/>
      <path d="M28.8 19.6l1.7 3.5 3.9.5-2.8 2.7.7 3.9-3.5-1.9-3.5 1.9.7-3.9-2.8-2.7 3.9-.5z" fill="#ffcb05" stroke="#1c1b24" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  )
}
