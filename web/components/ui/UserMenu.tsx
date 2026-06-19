'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const KAN: React.CSSProperties = { fontFamily: '"Kanit", sans-serif' }

// ── Types ────────────────────────────────────────────────────
interface UserData {
  email: string
  shopName: string
  shopSlug: string
}

// ── Avatar color derived from name ───────────────────────────
const AVATAR_COLORS = ['#ee1c25','#2a75bb','#2e9e4f','#7c3aed','#ff7a45','#d48806']
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

// ── Menu items ───────────────────────────────────────────────
const MENU_ITEMS = [
  {
    href: '/dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    label: 'แดชบอร์ด',
  },
  {
    href: '/dashboard/listings',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    label: 'จัดการสินค้า',
  },
  {
    href: '/dashboard/orders',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3.5h14v17l-2.3-1.4L14.4 21 12 19.6 9.6 21l-2.3-1.9L5 20.5v-17Z"/><path d="M8.5 8h7M8.5 12h7M8.5 15.5h4"/></svg>,
    label: 'ดูออเดอร์',
  },
]
const MENU_BOTTOM = [
  {
    href: '/dashboard/settings',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    label: 'ตั้งค่าร้าน',
  },
]

// ── Props ────────────────────────────────────────────────────
interface UserMenuProps {
  /** 'landing' = light pill navbar style; 'dashboard' = compact dark style */
  variant?: 'landing' | 'dashboard'
}

export function UserMenu({ variant = 'landing' }: UserMenuProps) {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Fetch user + shop on mount
  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: shop } = await supabase
        .from('shops')
        .select('name, slug')
        .eq('owner_id', user.id)
        .single()

      setUserData({
        email: user.email ?? '',
        shopName: shop?.name ?? (user.email?.split('@')[0] ?? ''),
        shopSlug: shop?.slug ?? '',
      })
      setLoading(false)
    }
    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) { setUserData(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserData(null)
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  // ── Loading skeleton ─────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ededf0', flexShrink: 0 }}/>
        <div style={{ width: 80, height: 14, borderRadius: 6, background: '#ededf0', display: variant === 'landing' ? 'block' : 'none' }}/>
      </div>
    )
  }

  // ── Not logged in ────────────────────────────────────────
  if (!userData) {
    if (variant === 'dashboard') {
      return (
        <Link href="/login" style={{ ...KAN, fontWeight: 600, fontSize: 14, color: '#a1a1aa', padding: '8px 14px', borderRadius: 10, border: '1px solid #27272a', textDecoration: 'none' }}>
          เข้าสู่ระบบ
        </Link>
      )
    }
    // landing — same buttons as before
    return (
      <>
        <Link href="/login"
          className="hidden sm:block"
          style={{ ...KAN, fontWeight: 600, fontSize: 15, color: 'var(--ld-muted)', padding: '9px 18px', borderRadius: 999, border: '1.5px solid var(--ld-line)', textDecoration: 'none' }}>
          เข้าสู่ระบบ
        </Link>
        <Link href="/register" style={{
          ...KAN, fontWeight: 600, fontSize: 15, color: '#fff', background: 'var(--ld-red)',
          padding: '9px 20px', borderRadius: 999, boxShadow: '0 4px 0 var(--ld-red-deep)',
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          สมัครฟรี
        </Link>
      </>
    )
  }

  // ── Logged in ────────────────────────────────────────────
  const initial = userData.shopName.charAt(0).toUpperCase()
  const color   = avatarColor(userData.shopName)
  const isDark  = variant === 'dashboard'

  const triggerStyle: React.CSSProperties = isDark
    ? { display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid #27272a', borderRadius: 12, padding: '6px 10px', cursor: 'pointer', ...KAN }
    : { display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1.5px solid var(--ld-line)', borderRadius: 999, padding: '6px 8px 6px 6px', cursor: 'pointer', ...KAN }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button onClick={() => setOpen(o => !o)} style={triggerStyle}>
        {/* Avatar */}
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: color, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0, ...KAN }}>
          {initial}
        </div>
        {/* Shop name (hidden on mobile for dashboard) */}
        <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#fff' : 'var(--ld-ink)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {userData.shopName}
        </span>
        {/* Chevron */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#a1a1aa' : 'var(--ld-muted)'} strokeWidth="2" strokeLinecap="round" style={{ transition: 'transform .18s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#fff', borderRadius: 16,
          boxShadow: '0 16px 40px -10px rgba(28,27,36,.22), 0 0 0 1.5px #ededf0',
          width: 230, zIndex: 999, overflow: 'hidden',
          fontFamily: '"Anuphan", sans-serif',
        }}>
          {/* User info header */}
          <div style={{ padding: '14px 16px', borderBottom: '1.5px solid #ededf0', display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 17, flexShrink: 0, ...KAN }}>
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: '#1c1b24', ...KAN, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userData.shopName}</div>
              <div style={{ fontSize: 12, color: '#6b6a76', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{userData.email}</div>
            </div>
          </div>

          {/* Main menu */}
          <div style={{ padding: '6px 0' }}>
            {MENU_ITEMS.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', color: '#3a3a44', textDecoration: 'none',
                fontSize: 14.5, transition: '.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fff6ec')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: '#6b6a76', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {/* View shop link */}
            {userData.shopSlug && (
              <Link href={`/${userData.shopSlug}`} onClick={() => setOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', color: '#3a3a44', textDecoration: 'none', fontSize: 14.5,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fff6ec')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: '#6b6a76', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9.5 5.2 4.5h13.6L20 9.5M4 9.5v10.5h16V9.5M4 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 4 0"/></svg>
                </span>
                ดูหน้าร้าน
              </Link>
            )}
          </div>

          {/* Settings */}
          <div style={{ padding: '6px 0', borderTop: '1.5px solid #ededf0' }}>
            {MENU_BOTTOM.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', color: '#3a3a44', textDecoration: 'none', fontSize: 14.5,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fff6ec')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: '#6b6a76', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div style={{ padding: '6px 0', borderTop: '1.5px solid #ededf0' }}>
            <button onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 16px', color: '#ee1c25',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 14.5, fontFamily: 'inherit', textAlign: 'left',
              transition: '.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fff1ef')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
