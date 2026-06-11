export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-[#09090f] text-white animate-pulse">
      {/* Header skeleton */}
      <div className="border-b border-zinc-800 px-4 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-zinc-800 rounded-lg" />
            <div className="h-4 w-64 bg-zinc-800 rounded-lg" />
          </div>
          <div className="h-10 w-24 bg-zinc-800 rounded-xl" />
        </div>
      </div>

      {/* Card grid skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="w-full aspect-[5/7] bg-zinc-800" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                <div className="h-4 w-1/2 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
