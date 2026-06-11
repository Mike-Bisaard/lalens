import Link from 'next/link'
import { Logo, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  shopName?: string
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ shopName, children, className }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-surface text-white">
      <nav className="sticky top-0 z-10 border-b border-border px-6 py-4 flex items-center justify-between bg-surface/80 backdrop-blur-md">
        <Logo />
        <div className="flex items-center gap-4">
          {shopName && <span className="text-zinc-400 text-sm hidden sm:block">{shopName}</span>}
          <Link
            href="/dashboard/orders"
            className="text-zinc-400 hover:text-white text-sm transition hidden sm:block"
          >
            ออเดอร์
          </Link>
          <Link
            href="/dashboard/listings"
            className="text-zinc-400 hover:text-white text-sm transition hidden sm:block"
          >
            สินค้า
          </Link>
          <Link
            href="/dashboard/listings/new"
            className="bg-gradient-to-r from-brand-start to-brand-end px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition"
          >
            + ลงขายใหม่
          </Link>
        </div>
      </nav>

      <main className={cn('max-w-5xl mx-auto px-4 sm:px-6 py-8', className)}>
        {children}
      </main>
    </div>
  )
}
