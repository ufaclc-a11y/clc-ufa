import Image from 'next/image'
import Link from 'next/link'
import { cases } from '@/data/cases'

const facts = [
  ['±0,1 мм', 'точность лазерной резки'],
  ['60 × 90 см', 'рабочая область УФ-печати'],
  ['2440 × 1220 мм', 'размер стола ЧПУ'],
  ['6–40 мм', 'фанера для фрезеровки'],
]

const productionCase = cases.find(item => item.id === 'detali-b2b-seria')

export function BusinessSection() {
  return (
    <section className="bg-[#1647D8] py-16 text-white sm:py-28" aria-labelledby="business-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 id="business-title" className="new-home-display max-w-[14ch] text-[34px] leading-[1.04] sm:text-[48px]">Производственный подрядчик для одной детали и регулярной серии</h2>
          </div>
          <p className="max-w-[62ch] text-base leading-7 text-white/75 lg:col-span-5">Работаем с производственными компаниями, рекламными и ивент-агентствами, дизайнерами и мастерскими. Можно начать с образца, затем повторить партию.</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-stretch">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#0D2A80] lg:col-span-7 lg:aspect-auto lg:min-h-[620px]">
            <Image src="/images/products/b2b-detali-proizvodstvo.jpg" alt="Серийная фрезеровка деревянных деталей на станке ЧПУ" fill className="object-cover" sizes="(min-width: 1024px) 58vw, 100vw" />
          </div>
          <div className="flex flex-col lg:col-span-5">
            <div className="grid grid-cols-2 border-l border-t border-white/30">
              {facts.map(([value, label], index) => (
                <div key={label} className={`min-h-36 border-b border-r border-white/30 p-4 sm:block sm:p-5 ${index > 1 ? 'hidden' : ''}`}>
                  <p className="new-home-display text-[28px] leading-none sm:text-[34px]">{value}</p>
                  <p className="mt-3 text-sm leading-5 text-white/65">{label}</p>
                </div>
              ))}
            </div>
            {productionCase && (
              <div className="border-b border-white/30 py-6">
                <p className="text-sm font-bold text-[#E7FF42]">Реальный регулярный заказ · {productionCase.qty}</p>
                <h3 className="new-home-display mt-3 text-[28px] leading-tight">{productionCase.title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/75">{productionCase.task}</p>
                <p className="mt-3 text-sm font-semibold leading-6">{productionCase.result}</p>
                <Link href="/cases" className="mt-5 inline-flex min-h-11 items-center gap-3 text-sm font-bold underline decoration-[#E7FF42] decoration-2 underline-offset-4 hover:text-[#E7FF42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7FF42]">Все кейсы <span aria-hidden="true">→</span></Link>
              </div>
            )}
            <div className="mt-auto border-b border-t border-white/30 py-5 text-base leading-7"><strong>Для ИП и ООО:</strong> договор, счёт и закрывающие документы. Работаем без НДС.</div>
            <Link href="/b2b" className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 self-start bg-[#E7FF42] px-6 text-sm font-bold text-[#0D2A80] hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:translate-y-0 active:scale-[0.98]">Подробнее для бизнеса <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>
    </section>
  )
}
