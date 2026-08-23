import Image from 'next/image'
import Link from 'next/link'
import { business } from '@/data/contacts'
import { TrackedCalcLink } from './TrackedCalcLink'

const trustFacts = [
  { name: 'От 1 штуки', fact: 'без минимального тиража' },
  { name: 'Для ИП и ООО', fact: 'договор и документы' },
  { name: '5,0 из 5', fact: '8 отзывов на сайте' },
  { name: 'Ежедневно', fact: 'с 10:00 до 19:00' },
]

export function NewHomeHero() {
  return (
    <header id="new-home-hero" className="relative isolate min-h-[720px] bg-[#0D2A80] pt-20 text-white sm:min-h-[760px] sm:pt-24 lg:min-h-[820px]">
      <Image
        src="/images/hero-laser.jpg"
        alt="Лазерный станок вырезает деталь из фанеры"
        fill
        priority
        className="new-home-hero-image object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[#07194b]/45" aria-hidden="true" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-[#07194b]/95 via-[#07194b]/55 to-[#07194b]/10 lg:block" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[640px] max-w-[1440px] flex-col justify-between px-4 pb-8 pt-16 sm:min-h-[660px] sm:px-6 sm:pb-10 sm:pt-20 lg:min-h-[720px] lg:px-10 lg:pt-24">
        <div className="max-w-[880px]">
          <h1 className="new-home-display max-w-[13ch] text-[42px] leading-[0.98] sm:text-[56px] lg:text-[72px]">
            Из идеи или файла — в готовое изделие
          </h1>
          <p className="mt-6 max-w-[660px] text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
            Лазерная резка, УФ-печать, гравировка и ЧПУ в одном цехе в Уфе. От одной штуки до регулярной серии.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <TrackedCalcLink className="new-home-primary inline-flex min-h-12 items-center justify-center gap-3 bg-[#FF541F] px-6 text-sm font-bold text-[#101318] hover:-translate-y-0.5 hover:bg-[#FF6A3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7FF42] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07194b] active:translate-y-0 active:scale-[0.98]">
              Рассчитать заказ
              <span aria-hidden="true">→</span>
            </TrackedCalcLink>
            <Link href="/portfolio" className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/50 px-6 text-sm font-bold text-white hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#0D2A80] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7FF42] active:translate-y-0 active:scale-[0.98]">
              Посмотреть работы
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-white/35 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-lg text-sm leading-6 text-white/75">Фанера, акрил, МДФ, ПВХ, дерево, металл, кожа, стекло и другие материалы.</p>
          <a href={`tel:${business.phone}`} className="text-base font-bold underline decoration-[#E7FF42] decoration-2 underline-offset-4 hover:text-[#E7FF42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7FF42]">
            {business.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="relative bg-[#1647D8]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 border-x border-white/20 sm:grid-cols-4">
          {trustFacts.map((item, index) => (
            <div key={item.name} className={`min-h-28 border-b border-white/20 p-4 sm:min-h-32 sm:border-b-0 sm:p-5 lg:p-6 ${index % 2 ? 'border-l border-white/20' : ''} ${index > 1 ? 'sm:border-l sm:border-white/20' : ''}`}>
              <p className="font-bold">{item.name}</p>
              <p className="mt-2 text-sm leading-5 text-white/70">{item.fact}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
