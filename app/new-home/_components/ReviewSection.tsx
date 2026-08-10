import { reviews, sourceLabels, sourceUrls } from '@/data/reviews'

const reviewIds = ['r02', 'r05', 'r07']
const selectedReviews = reviewIds.map(id => reviews.find(review => review.id === id)).filter((review): review is NonNullable<typeof review> => Boolean(review))

export function ReviewSection() {
  const [featured, ...supporting] = selectedReviews
  if (!featured) return null

  return (
    <section className="bg-white py-16 sm:py-28" aria-labelledby="reviews-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="reviews-title" className="new-home-display max-w-[11ch] text-[34px] leading-[1.04] sm:text-[48px]">К нам возвращаются с новой задачей</h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-[#5E6672]">Отзывы опубликованы на Яндекс.Картах и в 2ГИС.</p>
          </div>

          <a href={sourceUrls[featured.source]} target="_blank" rel="noopener noreferrer" className="group border border-[#C9CFD6] bg-[#F3F5F2] p-6 text-[#101318] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647D8] sm:p-9 lg:col-span-8" aria-label={`Отзыв от ${featured.name} на ${sourceLabels[featured.source]}`}>
            <p className="inline-flex bg-[#E7FF42] px-3 py-2 text-sm font-bold text-[#0D2A80]">{featured.rating},0 из 5 · {sourceLabels[featured.source]}</p>
            <blockquote className="new-home-display mt-8 max-w-[24ch] text-[26px] leading-[1.25] sm:text-[36px]">«{featured.text}»</blockquote>
            <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-black/20 pt-4"><div><p className="font-bold">{featured.name}</p><p className="mt-1 text-sm text-black/60">{featured.product}</p></div><span className="font-bold text-[#1647D8] transition-transform duration-200 group-hover:translate-x-1">Читать источник →</span></div>
          </a>
        </div>

        <div className="mt-3 grid gap-3 lg:ml-[33.333%] lg:grid-cols-2">
          {supporting.map(review => (
            <a key={review.id} href={sourceUrls[review.source]} target="_blank" rel="noopener noreferrer" className="group hidden border border-[#C9CFD6] p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647D8] sm:block" aria-label={`Отзыв от ${review.name} на ${sourceLabels[review.source]}`}>
              <p className="text-sm font-bold text-[#1647D8]">{review.rating},0 из 5 · {sourceLabels[review.source]}</p>
              <blockquote className="mt-5 text-base leading-7 text-[#343B46]">«{review.text}»</blockquote>
              <div className="mt-7 border-t border-[#C9CFD6] pt-4"><p className="font-bold">{review.name}</p><p className="mt-1 text-sm text-[#5E6672]">{review.product}</p></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
