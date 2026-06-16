export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import PostActions from './PostActions'

// ─── Types ────────────────────────────────────────────────────────────────────

type CardStatus = 'available' | 'reserved' | 'sold' | 'removed'

interface CardRow {
  id: string
  name: string
  image_url: string | null
  status: CardStatus
}

interface BatchRow {
  id: string
  caption: string | null
  created_at: string
  is_active: boolean
  cards: CardRow[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TONE_COLORS = ['#ff7a00', '#2a75bb', '#2e9e4f', '#c026d3', '#ff7a45', '#7c3aed']

function toneFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return TONE_COLORS[hash % TONE_COLORS.length]
}

/** e.g. "มิถุนายน 3, 2026" */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('th-TH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Relative Thai: วันนี้ / X วันที่แล้ว / X เดือนที่แล้ว */
function relativeDate(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) return 'วันนี้'
  if (diffDays === 1) return 'เมื่อวาน'
  if (diffDays < 30) return `${diffDays} วันที่แล้ว`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} เดือนที่แล้ว`
  return `${Math.floor(diffMonths / 12)} ปีที่แล้ว`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}


function IconCamera() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

interface PostCardProps {
  batch: BatchRow
  shopSlug: string
}

function PostCard({ batch, shopSlug }: PostCardProps) {
  const cards = batch.cards ?? []
  const totalCards = cards.length
  const soldCards = cards.filter(c => c.status === 'sold').length
  const availableCards = cards.filter(c => c.status === 'available').length
  const isAllSold = availableCards === 0 && totalCards > 0
  const soldPct = totalCards > 0 ? Math.round((soldCards / totalCards) * 100) : 0

  const title = batch.caption?.trim() ||
    `โพสต์ขาย ${totalCards} ใบ · ${formatDate(batch.created_at)}`

  const previewCards = cards.slice(0, 4)
  const overflow = cards.length > 4 ? cards.length - 4 : 0

  const shopUrl = `/${shopSlug}?batch=${batch.id}`

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #eceaee',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      className="post-card"
    >
      {/* Cover */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 7,
          padding: 16,
          background: 'linear-gradient(150deg, #2b2620, #191510)',
          position: 'relative',
          minHeight: 108,
          alignItems: 'flex-end',
        }}
      >
        {previewCards.map((card, idx) => {
          const isLast = idx === 3 && overflow > 0
          return (
            <div
              key={card.id}
              style={{
                width: 48,
                flex: 'none',
                aspectRatio: '63 / 88',
                borderRadius: 6,
                overflow: 'hidden',
                position: 'relative',
                background: card.image_url ? 'transparent' : toneFromName(card.name || card.id),
                flexShrink: 0,
              }}
            >
              {card.image_url ? (
                <Image
                  src={card.image_url}
                  alt={card.name || 'การ์ด'}
                  fill
                  sizes="48px"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, ${toneFromName(card.name || card.id)}cc, ${toneFromName(card.name || card.id)}66)`,
                  }}
                />
              )}
              {/* +N overlay on last visible slot when there are more */}
              {isLast && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(10,8,6,0.72)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Kanit", sans-serif',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#fff',
                  }}
                >
                  +{overflow}
                </div>
              )}
            </div>
          )
        })}

        {/* Status badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: !batch.is_active ? '#fff8d8' : isAllSold ? '#eceaee' : '#e9f7ee',
            color: !batch.is_active ? '#b47a00' : isAllSold ? '#6b6a76' : '#207a3c',
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 700,
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 999,
          }}
        >
          {!batch.is_active ? 'ซ่อนอยู่' : isAllSold ? 'ขายหมดแล้ว' : 'กำลังขาย'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '15px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Title */}
        <h4
          style={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 700,
            fontSize: 15.5,
            lineHeight: 1.35,
            color: '#1c1b24',
            margin: 0,
          }}
        >
          {title}
        </h4>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 9,
            marginTop: 9,
            fontSize: 12.5,
            color: '#6b6a76',
            fontFamily: '"Anuphan", sans-serif',
          }}
        >
          <span>{totalCards} ใบ</span>
          <span>·</span>
          <span>ลงเมื่อ {relativeDate(batch.created_at)}</span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: '#f6f3ee',
            marginTop: 13,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${soldPct}%`,
              borderRadius: 999,
              background: '#ee1c25',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Progress label */}
        <p
          style={{
            fontSize: 11.5,
            color: '#6b6a76',
            fontFamily: '"Anuphan", sans-serif',
            margin: 0,
            marginTop: 6,
          }}
        >
          ขายไปแล้ว {soldCards}/{totalCards} ใบ ({soldPct}%)
        </p>

        <PostActions
          batchId={batch.id}
          shopSlug={shopSlug}
          isActive={batch.is_active}
          appUrl={process.env.NEXT_PUBLIC_APP_URL ?? 'https://lalens.com'}
        />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, slug')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!shop) redirect('/dashboard/setup')

  // Show all non-deleted batches (including hidden) to the shop owner
  const { data: batches } = await supabase
    .from('batch_uploads')
    .select(`id, caption, created_at, is_active,
      cards(id, name, image_url, status)`)
    .eq('shop_id', shop.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const isEmpty = !batches || batches.length === 0

  return (
    <DashboardLayout title="โพสต์ขาย" subtitle="แต่ละโพสต์คือ 1 ลิงก์ขาย แชร์ได้ทันที">
      <style>{`
        .post-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 34px -20px rgba(28,27,36,.42);
        }
        .post-action-link:hover {
          border-color: #ee1c25 !important;
          color: #ee1c25 !important;
        }
      `}</style>

      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 700,
              fontSize: 18,
              color: '#1c1b24',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            โพสต์ขาย
          </h2>
          <span
            style={{
              fontFamily: '"Anuphan", sans-serif',
              fontSize: 13,
              color: '#6b6a76',
            }}
          >
            แต่ละโพสต์คือ 1 ลิงก์ขาย — แชร์ไปได้เลย
          </span>
        </div>

        <Link
          href="/dashboard/listings/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: '#ee1c25',
            color: '#fff',
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 600,
            fontSize: 14,
            padding: '9px 18px',
            borderRadius: 11,
            boxShadow: '0 4px 0 #c0141b',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
          }}
        >
          <IconPlus />
          สร้างโพสต์ใหม่
        </Link>
      </div>

      {isEmpty ? (
        /* Empty state */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              background: '#fff',
              border: '1.5px solid #eceaee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b6a76',
              marginBottom: 20,
              boxShadow: '0 2px 12px rgba(28,27,36,.06)',
            }}
          >
            <IconCamera />
          </div>

          <h3
            style={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 700,
              fontSize: 17,
              color: '#1c1b24',
              margin: 0,
              marginBottom: 8,
            }}
          >
            ยังไม่มีโพสต์ขาย
          </h3>
          <p
            style={{
              fontFamily: '"Anuphan", sans-serif',
              fontSize: 14,
              color: '#6b6a76',
              margin: 0,
              marginBottom: 24,
              maxWidth: 280,
              lineHeight: 1.6,
            }}
          >
            สร้างโพสต์แรก แล้วแชร์ลิงก์ไปได้เลย
          </p>

          <Link
            href="/dashboard/listings/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: '#ee1c25',
              color: '#fff',
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              fontSize: 14,
              padding: '9px 20px',
              borderRadius: 11,
              boxShadow: '0 4px 0 #c0141b',
              textDecoration: 'none',
            }}
          >
            <IconPlus />
            สร้างโพสต์ใหม่
          </Link>
        </div>
      ) : (
        /* Posts grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {(batches as unknown as BatchRow[]).map(batch => (
            <PostCard key={batch.id} batch={batch} shopSlug={shop.slug} />
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
