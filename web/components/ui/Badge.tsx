import { cn } from '@/lib/utils'

type BadgeVariant = 'available' | 'reserved' | 'sold' | 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'

interface BadgeProps {
  variant: BadgeVariant
  className?: string
}

const styles: Record<BadgeVariant, string> = {
  available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  reserved:  'bg-amber-500/15  text-amber-400  border-amber-500/30',
  sold:      'bg-zinc-700/40   text-zinc-400   border-zinc-600/30',
  NM:        'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  LP:        'bg-sky-500/15    text-sky-400    border-sky-500/30',
  MP:        'bg-amber-500/15  text-amber-400  border-amber-500/30',
  HP:        'bg-orange-500/15 text-orange-400 border-orange-500/30',
  DMG:       'bg-red-500/15    text-red-400    border-red-500/30',
}

const labels: Record<BadgeVariant, string> = {
  available: 'ว่าง',
  reserved:  'จองอยู่',
  sold:      'ขายแล้ว',
  NM: 'NM', LP: 'LP', MP: 'MP', HP: 'HP', DMG: 'DMG',
}

export function Badge({ variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border',
        styles[variant],
        className
      )}
    >
      {labels[variant]}
    </span>
  )
}
