import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { business }     from '@/data/contacts'
import { Breadcrumbs }  from '@/components/Breadcrumbs'
import { CTASection }   from '@/components/CTASection'
import { JsonLd }       from '@/components/JsonLd'
import { publicCases as cases } from '@/lib/public-cases'

const casesLd = {
  '@context': 'https://schema.org',
  '@type':    'ItemList',
  name:        'Кейсы — Центр лазерной резки',
  itemListElement: cases.map((c, i) => ({
    '@type':   'ListItem',
    position:  i + 1,
    item: {
      '@type':     'CreativeWork',
      name:        c.title,
      url:         `https://clc-ufa.ru/cases/${c.id}`,
      image:       `https://clc-ufa.ru${c.image}`,
      description: c.task,
    },
  })),
}

export const metadata: Metadata = {
  title:       'Кейсы и примеры работ с ценами в Уфе',
  description: 'Реальные кейсы: медали для турниров, таблички для офисов, корпоративные награды, детали для производств. Цены, сроки, материалы.',
  keywords:    ['кейсы лазерная резка уфа', 'примеры работ гравировка уфа', 'медали на заказ уфа', 'таблички для офиса уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/cases' },
}

const categoryColors: Record<string, string> = {
  'Спорт':                 'bg-[#059669]',
  'Офис':                  'bg-[#2563EB]',
  'Корпоративные подарки': 'bg-[#7C3AED]',
  'Интерьер':              'bg-[#D97706]',
  'B2B':                   'bg-[#1A1A1A]',
  'Мероприятия':           'bg-[#DC2626]',
}

function CaseCard({ c }: { c: (typeof cases)[number] }) {
  const catCls = categoryColors[c.category] ?? 'bg-[#FF6B00]'
  return (
    <Link
      href={`/cases/${c.id}`}
      aria-label={`Открыть кейс: ${c.title}`}
      className="group block min-w-0 cursor-pointer overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(31,28,24,0.08)] transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(31,28,24,0.14)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-4"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#D4D5D5]">
        <Image
          src={c.image}
          alt={c.imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
          sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) 50vw, 400px"
        />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,0.16)] ${catCls}`}>
          {c.category}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6E6A64]">
          {c.client}
        </p>
        <h2 className="font-display text-2xl leading-tight text-[#1A1A1A] transition-colors duration-200 group-hover:text-[#C94700]">
          {c.title}
        </h2>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-[#E8E6E0] border-y border-[#E8E6E0] py-3">
          {[
            { label: 'Количество', value: c.qty },
            { label: 'Срок', value: c.deadline },
            { label: 'Цена', value: c.price },
          ].map(item => (
            <div key={item.label} className="min-w-0 px-2 first:pl-0 last:pr-0">
              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#77736C]">{item.label}</dt>
              <dd className="mt-1 break-words text-sm font-semibold leading-snug text-[#2D2D2D]">{item.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 line-clamp-3 text-base leading-relaxed text-[#5F5B55]">{c.task}</p>

        <span className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#9D3900] underline decoration-[#D8A684] underline-offset-4 transition-colors duration-200 group-hover:text-[#7D2E00] group-hover:decoration-[#7D2E00]">
          Смотреть кейс
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

export default function CasesPage() {
  return (
    <>
      <JsonLd data={casesLd} />
      <div className="relative min-h-[420px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        <div className="absolute inset-0">
          <Image
            src="/images/portfolio/nagradnye-statuetki-005.jpg"
            alt="Кейсы — реальные заказы Центра лазерной резки"
            fill priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/95 via-[#1A1A1A]/70 to-[#1A1A1A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-14 w-full">
          <Breadcrumbs items={[{ label: 'Кейсы' }]} darkMode />
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Кейсы</span>
          <h1 className="font-display text-5xl sm:text-6xl text-white tracking-wider mt-2 mb-4 leading-[1]">
            Реальные заказы<br />с ценами
          </h1>
          <p className="text-white/55 text-lg max-w-xl leading-relaxed">
            Конкретные задачи, решения, сроки и стоимость. Без воды — только факты.
          </p>
        </div>
      </div>

      <section className="py-16 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cases.map(c => <CaseCard key={c.id} c={c} />)}
          </div>

          {/* CTA */}
          <div className="mt-14 bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] rounded-3xl px-8 py-12 sm:px-16 text-center">
            <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wider mb-3">
              Нужен похожий заказ?
            </h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              Расскажите задачу — рассчитаем стоимость и назовём точный срок. Обычно отвечаем за несколько минут.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {[
                { href: `${business.whatsapp.split('?')[0]}?text=${encodeURIComponent('Здравствуйте! Видел ваши кейсы, хочу рассчитать похожий заказ.')}`, label: 'WhatsApp',        cls: 'bg-[#25D366] hover:bg-[#1fb855]' },
                { href: `${business.telegram}?text=${encodeURIComponent('Здравствуйте! Видел ваши кейсы, хочу рассчитать похожий заказ.')}`, label: 'Telegram', cls: 'bg-[#2AABEE] hover:bg-[#1a9adc]' },
                { href: business.max,  label: 'MAX',              cls: 'bg-gradient-to-r from-[#2B7FFF] to-[#9B3FE8] hover:brightness-110' },
                { href: `mailto:${business.email}?subject=${encodeURIComponent('Запрос расчёта')}`, label: 'Написать на почту', cls: 'bg-white/15 hover:bg-white/25' },
              ].map(b => (
                <a key={b.label} href={b.href} target={b.href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer"
                  className={`text-white font-semibold px-6 py-3 rounded-full transition-[background-color,filter] ${b.cls}`}>
                  {b.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection dark />
    </>
  )
}
