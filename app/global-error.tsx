'use client'

import Link from 'next/link'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-4 text-center"
            style={{ fontFamily: 'Manrope, sans-serif' }}>
        <div className="text-7xl mb-6 opacity-20 select-none">:(</div>
        <h1 className="text-4xl font-bold text-white mb-3"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.03em' }}>
          Что-то пошло не так
        </h1>
        <p className="text-[#8A8680] text-lg max-w-sm mx-auto mb-8 leading-relaxed">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={reset}
            className="bg-[#FF6B00] text-white font-semibold px-7 py-3 rounded-full hover:bg-[#e55e00] transition-colors">
            Попробовать снова
          </button>
          <Link href="/"
            className="border border-white/20 text-white font-semibold px-7 py-3 rounded-full hover:bg-white/5 transition-colors">
            На главную
          </Link>
        </div>
      </body>
    </html>
  )
}
