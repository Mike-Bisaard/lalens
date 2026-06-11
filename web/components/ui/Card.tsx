import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-surface-raised border border-border rounded-2xl', paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
}
