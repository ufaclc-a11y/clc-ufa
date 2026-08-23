import Link from 'next/link'
import type { FAQItem } from '@/data/faq'
import { RichText } from '@/components/RichText'

export function NewHomeFaq({ items }: { items: FAQItem[] }) {
  return (
    <section className="border-y border-[#C9CFD6] bg-[#F3F5F2] py-16 sm:py-28" aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="faq-title" className="new-home-display max-w-[10ch] text-[34px] leading-[1.04] sm:text-[48px]">До расчёта можно уточнить</h2>
          <Link href="/faq" className="mt-7 inline-flex min-h-11 items-center gap-3 text-sm font-bold text-[#1647D8] underline decoration-[#FF541F] decoration-2 underline-offset-4 hover:text-[#0D2A80] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647D8]">Все вопросы <span aria-hidden="true">→</span></Link>
        </div>
        <div className="border-t border-[#C9CFD6] lg:col-span-8">
          {items.map(item => (
            <details key={item.id} className="group border-b border-[#C9CFD6]">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-base font-bold marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647D8]"><span>{item.question}</span><span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#C9CFD6] text-lg text-[#1647D8] transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span></summary>
              <p className="max-w-[70ch] pb-6 text-base leading-7 text-[#5E6672]"><RichText text={item.answer} /></p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
