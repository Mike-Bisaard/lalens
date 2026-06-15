import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function DashboardLoading() {
  return (
    <DashboardLayout title="ภาพรวมร้าน">
      <div className="animate-pulse">
        <div className="h-8 w-40 bg-[#ededf0] rounded-lg mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#ededf0] rounded-xl p-5 space-y-2">
              <div className="h-8 w-16 bg-[#ededf0] rounded" />
              <div className="h-4 w-24 bg-[#f0eee9] rounded" />
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#ededf0] rounded-xl p-5 space-y-3">
              <div className="h-8 w-8 bg-[#ededf0] rounded" />
              <div className="h-5 w-24 bg-[#ededf0] rounded" />
              <div className="h-4 w-full bg-[#f0eee9] rounded" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
