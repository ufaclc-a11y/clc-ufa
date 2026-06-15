export default function Loading() {
  return (
    <div className="pt-24">
      {/* Hero-заглушка */}
      <div className="relative min-h-[400px] bg-[#1A1A1A] animate-pulse" />
      {/* Сетка-заглушка */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-[#E8E6E0] animate-pulse"
              style={{ animationDelay: `${(i % 6) * 80}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
