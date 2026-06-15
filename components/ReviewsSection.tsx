import { reviews, sourceLabels, sourceUrls, type Review } from '@/data/reviews'

const sourceColors: Record<Review['source'], string> = {
  yandex: '#FF4433',
  '2gis': '#1EBE6E',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} звёзд из 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14" height="14"
          viewBox="0 0 24 24"
          fill={i < rating ? '#FF6B00' : '#E8E6E0'}
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const srcColor = sourceColors[review.source]
  return (
    <a
      href={sourceUrls[review.source]}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#F5F4F0] rounded-2xl p-6 border border-[#E8E6E0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] hover:border-[#FF6B00]/30 transition-[box-shadow,border-color] duration-200 flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
      aria-label={`Отзыв от ${review.name} на ${sourceLabels[review.source]}`}
    >
      <StarRating rating={review.rating} />

      <p className="text-sm text-[#1A1A1A] leading-[1.7] mt-3 mb-4 flex-1">«{review.text}»</p>

      <div className="border-t border-[#E8E6E0] pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">{review.name}</p>
            {review.product && (
              <p className="text-xs text-[#FF6B00] mt-0.5">{review.product}</p>
            )}
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6E6A64" strokeWidth="2" className="opacity-40 shrink-0 mt-1" aria-hidden="true">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
            style={{ backgroundColor: srcColor }}
          >
            {sourceLabels[review.source]}
          </span>
          <span className="text-[11px] text-[#6E6A64]">
            {new Date(review.date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>
    </a>
  )
}

export function ReviewsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Отзывы</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
              Что говорят клиенты
            </h2>
          </div>
          {/* Aggregate rating */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-display text-3xl text-[#1A1A1A] tracking-wider leading-none">5.0</div>
              <div className="text-xs text-[#6E6A64] mt-1">Яндекс.Карты</div>
            </div>
            <div className="w-px h-10 bg-[#E8E6E0]" />
            <div className="text-center">
              <div className="font-display text-3xl text-[#1A1A1A] tracking-wider leading-none">4.9</div>
              <div className="text-xs text-[#6E6A64] mt-1">2ГИС</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>

        {/* Leave review CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-[#6E6A64] mb-3">Работали с нами? Будем рады вашему отзыву</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a
              href="https://yandex.ru/maps/org/tsentr_lazernoy_rezki/170623886332/reviews/"
              target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-[#FF6B00] border border-[#FF6B00]/30 px-5 py-2 rounded-full hover:bg-[#FF6B00]/5 transition-colors"
            >
              Оставить отзыв на Яндексе
            </a>
            <a
              href="https://2gis.ru/ufa/firm/70000001035679912/tab/reviews"
              target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-[#FF6B00] border border-[#FF6B00]/30 px-5 py-2 rounded-full hover:bg-[#FF6B00]/5 transition-colors"
            >
              Оставить отзыв в 2ГИС
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
