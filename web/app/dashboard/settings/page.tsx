export const dynamic = 'force-dynamic'

import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getAuthenticatedShop } from '@/lib/getShop'
import { CopyButton } from './CopyButton'

const KAN: React.CSSProperties = { fontFamily: '"Kanit", sans-serif' }
const ANU: React.CSSProperties = { fontFamily: '"Anuphan", sans-serif' }

const C = {
  red: '#ee1c25',
  redDeep: '#c0141b',
  blue: '#2a75bb',
  ink: '#1c1b24',
  muted: '#6b6a76',
  paper: '#fff',
  line: '#ededf0',
  tintBlue: '#eef5ff',
  tintWarm: '#fff6ec',
} as const

function InfoRow({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ ...KAN, fontWeight: 500, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
      <span style={{ ...ANU, fontSize: 15.5, color: C.ink, lineHeight: 1.4 }}>{value}</span>
      {sub && <span style={{ ...ANU, fontSize: 12, color: C.muted }}>{sub}</span>}
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '15px 20px', borderBottom: `1.5px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: '#f4f0ea', display: 'grid', placeItems: 'center', color: C.ink, flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ ...KAN, fontWeight: 600, fontSize: 15, color: C.ink }}>{title}</span>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {children}
      </div>
    </div>
  )
}

export default async function ShopSettingsPage() {
  const auth = await getAuthenticatedShop()
  if (!auth) redirect('/login')

  const { shop } = auth
  const last4 = shop.bank_account_last4 as string | null
  const maskedAccount = last4 ? `•••••${last4}` : '—'
  const shopUrl = `https://lalen.app/${shop.slug as string}`

  return (
    <DashboardLayout title="ตั้งค่าร้าน" subtitle="ข้อมูลและการตั้งค่าร้านของคุณ">
      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Shop header card ── */}
        <div style={{
          background: `
            linear-gradient(108deg, rgba(86,7,9,.36) 0%, rgba(86,7,9,.08) 35%, transparent 62%, rgba(86,7,9,.20) 100%),
            radial-gradient(circle at 8% 12%, #ff7a45, transparent 52%),
            radial-gradient(circle at 90% 96%, #ffcb05, transparent 50%),
            linear-gradient(150deg, ${C.red}, ${C.redDeep})`,
          borderRadius: 18, padding: '24px 28px',
          display: 'flex', alignItems: 'center', gap: 20,
          boxShadow: '0 8px 32px -12px rgba(238,28,37,.45)',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, flexShrink: 0,
            background: 'rgba(255,255,255,.22)', border: '2px solid rgba(255,255,255,.4)',
            display: 'grid', placeItems: 'center', overflow: 'hidden',
            ...KAN, fontWeight: 700, fontSize: 32, color: '#fff',
          }}>
            {shop.avatar_url
              ? <img src={shop.avatar_url as string} alt={shop.name as string} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (shop.name as string).charAt(0).toUpperCase()
            }
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...KAN, fontWeight: 700, fontSize: 22, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
              {shop.name as string}
            </div>
            <div style={{ ...ANU, fontSize: 14, color: 'rgba(255,255,255,.85)' }}>
              lalen.app/<span style={{ fontWeight: 600 }}>{shop.slug as string}</span>
            </div>
          </div>

          <Link
            href="/dashboard/setup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
              background: 'rgba(255,255,255,.18)', border: '1.5px solid rgba(255,255,255,.38)',
              borderRadius: 12, padding: '10px 16px',
              ...KAN, fontWeight: 600, fontSize: 14, color: '#fff',
              textDecoration: 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            แก้ไขข้อมูล
          </Link>
        </div>

        {/* ── ข้อมูลร้าน ── */}
        <Section
          title="ข้อมูลร้าน"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l1-6h16l1 6"/>
              <path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/>
              <path d="M5 9v12h14V9"/><rect x="9" y="14" width="6" height="7"/>
            </svg>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <InfoRow label="ชื่อร้าน" value={shop.name as string} />
            <InfoRow
              label="ลิงก์ร้าน"
              value={<span style={{ color: C.red }}>lalen.app/{shop.slug as string}</span>}
            />
          </div>

          {/* Share link */}
          <div style={{
            background: C.tintWarm, border: '1.5px solid #f3dca0',
            borderRadius: 12, padding: '11px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span style={{ ...ANU, fontSize: 13.5, color: C.ink, flex: 1, wordBreak: 'break-all' }}>
              {shopUrl}
            </span>
            <CopyButton text={shopUrl} />
          </div>
        </Section>

        {/* ── บัญชีรับเงิน ── */}
        <Section
          title="บัญชีรับเงิน"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3.5" y="6" width="17" height="13" rx="2.5"/>
              <path d="M3.5 9.5h11M16.5 13.5h.01"/>
              <path d="M16 6V4.5a1.5 1.5 0 0 0-2-1.4L5 6"/>
            </svg>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <InfoRow label="ธนาคาร" value={(shop.bank_name as string) || '—'} />
            <InfoRow
              label="เลขบัญชี"
              value={
                <span style={{ fontFamily: 'monospace, "Anuphan", sans-serif', letterSpacing: '.06em' }}>
                  {maskedAccount}
                </span>
              }
              sub="เข้ารหัสแล้ว ไม่แสดงตัวเต็ม"
            />
            {shop.account_holder_name && (
              <InfoRow label="ชื่อบัญชี" value={shop.account_holder_name as string} />
            )}
            {shop.phone && (
              <InfoRow label="เบอร์ติดต่อ" value={shop.phone as string} />
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: C.tintBlue, borderRadius: 11, alignItems: 'flex-start' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ ...ANU, fontSize: 12.5, color: C.ink, lineHeight: 1.55 }}>
              บัญชีนี้ใช้ตรวจสลิปอัตโนมัติ เงินผู้ซื้อโอนตรงเข้าบัญชีคุณ 100% ไม่ผ่านระบบ
            </span>
          </div>
        </Section>

        {/* ── ที่อยู่ (ถ้ามี) ── */}
        {shop.address && (
          <Section
            title="ที่อยู่"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            }
          >
            <InfoRow label="ที่อยู่สำหรับส่งคืน/ติดต่อ" value={shop.address as string} />
          </Section>
        )}

        {/* ── Actions ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 4 }}>
          <Link
            href={`/${shop.slug as string}`}
            target="_blank"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              border: `1.5px solid ${C.line}`, background: C.paper,
              borderRadius: 12, padding: '11px 18px',
              ...KAN, fontWeight: 600, fontSize: 14, color: C.ink,
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            ดูหน้าร้าน
          </Link>

          <Link
            href="/dashboard/setup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: C.red, borderRadius: 12, padding: '11px 18px',
              ...KAN, fontWeight: 600, fontSize: 14, color: '#fff',
              textDecoration: 'none',
              boxShadow: `0 4px 0 ${C.redDeep}`,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            แก้ไขข้อมูลร้าน
          </Link>
        </div>

      </div>
    </DashboardLayout>
  )
}
