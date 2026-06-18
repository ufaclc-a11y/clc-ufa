import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cases }        from '@/data/cases'
import { business }     from '@/data/contacts'
import { Breadcrumbs }  from '@/components/Breadcrumbs'
import { CTASection }   from '@/components/CTASection'
import { JsonLd }       from '@/components/JsonLd'

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
      image:       `https://clc-ufa.ru${c.image}`,
      description: c.task,
    },
  })),
}

export const metadata: Metadata = {
  title:       'Кейсы и примеры работ с ценами | Центр лазерной резки Уфа',
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
    <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#2D2D2D]">
      {/* Photo */}
      <Image
        src={c.image}
        alt={c.imageAlt}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* Strong gradient from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      {/* Top: category badge */}
      <div className="absolute top-3 left-3">
        <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${catCls}`}>
          {c.category}
        </span>
      </div>

      {/* Bottom: all info */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        {/* Client */}
        <p className="text-[10px] text-white/45 mb-1 font-mono uppercase tracking-wider">{c.client}</p>

        {/* Title */}
        <h2 className="font-display text-lg text-white tracking-wide leading-snug mb-3">
          {c.title}
        </h2>

        {/* Stats row */}
        <div className="flex gap-3 mb-3">
          {[
            { label: 'Кол-во', value: c.qty      },
            { label: 'Срок',   value: c.deadline  },
            { label: 'Цена',   value: c.price     },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/10">
              <div className="text-[9px] text-white/45 uppercase tracking-wider mb-0.5">{s.label}</div>
              <div className="text-xs font-semibold text-white leading-tight">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Task */}
        <p className="text-xs text-white/55 leading-relaxed line-clamp-2 mb-2">{c.task}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {c.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
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
