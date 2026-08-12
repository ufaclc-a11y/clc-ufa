import type { Metadata } from 'next'
import Image             from 'next/image'
import { PortfolioGrid } from '@/components/PortfolioGrid'
import { CTASection }    from '@/components/CTASection'
import { JsonLd }        from '@/components/JsonLd'

const portfolioLd = {
  '@context': 'https://schema.org',
  '@type':    'CollectionPage',
  name:        'Портфолио работ — Центр лазерной резки',
  description: 'Галерея выполненных работ: лазерная резка, гравировка, УФ-печать и фрезеровка ЧПУ в Уфе.',
  url:         'https://clc-ufa.ru/portfolio',
  isPartOf:    { '@id': 'https://clc-ufa.ru/#website' },
  about:       { '@id': 'https://clc-ufa.ru/#business' },
}

export const metadata: Metadata = {
  title:       'Наши работы — галерея изделий | Центр лазерной резки Уфа',
  description: 'Галерея работ Центр лазерной резки: медали, таблички, вывески, детали из фанеры и акрила, УФ-печать, гравировка, фрезеровка ЧПУ в Уфе.',
  keywords:    ['портфолио лазерная резка уфа', 'примеры работ лазерная резка уфа', 'галерея гравировка уфа', 'наши работы уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/portfolio' },
}

type Props = { searchParams: Promise<{ cat?: string }> }

/* Коллаж из нескольких разных работ для hero-фона */
const HERO_IMAGES = [
  '/images/portfolio/medali-011.jpg',
  '/images/portfolio/gravirovka-029.jpg',
  '/images/portfolio/lazernaya-rezka-187.jpg',
  '/images/portfolio/nagradnye-statuetki-005.jpg',
]

export default async function PortfolioPage({ searchParams }: Props) {
  const { cat } = await searchParams
  const defaultCategory = cat ?? 'all'

  return (
    <>
      <JsonLd data={portfolioLd} />
      {/* ── HERO ── */}
      <div className="relative min-h-[400px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        {/* Сетка 2×2 из фото для фона */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {HERO_IMAGES.map((src, i) => (
            <div key={i} className="relative overflow-hidden">
              <Image
                src={src}
                alt=""
                fill
                priority={i < 2}
                className="object-cover opacity-25"
                sizes="50vw"
              />
            </div>
          ))}
        </div>
        {/* Оверлеи */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/95 via-[#1A1A1A]/75 to-[#1A1A1A]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-14 w-full">
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Портфолио</span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white tracking-wider mt-2 mb-4 leading-tight">
            Наши работы
          </h1>
          <p className="text-lg text-white/55 max-w-xl leading-relaxed">
            Медали, таблички, вывески, интерьерный декор, детали для производств и многое другое.
          </p>
        </div>
      </div>

      {/* ── СЕТКА С ФИЛЬТРОМ ── */}
      <div className="py-12 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <PortfolioGrid defaultCategory={defaultCategory} />
        </div>
      </div>

      <CTASection />
    </>
  )
}
