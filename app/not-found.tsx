import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-4 text-center pt-16">
      <div className="font-display select-none leading-none text-[#FF6B00]/10"
           style={{ fontSize: 'clamp(120px, 20vw, 220px)' }}>
        404
      </div>
      <div className="-mt-4 mb-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wider mb-3">
          Страница не найдена
        </h1>
        <p className="text-[#8A8680] text-lg max-w-sm mx-auto leading-relaxed">
          Возможно, страница была перемещена или удалена.
        </p>
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/"
          className="bg-[#FF6B00] text-white font-semibold px-7 py-3 rounded-full hover:bg-[#e55e00] transition-colors">
          На главную
        </Link>
        <Link href="/contacts"
          className="border border-white/20 text-white font-semibold px-7 py-3 rounded-full hover:bg-white/5 transition-colors">
          Контакты
        </Link>
      </div>
    </div>
  )
}
