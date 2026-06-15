import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function OrdersLoading() {
  return (
    <DashboardLayout title="ออเดอร์">
      <div className="animate-pulse">
        <div className="h-8 w-24 bg-[#ededf0] rounded-lg mb-6" />
        <div className="h-9 w-72 bg-[#ededf0] rounded-xl mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#ededf0] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0eee9]">
                <div className="h-6 w-20 bg-[#ededf0] rounded-full" />
                <div className="h-5 w-16 bg-[#f0eee9] rounded" />
              </div>
              <div className="px-5 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="w-8 h-11 rounded bg-[#ededf0]" />
                  ))}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 bg-[#f0eee9] rounded" />
                  <div className="h-3 w-24 bg-[#f0eee9] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
