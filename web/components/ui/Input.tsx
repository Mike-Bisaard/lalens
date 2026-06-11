import { InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id: idProp, ...props }, ref) => {
    const autoId = useId()
    const id = idProp ?? autoId

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-surface-raised border border-border-input rounded-xl px-4 py-3',
            'text-white placeholder-zinc-500',
            'focus:outline-none focus:border-violet-500 transition',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
