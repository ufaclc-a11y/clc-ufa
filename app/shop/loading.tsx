export default function Loading() {
  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="h-10 w-64 rounded-lg bg-[#E8E6E0] animate-pulse mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-[#E8E6E0]">
            <div
              className="aspect-square bg-[#E8E6E0] animate-pulse"
              style={{ animationDelay: `${(i % 4) * 80}ms` }}
            />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-[#E8E6E0] animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-[#E8E6E0] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
