import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { CTASection }  from '@/components/CTASection'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { business }    from '@/data/contacts'

export const metadata: Metadata = {
  title:       'Акции и скидки на резку и гравировку в Уфе | ЦЛР',
  description: 'Актуальные акции Центр лазерной резки: скидки на партии, подарки с гравировкой, срочный заказ за 1 час. Лазерная резка, УФ-печать, гравировка в Уфе.',
  keywords:    ['акции лазерная резка уфа', 'скидки гравировка уфа', 'акции уф печать уфа', 'скидки на резку уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/promo' },
}

const offers = [
  {
    badge:    'Постоянно',
    badgeCls: 'bg-[#FF6B00] text-white',
    title:    'Без минимального тиража',
    desc:     'Берёмся за заказы от 1 штуки. Стоимость единицы будет выше при маленьком тираже — это честно. Зато не нужно брать лишнее.',
    action:   null,
    image:    '/images/portfolio/lazernaya-rezka-001.jpg',
  },
  {
    badge:    'Скидка от тиража',
    badgeCls: 'bg-[#059669] text-white',
    title:    'До −40% при заказе от 50 штук',
    desc:     'Чем больше тираж — тем ниже стоимость единицы. При партии от 50 шт — скидка от 20%. От 100 шт — от 30%. От 200 шт — до 40%. Спрашивайте точную цену.',
    action:   { label: 'Узнать стоимость партии', href: business.whatsapp },
    image:    '/images/old-site/uv-medali-15.jpg',
  },
  {
    badge:    'Быстро',
    badgeCls: 'bg-[#2563EB] text-white',
    title:    'Срочный заказ за 1 час',
    desc:     'Небольшой заказ выполним за 1 час при наличии материала. Скажите, что срочно — постараемся сдвинуть приоритет. Доплата за срочность не всегда нужна.',
    action:   { label: 'Написать о срочном заказе', href: business.telegram },
    image:    '/images/portfolio/gravirovka-001.jpg',
  },
  {
    badge:    'Корпоративам',
    badgeCls: 'bg-[#7C3AED] text-white',
    title:    'Специальные условия для B2B',
    desc:     'Для агентств, производств, дизайнеров — отдельные условия: прайс-лист, договор, закрывающие документы. Работаем как подрядчик и как поставщик.',
    action:   { label: 'Узнать B2B-условия', href: '/b2b' },
    image:    '/images/products/b2b-detali-proizvodstvo.jpg',
  },
  {
    badge:    'Подарки',
    badgeCls: 'bg-[#DC2626] text-white',
    title:    'Именная гравировка на подарке',
    desc:     'Любой подарок становится особенным с именной гравировкой. Термос, нож, брелок, рамка — принесите с собой или закажите у нас. За 1 час.',
    action:   { label: 'Написать про подарок', href: business.whatsapp },
    image:    '/images/portfolio/chasy-001.jpg',
  },
  {
    badge:    'Для производств',
    badgeCls: 'bg-[#D97706] text-white',
    title:    'Регулярные поставки — по фиксированной цене',
    desc:     'Если нужны одинаковые детали раз в месяц — оформим регулярный заказ с фиксированной ценой на весь период. Удобно для производственных циклов.',
    action:   { label: 'Обсудить условия', href: business.telegram },
    image:    '/images/portfolio/zagotovki-001.jpg',
  },
]

export default function PromoPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative min-h-[380px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        <div className="absolute inset-0">
          <Image
            src="/images/portfolio/medali-001.jpg"
            alt="Акции и специальные условия Центр лазерной резки"
            fill priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/95 via-[#1A1A1A]/70 to-[#1A1A1A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-14 w-full">
          <Breadcrumbs items={[{ label: 'Акции' }]} darkMode />
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Акции</span>
          <h1 className="font-display text-5xl sm:text-6xl text-white tracking-wider mt-2 mb-4 leading-[1]">
            Специальные<br />условия
          </h1>
          <p className="text-white/55 text-lg leading-relaxed max-w-xl">
            Скидки от тиража, срочные заказы, корпоративные условия, именные подарки — всё в одном цехе.
          </p>
        </div>
      </div>

      {/* Offers */}
      <section className="py-16 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map(offer => (
              <div
                key={offer.title}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8E6E0] shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow group flex flex-col"
              >
                {/* Image */}
                <div className="relative h-44 bg-[#2D2D2D] overflow-hidden">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Badge */}
                  <div className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${offer.badgeCls}`}>
                    {offer.badge}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="font-display text-xl text-[#1A1A1A] tracking-wide mb-3 leading-tight">
                    {offer.title}
                  </h2>
                  <p className="text-sm text-[#8A8680] leading-[1.7] flex-1">{offer.desc}</p>

                  {offer.action && (
                    <div className="mt-5 pt-4 border-t border-[#E8E6E0]">
                      {offer.action.href.startsWith('http') ? (
                        <a
                          href={offer.action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4"
                        >
                          {offer.action.label} →
                        </a>
                      ) : (
                        <Link
                          href={offer.action.href}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4"
                        >
                          {offer.action.label} →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick contact */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-[#1A1A1A] tracking-wider mb-4">
            Есть специфическая задача?
          </h2>
          <p className="text-[#8A8680] leading-relaxed mb-8">
            Не нашли подходящего предложения — напишите. Мы гибкие и готовы обсуждать нестандартные условия.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href={business.whatsapp} target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1fb855] transition-colors">WhatsApp</a>
            <a href={business.telegram} target="_blank" rel="noopener noreferrer"
              className="bg-[#2AABEE] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1a9adc] transition-colors">Telegram</a>
            <a href={business.max} target="_blank" rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#2B7FFF] to-[#9B3FE8] text-white font-semibold px-6 py-3 rounded-full hover:brightness-110 transition-[filter]">MAX</a>
            <a href={`mailto:${business.email}?subject=${encodeURIComponent('Специальные условия')}`}
              className="bg-[#1A1A1A]/8 text-[#1A1A1A] font-semibold px-6 py-3 rounded-full hover:bg-[#1A1A1A]/15 transition-colors">Написать на почту</a>
          </div>
        </div>
      </section>

      <CTASection dark />
    </>
  )
}
