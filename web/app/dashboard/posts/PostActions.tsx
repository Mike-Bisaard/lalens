'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

interface PostActionsProps {
  batchId: string
  shopSlug: string
  isActive: boolean
  appUrl: string
}

export default function PostActions({ batchId, shopSlug, isActive, appUrl }: PostActionsProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialog, setDialog] = useState<'hide' | 'delete' | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  const postUrl = `${appUrl}/${shopSlug}?batch=${batchId}`

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
    setMenuOpen(false)
  }

  async function confirmAction() {
    if (!dialog) return
    setLoading(true)
    try {
      const res = await fetch(`/api/batches/${batchId}`, {
        method: dialog === 'hide' ? 'PATCH' : 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
      setDialog(null)
    }
  }

  return (
    <>
      {/* Action row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {/* Primary: View post */}
        <a
          href={`/${shopSlug}?batch=${batchId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            background: '#1c1b24',
            color: '#fff',
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 600,
            fontSize: 13.5,
            padding: '9px 12px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          ดูโพสต์
        </a>

        {/* Options button */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1.5px solid #e0dde3',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6b6a76',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              right: 0,
              background: '#fff',
              border: '1.5px solid #e0dde3',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(28,27,36,.12)',
              minWidth: 180,
              zIndex: 50,
              overflow: 'hidden',
            }}>
              <MenuItem
                icon={copied ? '✓' : <IconCopy />}
                label={copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
                onClick={copyLink}
                color={copied ? '#2e9e4f' : '#1c1b24'}
              />
              <div style={{ height: 1, background: '#f0eee9' }} />
              <MenuItem
                icon={isActive ? <IconEyeOff /> : <IconEye />}
                label={isActive ? 'ซ่อนโพสต์' : 'แสดงโพสต์'}
                onClick={() => { setMenuOpen(false); setDialog('hide') }}
                color="#b47a00"
              />
              <div style={{ height: 1, background: '#f0eee9' }} />
              <MenuItem
                icon={<IconTrash />}
                label="ลบโพสต์"
                onClick={() => { setMenuOpen(false); setDialog('delete') }}
                color="#ee1c25"
              />
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog — rendered via portal to escape .post-card transform stacking context */}
      {dialog && mounted && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={e => { if (e.target === e.currentTarget) setDialog(null) }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 18,
            padding: '28px 28px 24px',
            maxWidth: 380,
            width: '100%',
            boxShadow: '0 24px 60px rgba(28,27,36,.18)',
          }}>
            {/* Icon */}
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: dialog === 'delete' ? '#fff1ef' : '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              {dialog === 'delete'
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ee1c25" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b47a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              }
            </div>

            <h3 style={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: 17, color: '#1c1b24', margin: '0 0 8px' }}>
              {dialog === 'delete' ? 'ลบโพสต์นี้?' : isActive ? 'ซ่อนโพสต์นี้?' : 'แสดงโพสต์นี้?'}
            </h3>
            <p style={{ fontFamily: '"Anuphan", sans-serif', fontSize: 14, color: '#6b6a76', margin: '0 0 24px', lineHeight: 1.6 }}>
              {dialog === 'delete'
                ? 'การ์ดทั้งหมดในโพสต์นี้จะถูกลบถาวร ไม่สามารถกู้คืนได้ (ยกเว้นการ์ดที่ขายไปแล้ว)'
                : isActive
                ? 'โพสต์จะไม่ปรากฏในร้านค้า แต่ยังเก็บข้อมูลไว้อยู่ สามารถเปิดใหม่ได้ภายหลัง'
                : 'โพสต์จะกลับมาปรากฏในร้านค้าอีกครั้ง'
              }
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDialog(null)}
                disabled={loading}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 10,
                  border: '1.5px solid #e0dde3',
                  background: '#fff',
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#6b6a76',
                  cursor: 'pointer',
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmAction}
                disabled={loading}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 10,
                  border: 'none',
                  background: dialog === 'delete' ? '#ee1c25' : '#b47a00',
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: dialog === 'delete' ? '0 3px 0 #c0141b' : '0 3px 0 #8a5c00',
                }}
              >
                {loading ? 'กำลังดำเนินการ...' : dialog === 'delete' ? 'ลบโพสต์' : isActive ? 'ซ่อนโพสต์' : 'แสดงโพสต์'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  )
}

function MenuItem({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '11px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: '"Anuphan", sans-serif',
        fontSize: 14,
        color,
        textAlign: 'left',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#faf7f2')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
      {label}
    </button>
  )
}

function IconCopy() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}
