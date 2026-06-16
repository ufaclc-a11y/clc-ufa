'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { trackGoal } from '@/lib/analytics'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('PageError:', error)
    trackGoal('js_error', {
      message: error?.message?.slice(0, 200),
      digest: error?.digest,
      path: typeof location !== 'undefined' ? location.pathname : undefined,
    })
  }, [error])

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center py-24">
      <div className="text-6xl mb-6 opacity-15 select-none">:(</div>
      <h1 className="font-display text-4xl text-[#1A1A1A] tracking-wider mb-3">
        Что-то пошло не так
      </h1>
      <p className="text-[#6E6A64] text-lg max-w-sm mx-auto mb-8 leading-relaxed">
        Не удалось загрузить эту страницу. Попробуйте ещё раз или вернитесь на главную.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="bg-[#FF6B00] text-white font-semibold px-7 py-3 rounded-full hover:bg-[#e55e00] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
        >
          Попробовать снова
        </button>
        <Link
          href="/"
          className="border border-[#1A1A1A]/15 text-[#1A1A1A] font-semibold px-7 py-3 rounded-full hover:bg-[#1A1A1A]/5 transition-colors"
        >
          На главную
        </Link>
      </div>
    </section>
  )
}
