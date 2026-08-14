export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F6F9] px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-7 h-[270px] animate-pulse rounded-2xl bg-[#ECE7F5] lg:h-[310px]" />
        <div className="grid items-start gap-7 lg:grid-cols-[238px_minmax(0,1fr)]">
          <div className="hidden h-[440px] animate-pulse rounded-2xl bg-white lg:block" />
          <div>
            <div className="mb-5 h-9 w-56 animate-pulse rounded-lg bg-[#E4E5EA]" />
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <div
                    className="aspect-[3/4] animate-pulse rounded-2xl bg-white"
                    style={{ animationDelay: `${(i % 4) * 80}ms` }}
                  />
                  <div className="space-y-2 px-1 pt-3">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-[#E4E5EA]" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-[#E4E5EA]" />
                    <div className="h-6 w-1/2 animate-pulse rounded bg-[#E4E5EA]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
