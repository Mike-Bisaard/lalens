'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { translateDbError } from '@/lib/translate-error'
import { AuthLayout } from '@/components/layout/AuthLayout'

// ── Banks ─────────────────────────────────────────────────────────────
const BANKS = [
  'ไทยพาณิชย์ (SCB)',
  'กสิกรไทย (KBANK)',
  'กรุงเทพ (BBL)',
  'กรุงไทย (KTB)',
  'กรุงศรีฯ (BAY)',
  'ทหารไทยธนชาต (ttb)',
  'ออมสิน (GSB)',
  'พร้อมเพย์ (PromptPay)',
]

// ── Color tokens ──────────────────────────────────────────────────────
const C = {
  red: '#ee1c25',
  redDeep: '#c0141b',
  yellow: '#ffcb05',
  blue: '#2a75bb',
  green: '#2e9e4f',
  ink: '#1c1b24',
  muted: '#6b6a76',
  paper: '#fff',
  line: '#ededf0',
  bg: '#faf7f2',
  tintBlue: '#eef5ff',
} as const

const KAN: React.CSSProperties = { fontFamily: '"Kanit", sans-serif' }
const ANU: React.CSSProperties = { fontFamily: '"Anuphan", sans-serif' }

// ── Helpers ───────────────────────────────────────────────────────────
function nameToSlug(name: string) {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
}

function formatBankAccount(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 4) return `${d.slice(0, 3)}-${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}-${d.slice(3, 4)}-${d.slice(4)}`
  return `${d.slice(0, 3)}-${d.slice(3, 4)}-${d.slice(4, 9)}-${d.slice(9)}`
}

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
}

// ── SVG Icons ─────────────────────────────────────────────────────────
function IcoArrow({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}
function IcoCheck({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
function IcoCamera({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
function IcoShield({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function IcoPlus({ s = 22 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function IcoBell({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IcoChevron({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

// ── Stepper ───────────────────────────────────────────────────────────
function Stepper({ step }: { step: 1 | 2 }) {
  const labels = ['ข้อมูลร้าน', 'ผูกบัญชีรับเงิน']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2
        const active = step === n
        const done = step > n
        return (
          <React.Fragment key={n}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: done ? C.green : active ? C.red : '#f1ece3',
                color: done || active ? '#fff' : C.muted,
                border: `1.5px solid ${done ? C.green : active ? C.red : C.line}`,
                ...KAN, fontWeight: 700, fontSize: 14, flexShrink: 0,
              }}>
                {done ? <IcoCheck s={15} /> : n}
              </div>
              <span style={{ ...KAN, fontWeight: 600, fontSize: 13.5, color: done || active ? C.ink : C.muted, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > 2 ? C.green : C.line }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Shop preview chip ─────────────────────────────────────────────────
function ShopPreviewChip({ name, slug }: { name: string; slug: string }) {
  if (!name || !slug) return null
  return (
    <div style={{
      background: 'linear-gradient(150deg, #fff6ec, #fff1ef)',
      border: '1.5px solid #f3dca0', borderRadius: 14,
      padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 13, background: C.red,
        display: 'grid', placeItems: 'center', color: '#fff',
        ...KAN, fontWeight: 700, fontSize: 19, flexShrink: 0,
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
      <div>
        <div style={{ ...KAN, fontWeight: 600, fontSize: 15, color: C.ink }}>{name}</div>
        <div style={{ fontSize: 12.5, color: C.red }}>lalen.app/{slug}</div>
      </div>
    </div>
  )
}

// ── Field label ───────────────────────────────────────────────────────
function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <label style={{ display: 'block', ...KAN, fontWeight: 500, fontSize: 13.5, color: C.ink, marginBottom: 6 }}>
      {text}
      {required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
    </label>
  )
}

// ── Controlled text input ─────────────────────────────────────────────
function TextInput({
  value, onChange, placeholder, required, inputMode, style,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  style?: React.CSSProperties
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      inputMode={inputMode}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', boxSizing: 'border-box', padding: '14px 15px',
        border: `1.5px solid ${focused ? C.red : C.line}`,
        borderRadius: 13, fontSize: 15.5, color: C.ink,
        background: focused ? C.paper : '#faf9f7',
        outline: 'none',
        boxShadow: focused ? '0 0 0 4px rgba(238,28,37,.1)' : 'none',
        transition: 'border-color .15s, box-shadow .15s, background .15s',
        ...ANU,
        ...style,
      }}
    />
  )
}

// ── Slug input ────────────────────────────────────────────────────────
type SlugStatus = 'idle' | 'checking' | 'ok' | 'taken' | 'invalid'
function SlugInput({ value, onChange, status }: { value: string; onChange: (v: string) => void; status: SlugStatus }) {
  const [focused, setFocused] = useState(false)
  const borderColor = status === 'ok' ? C.green : status === 'taken' ? C.red : focused ? C.red : C.line
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 13, overflow: 'hidden', background: focused ? C.paper : '#faf9f7',
      boxShadow: focused ? '0 0 0 4px rgba(238,28,37,.1)' : 'none',
      transition: 'border-color .15s, box-shadow .15s',
    }}>
      <span style={{ ...ANU, fontSize: 14.5, color: C.muted, padding: '0 0 0 15px', flexShrink: 0, whiteSpace: 'nowrap' }}>
        lalen.app/
      </span>
      <input
        value={value}
        onChange={e => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
        placeholder="card-shop"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: 'none', outline: 'none', padding: '14px 12px 14px 6px',
          fontSize: 15.5, color: C.ink, background: 'transparent', ...ANU,
        }}
      />
      <div style={{ paddingRight: 13, flexShrink: 0, color: status === 'ok' ? C.green : C.muted }}>
        {status === 'checking' && (
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: `2px solid ${C.blue}`, borderTopColor: 'transparent',
            animation: 'spin .6s linear infinite',
          }} />
        )}
        {status === 'ok' && <IcoCheck s={18} />}
      </div>
    </div>
  )
}

// ── Bank select ───────────────────────────────────────────────────────
function BankSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '14px 40px 14px 15px',
          border: `1.5px solid ${focused ? C.red : C.line}`,
          borderRadius: 13, fontSize: 15.5, color: value ? C.ink : C.muted,
          background: focused ? C.paper : '#faf9f7',
          outline: 'none', appearance: 'none',
          boxShadow: focused ? '0 0 0 4px rgba(238,28,37,.1)' : 'none',
          transition: 'border-color .15s, box-shadow .15s',
          ...ANU,
        }}
      >
        <option value="" style={{ color: C.muted }}>เลือกธนาคาร</option>
        {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
      </select>
      <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.muted }}>
        <IcoChevron s={16} />
      </div>
    </div>
  )
}

// ── Primary button ────────────────────────────────────────────────────
function PrimaryBtn({
  children, onClick, type = 'button', disabled, loading, style,
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  loading?: boolean
  style?: React.CSSProperties
}) {
  const [pressed, setPressed] = useState(false)
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '16px', borderRadius: 15, border: 'none', cursor: isDisabled ? 'not-allowed' : 'pointer',
        background: isDisabled ? '#e6e3df' : C.red,
        color: isDisabled ? C.muted : '#fff',
        ...KAN, fontWeight: 600, fontSize: 18,
        boxShadow: isDisabled ? 'none' : pressed ? `0 2px 0 ${C.redDeep}` : `0 5px 0 ${C.redDeep}`,
        transform: pressed ? 'translateY(3px)' : 'none',
        transition: 'box-shadow .08s, transform .08s, background .15s',
        ...style,
      }}
    >
      {loading
        ? <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' }} />
        : children
      }
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────
export default function ShopSetupPage() {
  const router = useRouter()
  const [isEditMode, setIsEditMode] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1
  const [shopName, setShopName] = useState('')
  const [shopSlug, setShopSlug] = useState('')
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const slugTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Logo upload
  const [logoUrl, setLogoUrl] = useState('')
  const [logoLoading, setLogoLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 2
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [phone, setPhone] = useState('')
  const [accountName, setAccountName] = useState('')
  const [address, setAddress] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [doneShopName, setDoneShopName] = useState('')
  const [doneSlug, setDoneSlug] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      supabase
        .from('shops')
        .select('id, name, slug, bank_name, bank_account_last4, phone, account_holder_name, address, avatar_url')
        .eq('owner_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!data) return
          setIsEditMode(true)
          setShopName(data.name ?? '')
          setShopSlug(data.slug ?? '')
          setSlugStatus('ok')
          setBankName(data.bank_name ?? '')
          setBankAccount(data.bank_account_last4 ? `•••••${data.bank_account_last4}` : '')
          setPhone(data.phone ? formatPhone(data.phone) : '')
          setAccountName(data.account_holder_name ?? '')
          setAddress(data.address ?? '')
          if (data.avatar_url) setLogoUrl(data.avatar_url)
        })
    })
  }, [router])

  async function handleLogoFile(file: File) {
    setLogoLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload/shop-logo', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      setLogoUrl(url)
    }
    setLogoLoading(false)
  }

  const checkSlug = useCallback((raw: string) => {
    const clean = raw.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setShopSlug(clean)
    if (slugTimerRef.current) clearTimeout(slugTimerRef.current)
    if (!clean) { setSlugStatus('idle'); return }
    if (clean.length < 3) { setSlugStatus('invalid'); return }
    setSlugStatus('checking')
    slugTimerRef.current = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase.from('shops').select('id').eq('slug', clean).maybeSingle()
      setSlugStatus(data ? 'taken' : 'ok')
    }, 480)
  }, [])

  function handleNameChange(v: string) {
    setShopName(v)
    const autoSlug = nameToSlug(v)
    if (!shopSlug || shopSlug === nameToSlug(shopName)) {
      checkSlug(autoSlug)
    }
  }

  function goToStep2(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!isEditMode && slugStatus !== 'ok') { setError('กรุณารอตรวจสอบลิงก์ร้านให้เสร็จก่อน'); return }
    setStep(2)
  }

  async function submitSetup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const isMasked = bankAccount.startsWith('•')
    const body: Record<string, string> = {
      name: shopName,
      bank_name: bankName,
      phone,
      account_holder_name: accountName,
      address,
      avatar_url: logoUrl,
    }
    if (!isMasked) body.bank_account = bankAccount

    const res = await fetch('/api/shops', {
      method: isEditMode ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEditMode ? body : { ...body, slug: shopSlug }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error === 'slug_taken' ? 'Shop URL นี้ถูกใช้แล้ว กรุณาเลือก URL อื่น' : translateDbError(data.error))
      return
    }

    setDoneShopName(shopName)
    setDoneSlug(shopSlug)
    setStep(3)
  }

  const slugHint = {
    idle: { color: C.muted, text: 'ใช้ภาษาอังกฤษ/ตัวเลข ให้ลิงก์สั้นจำง่าย' },
    checking: { color: C.muted, text: 'กำลังเช็คว่าลิงก์ว่างไหม…' },
    ok: { color: C.green, text: 'ลิงก์นี้ว่าง ใช้ได้เลย' },
    taken: { color: C.red, text: 'ลิงก์นี้ถูกใช้แล้ว กรุณาเลือกอื่น' },
    invalid: { color: C.muted, text: 'ลิงก์ต้องมีอย่างน้อย 3 ตัวอักษร' },
  }[slugStatus]

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <AuthLayout mode="shop-setup">
        {/* Back link — only in edit mode */}
        {isEditMode && (
          <div style={{ marginBottom: 18 }}>
            <button
              onClick={() => router.push('/dashboard/settings')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...KAN, fontWeight: 500, fontSize: 13.5, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', borderRadius: 8, transition: 'color .13s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              กลับ
            </button>
          </div>
        )}

        {/* ── Step 1: ข้อมูลร้าน ── */}
        {step === 1 && (
          <form onSubmit={goToStep2} style={{ display: 'flex', flexDirection: 'column' }}>
            <Stepper step={1} />
            <h2 style={{ ...KAN, fontWeight: 700, fontSize: 30, color: C.ink, margin: '0 0 6px' }}>
              {isEditMode ? 'แก้ไขข้อมูลร้าน' : 'ตั้งค่าร้านของคุณ'}
            </h2>
            <p style={{ ...ANU, fontSize: 15.5, color: C.muted, margin: '0 0 22px' }}>
              {isEditMode ? 'แก้ชื่อร้านหรืออัปโหลดโลโก้ได้ที่นี่' : 'ตั้งชื่อและเลือกลิงก์ร้าน เปลี่ยนทีหลังได้'}
            </p>

            <div style={{ marginBottom: 13 }}>
              <FieldLabel text="ชื่อร้าน" required />
              <TextInput value={shopName} onChange={handleNameChange} placeholder="เช่น ร้านการ์ดลุงโต้ง" required />
            </div>

            <div style={{ marginBottom: 13 }}>
              <FieldLabel text="ลิงก์ร้าน (URL)" required />
              {isEditMode ? (
                <div style={{ padding: '14px 15px', border: `1.5px solid ${C.line}`, borderRadius: 13, background: '#f1ece3', ...ANU, fontSize: 15, color: C.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: C.muted }}>lalen.app/</span>
                  <span style={{ color: C.ink, fontWeight: 600 }}>{shopSlug}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted }}>เปลี่ยนไม่ได้</span>
                </div>
              ) : (
                <>
                  <SlugInput value={shopSlug} onChange={checkSlug} status={slugStatus} />
                  <div style={{ marginTop: 5, fontSize: 12, ...ANU, display: 'flex', alignItems: 'center', gap: 4, color: slugHint.color }}>
                    {slugStatus === 'ok' && <IcoCheck s={12} />}
                    {slugHint.text}
                  </div>
                </>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel text="โลโก้ร้าน (ไม่บังคับ)" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                {/* Clickable avatar box */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                  style={{
                    width: 74, height: 74, borderRadius: 18, flexShrink: 0, overflow: 'hidden',
                    border: logoUrl ? `2px solid ${C.red}` : `1.5px dashed #d8d3ca`,
                    background: '#faf9f7', display: 'grid', placeItems: 'center',
                    cursor: 'pointer', position: 'relative',
                  }}
                >
                  {logoLoading ? (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2.5px solid ${C.red}`, borderTopColor: 'transparent', animation: 'spin .7s linear infinite' }} />
                  ) : logoUrl ? (
                    <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : shopName ? (
                    <div style={{ width: '100%', height: '100%', background: C.red, display: 'grid', placeItems: 'center', ...KAN, fontWeight: 700, fontSize: 30, color: '#fff' }}>
                      {shopName.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div style={{ color: C.muted }}><IcoPlus s={22} /></div>
                  )}
                  {/* Camera overlay */}
                  {!logoLoading && (
                    <div style={{
                      position: 'absolute', bottom: 4, right: 4,
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'rgba(0,0,0,.5)', display: 'grid', placeItems: 'center',
                      color: '#fff',
                    }}>
                      <IcoCamera s={12} />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }}
                />
                <div>
                  <div style={{ ...KAN, fontWeight: 600, fontSize: 14, color: C.ink }}>
                    {logoUrl ? 'เปลี่ยนรูปโลโก้' : 'อัปโหลดโลโก้'}
                  </div>
                  <div style={{ ...ANU, fontSize: 12.5, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>
                    คลิกที่รูปเพื่ออัปโหลด · PNG/JPG · สูงสุด 5MB
                  </div>
                  {!logoUrl && (
                    <div style={{ ...ANU, fontSize: 12, color: C.muted, marginTop: 2 }}>
                      เว้นไว้ได้ — ระบบใช้อักษรย่อให้
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ShopPreviewChip name={shopName} slug={shopSlug} />

            {error && <p style={{ ...ANU, color: C.red, fontSize: 14, marginBottom: 10 }}>{error}</p>}

            <div style={{ paddingTop: 16 }}>
              <PrimaryBtn type="submit" disabled={!shopName || !shopSlug || (!isEditMode && slugStatus !== 'ok')}>
                <IcoArrow s={20} /> {isEditMode ? 'ถัดไป · แก้ไขบัญชี' : 'ถัดไป · ผูกบัญชี'}
              </PrimaryBtn>
            </div>
          </form>
        )}

        {/* ── Step 2: ผูกบัญชีรับเงิน ── */}
        {step === 2 && (
          <form onSubmit={submitSetup} style={{ display: 'flex', flexDirection: 'column' }}>
            <Stepper step={2} />
            <h2 style={{ ...KAN, fontWeight: 700, fontSize: 30, color: C.ink, margin: '0 0 6px' }}>
              {isEditMode ? 'แก้ไขบัญชีรับเงิน' : 'ผูกบัญชีรับเงิน'}
            </h2>
            <p style={{ ...ANU, fontSize: 15.5, color: C.muted, margin: '0 0 20px' }}>ผู้ซื้อโอนเข้าบัญชีนี้โดยตรง</p>

            <div style={{
              background: C.tintBlue, borderRadius: 13, padding: '13px 15px',
              display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 18,
            }}>
              <div style={{ color: C.blue, marginTop: 1, flexShrink: 0 }}><IcoShield s={18} /></div>
              <div>
                <div style={{ ...KAN, fontWeight: 600, fontSize: 14, color: C.ink }}>เงินเข้าบัญชีคุณ 100%</div>
                <div style={{ ...ANU, fontSize: 12.5, color: C.ink, lineHeight: 1.55, marginTop: 2 }}>
                  ระบบไม่ถือเงินและไม่หักยอด — ผูกบัญชีเพื่อให้ตรวจสลิปอัตโนมัติได้เท่านั้น
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 13 }}>
              <FieldLabel text="ธนาคาร / พร้อมเพย์" required />
              <BankSelect value={bankName} onChange={setBankName} />
            </div>

            <div style={{ marginBottom: 13 }}>
              <FieldLabel text="เลขบัญชี" required />
              <TextInput
                value={bankAccount}
                onChange={v => setBankAccount(formatBankAccount(v))}
                placeholder="123-4-56789-0"
                inputMode="numeric"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
              <div>
                <FieldLabel text="เบอร์ติดต่อ" required />
                <TextInput value={phone} onChange={v => setPhone(formatPhone(v))} placeholder="08X-XXX-XXXX" inputMode="tel" required />
              </div>
              <div>
                <FieldLabel text="ชื่อบัญชี" />
                <TextInput value={accountName} onChange={setAccountName} placeholder="ชื่อ-นามสกุล" />
              </div>
            </div>

            <div style={{ marginBottom: 13 }}>
              <FieldLabel text="ที่อยู่สำหรับส่งคืน/ติดต่อ (ไม่บังคับ)" />
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '14px 15px',
                  border: `1.5px solid ${C.line}`, borderRadius: 13,
                  fontSize: 14.5, color: C.ink, background: '#faf9f7',
                  outline: 'none', resize: 'vertical',
                  ...ANU, fontFamily: '"Anuphan", sans-serif',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted, fontSize: 12, marginBottom: 16, ...ANU }}>
              <IcoBell s={13} /> ระบบเช็คแค่ว่าเลขบัญชีมีจริง ไม่เทียบชื่อ
            </div>

            {error && <p style={{ ...ANU, color: C.red, fontSize: 14, marginBottom: 10 }}>{error}</p>}

            <div style={{ paddingTop: 16, display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => { setStep(1); setError('') }}
                style={{
                  padding: '16px 22px', border: `1.5px solid ${C.line}`,
                  background: C.paper, borderRadius: 15,
                  ...KAN, fontWeight: 600, fontSize: 16, color: C.ink,
                  cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                }}
              >
                ย้อนกลับ
              </button>
              <PrimaryBtn type="submit" loading={loading} style={{ flex: 1 }}>
                <IcoCheck s={20} /> {isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'เปิดร้าน'}
              </PrimaryBtn>
            </div>
          </form>
        )}

        {/* ── Step 3: สำเร็จ ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 24 }}>
            <div style={{
              width: 84, height: 84, borderRadius: '50%', background: C.green,
              color: '#fff', display: 'grid', placeItems: 'center',
              boxShadow: '0 12px 28px -8px rgba(46,158,79,.5)', marginBottom: 22,
            }}>
              <IcoCheck s={42} />
            </div>

            <h2 style={{ ...KAN, fontWeight: 700, fontSize: 27, color: C.ink, margin: '0 0 10px' }}>
              {isEditMode ? 'บันทึกเรียบร้อย ✓' : <>เปิดร้านสำเร็จ <span style={{ color: C.red }}>🎉</span></>}
            </h2>
            <p style={{ ...ANU, fontSize: 15, color: C.muted, margin: '0 0 24px' }}>
              {isEditMode
                ? `อัปเดตข้อมูลร้าน "${doneShopName}" เรียบร้อยแล้ว`
                : `ร้าน "${doneShopName}" พร้อมขายแล้ว เริ่มลงการ์ดกองแรกได้เลย`
              }
            </p>

            <div style={{ width: '100%' }}>
              <ShopPreviewChip name={doneShopName} slug={doneSlug} />
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              <PrimaryBtn onClick={() => router.push('/dashboard/listings/new')}>
                <IcoCamera s={20} /> ลงขายการ์ดกองแรก
              </PrimaryBtn>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  ...ANU, fontSize: 15, color: C.muted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                ไปที่แดชบอร์ด <IcoArrow s={16} />
              </button>
            </div>
          </div>
        )}
      </AuthLayout>
    </>
  )
}
