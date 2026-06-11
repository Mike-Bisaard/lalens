import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
    />
  )
}
