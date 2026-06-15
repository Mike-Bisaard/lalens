import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function PostsLoading() {
  return (
    <DashboardLayout title="โพสต์ขาย" subtitle="แต่ละโพสต์คือ 1 ลิงก์ขาย แชร์ได้ทันที">
      <div>
        {/* Section header skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ width: 120, height: 22, borderRadius: 6, background: '#eceaee', marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: 220, height: 14, borderRadius: 6, background: '#f0eee9', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
          <div style={{ width: 148, height: 40, borderRadius: 11, background: '#eceaee', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>

        {/* Grid skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: '1.5px solid #eceaee',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              {/* Cover area skeleton */}
              <div style={{ height: 112, background: '#e8e5e0', animation: 'pulse 1.5s ease-in-out infinite' }} />

              {/* Body skeleton */}
              <div style={{ padding: '15px 16px 16px' }}>
                <div style={{ width: '75%', height: 18, borderRadius: 6, background: '#f0eee9', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ width: '50%', height: 14, borderRadius: 6, background: '#f0eee9', marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
                {/* Progress bar */}
                <div style={{ height: 6, borderRadius: 999, background: '#f6f3ee', marginBottom: 8 }}>
                  <div style={{ width: `${30 + (i * 13) % 50}%`, height: '100%', borderRadius: 999, background: '#e0dde3', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
                <div style={{ width: 100, height: 12, borderRadius: 6, background: '#f0eee9', marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
                {/* Action row skeleton */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, height: 36, borderRadius: 10, background: '#f6f3ee', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ flex: 1, height: 36, borderRadius: 10, background: '#f6f3ee', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </DashboardLayout>
  )
}
