import { Logo } from '@/components/ui'

interface AuthLayoutProps {
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthLayout({ subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo href="/" size="lg" />
          <p className="text-zinc-400 mt-2">{subtitle}</p>
        </div>

        {children}

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  )
}
