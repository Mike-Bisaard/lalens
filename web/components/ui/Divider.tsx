interface DividerProps {
  label?: string
}

export function Divider({ label = 'หรือ' }: DividerProps) {
  return (
    <div className="flex items-center gap-3 my-6">
      <hr className="flex-1 border-border" />
      <span className="text-zinc-500 text-sm">{label}</span>
      <hr className="flex-1 border-border" />
    </div>
  )
}
