import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function ListingsLoading() {
  return (
    <DashboardLayout shopName="...">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-36 bg-zinc-800 rounded-lg" />
          <div className="flex gap-3">
            <div className="h-9 w-24 bg-zinc-800 rounded-lg" />
            <div className="h-9 w-28 bg-zinc-800 rounded-xl" />
          </div>
        </div>
        <div className="h-9 w-64 bg-zinc-800 rounded-xl mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="w-full aspect-[5/7] bg-zinc-800" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 w-3/4 bg-zinc-800 rounded" />
                <div className="h-4 w-1/2 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
