'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary:   'bg-gradient-to-r from-brand-start to-brand-end text-white hover:opacity-90',
  secondary: 'border border-border-input text-zinc-300 hover:text-white hover:border-zinc-500 bg-transparent',
  ghost:     'text-zinc-400 hover:text-white bg-transparent',
  danger:    'bg-red-600 text-white hover:bg-red-700',
}

const sizes = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-5 py-3 text-base gap-2',
  lg: 'px-6 py-4 text-lg gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-bold rounded-xl transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
