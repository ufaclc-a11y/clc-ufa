import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordion } from '@/components/FAQAccordion'
import { CTASection } from '@/components/CTASection'
import { faqItems } from '@/data/faq'
import { faqPageLd } from '@/lib/seo'

export const metadata: Metadata = {
  title:       'Частые вопросы — лазерная резка и изготовление изделий в Уфе',
  description: 'Ответы на частые вопросы: как заказать, какой нужен макет, с какими материалами работаем, как формируются цены, сроки. Центр лазерной резки — Уфа.',
  keywords:    ['лазерная резка уфа вопросы', 'как заказать лазерную резку уфа', 'цена лазерной резки уфа', 'гравировка цена уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/faq' },
}

// Schema.org FAQPage — полный список вопросов (страница показывает все).
const faqJsonLd = faqPageLd(faqItems)

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[#1A1A1A] pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-[#FF6B00]" />
            <span className="font-mono text-xs text-[#FF6B00] tracking-[0.2em] uppercase">FAQ</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wider mb-4">
            Частые вопросы
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Если не нашли ответ — напишите нам в{' '}
            <a href="https://wa.me/79374838003" className="text-[#FF6B00] hover:underline">WhatsApp</a>
            {', '}
            <a href="https://t.me/clcufa" className="text-[#FF6B00] hover:underline">Telegram</a>
            {' '}или{' '}
            <a href="https://max.ru/u/f9LHodD0cOJovKYdnmZPaYaDMUKsaiKLd4XDfHDJQDiV-nyK1Csp7gqlTFk" className="text-[#FF6B00] hover:underline">Макс</a>.
            Ответим в течение нескольких минут.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-[#F5F4F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FAQAccordion grouped />
        </div>
      </section>

      <CTASection dark />
    </>
  )
}
