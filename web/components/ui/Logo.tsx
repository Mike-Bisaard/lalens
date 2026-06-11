import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  href?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
}

export function Logo({ href = '/', size = 'md', className }: LogoProps) {
  const text = (
    <span
      className={cn(
        'font-black bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent',
        sizes[size],
        className
      )}
    >
      Lalens
    </span>
  )

  if (href == null) return text
  return <Link href={href}>{text}</Link>
}
