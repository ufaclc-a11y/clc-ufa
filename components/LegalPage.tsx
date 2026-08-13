import Link from 'next/link'

/**
 * Оболочка для правовых страниц: оферта, возврат, доставка и оплата.
 * Стили повторяют app/privacy/page.tsx, но вынесены сюда, чтобы один и тот же
 * блок не копировался на каждой странице.
 */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title:    string
  updated:  string
  intro?:   React.ReactNode
  children: React.ReactNode
}) {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

        <nav className="text-xs text-[#6E6A64] mb-10 flex items-center gap-2">
          <Link href="/" className="hover:text-[#FF6B00] transition-colors">Главная</Link>
          <span>/</span>
          <span className="text-[#1A1A1A]">{title}</span>
        </nav>

        <h1 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mb-3">
          {title}
        </h1>
        <p className="text-sm text-[#6E6A64] mb-12">Последнее обновление: {updated}</p>

        {intro && <div className="prose-clc mb-8">{intro}</div>}

        <div className="prose-clc">{children}</div>

        <div className="mt-16 pt-8 border-t border-[#E8E6E0]">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6B00]
              hover:underline underline-offset-4
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded"
          >
            ← В магазин
          </Link>
        </div>
      </div>

      <style>{`
        .prose-clc { color: #1A1A1A; font-size: 15px; line-height: 1.75; }
        .prose-clc h2 { font-family: var(--font-display, serif); font-size: 1.2rem; font-weight: 600; color: #1A1A1A; margin: 2.5rem 0 0.75rem; letter-spacing: 0.02em; }
        .prose-clc h3 { font-size: 1rem; font-weight: 600; color: #1A1A1A; margin: 1.5rem 0 0.5rem; }
        .prose-clc p { margin: 0.75rem 0; }
        .prose-clc ul { list-style: none; padding: 0; margin: 0.75rem 0; }
        .prose-clc ul li { padding-left: 1.25rem; position: relative; margin: 0.4rem 0; }
        .prose-clc ul li::before { content: '—'; position: absolute; left: 0; color: #FF6B00; }
        .prose-clc ol { padding-left: 1.25rem; margin: 0.75rem 0; }
        .prose-clc ol li { margin: 0.4rem 0; }
        .prose-clc a { color: #FF6B00; text-decoration: underline; text-underline-offset: 3px; }
        .prose-clc a:hover { color: #e55e00; }
        .prose-clc strong { color: #1A1A1A; font-weight: 600; }
        .prose-clc table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 14px; }
        .prose-clc th, .prose-clc td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #E8E6E0; vertical-align: top; }
        .prose-clc th { color: #6E6A64; font-weight: 600; }
      `}</style>
    </main>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-2">
      <h2>{title}</h2>
      {children}
    </section>
  )
}
