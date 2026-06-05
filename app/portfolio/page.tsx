import type { Metadata } from 'next'
import { PortfolioGrid } from '@/components/PortfolioGrid'
import { CTASection }    from '@/components/CTASection'

export const metadata: Metadata = {
  title:       'Наши работы — галерея изделий | Центр лазерной резки Уфа',
  description: 'Галерея работ Центр лазерной резки: медали, таблички, вывески, детали из фанеры и акрила, УФ-печать, гравировка, фрезеровка ЧПУ в Уфе.',
  alternates:  { canonical: 'https://clc-ufa.ru/portfolio' },
}

type Props = { searchParams: { cat?: string } }

export default function PortfolioPage({ searchParams }: Props) {
  const defaultCategory = searchParams.cat ?? 'all'

  return (
    <>
      <div className="pt-24 pb-20 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Портфолио</span>
          <h1 className="font-display text-5xl sm:text-6xl text-[#1A1A1A] tracking-wider mt-2 mb-4">
            Наши работы
          </h1>
          <p className="text-lg text-[#8A8680] max-w-2xl mb-12">
            Медали, таблички, вывески, интерьерный декор, детали для производств и многое другое.
          </p>
          <PortfolioGrid defaultCategory={defaultCategory} />
        </div>
      </div>
      <CTASection />
    </>
  )
}
