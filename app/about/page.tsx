import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ContactButtons } from '@/components/ContactButtons'
import { Breadcrumbs }   from '@/components/Breadcrumbs'
import { CTASection }    from '@/components/CTASection'
import { SymbolIcon }    from '@/components/Icons'
import { GalleryGrid }   from '@/components/GalleryGrid'
import { JsonLd }        from '@/components/JsonLd'
import { business }      from '@/data/contacts'
import { sameAs }        from '@/lib/seo'

const orgLd = {
  '@context': 'https://schema.org',
  '@type':    'Organization',
  '@id':       'https://clc-ufa.ru/#business',
  name:        business.name,
  alternateName: business.brand,
  url:         'https://clc-ufa.ru',
  logo:        'https://clc-ufa.ru/icon-512.png',
  legalName:   business.requisites.ip,
  taxID:       business.requisites.inn,
  telephone:   business.phone,
  email:       business.email,
  founder:     { '@type': 'Person', name: business.founder.name, jobTitle: business.founder.role },
  address:     {
    '@type':         'PostalAddress',
    streetAddress:   'ул. Менделеева, 177, 5 этаж, цех 509',
    addressLocality: 'Уфа',
    addressRegion:   'Республика Башкортостан',
    addressCountry:  'RU',
  },
  sameAs,
}

export const metadata: Metadata = {
  title:       'О нас — Центр лазерной резки, производство в Уфе',
  description: 'Центр лазерной резки Центр лазерной резки в Уфе. Небольшое производство с 4 технологиями на борту: резка, УФ-печать, гравировка, фрезеровка. Работаем с 2018 года.',
  keywords:    ['центр лазерной резки уфа', 'лазерное производство уфа', 'лазерный цех уфа', 'о нас лазерная резка уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/about' },
}

const stats = [
  { n: '7+',   label: 'лет в Уфе'              },
  { n: '4',    label: 'технологии в одном месте'},
  { n: '1 ч',  label: 'минимальный срок'       },
  { n: '∞',    label: 'без минимального тиража' },
]

const equipment = [
  {
    name:  'Лазерный станок CO₂',
    desc:  'Точная резка и гравировка по фанере, акрилу, МДФ, ПВХ, коже, картону и другим листовым материалам.',
    image: '/images/old-site/laser-main-03.JPG',
  },
  {
    name:  'УФ-принтер',
    desc:  'Полноцветная печать прямо на твёрдых поверхностях: акрил, дерево, металл, стекло, кожа. Рабочая зона 60 × 90 см.',
    image: '/images/old-site/uv-main-09.jpg',
  },
  {
    name:  'Фрезерный станок ЧПУ',
    desc:  'Фрезеровка крупных деталей, рекламных конструкций, мебельных фасадов и 3D-обработки.',
    image: '/images/old-site/frez-main-09.jpeg',
  },
  {
    name:  'Маркиратор',
    desc:  'Гравировка на металле: жетоны, медали, кружки, ножи, термосы. Только у нас в Уфе — маркиратор по дереву для больших объёмов.',
    image: '/images/old-site/grav-metal-main-07.jpg',
  },
]

const values = [
  {
    icon:  '✦',
    title: 'Честность',
    desc:  'Назовём реальный срок и цену — не занизим, чтобы взять заказ. Если что-то не получится — скажем до, а не после.',
  },
  {
    icon:  '◎',
    title: 'Гибкость',
    desc:  'Один экземпляр или тысяча — без разницы. Помогаем тем, у кого нет макета. Принимаем материал заказчика.',
  },
  {
    icon:  '⚡',
    title: 'Скорость',
    desc:  'Маленький заказ готов за час. Не держим очередь ради видимости. Срочные заказы — отдельный приоритет.',
  },
  {
    icon:  '↗',
    title: 'Коммуникация',
    desc:  'Работаем в мессенджере — быстро, без долгих согласований по почте. Сообщаем, когда заказ готов.',
  },
]

export default function AboutPage() {
  return (
    <>
      <JsonLd data={orgLd} />
      {/* Hero */}
      <div className="relative min-h-[540px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        <div className="absolute inset-0">
          <Image
            src="/images/old-site/about-01.jpg"
            alt="Центр лазерной резки — цех в Уфе"
            fill priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/95 via-[#1A1A1A]/60 to-[#1A1A1A]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 w-full">
          <Breadcrumbs items={[{ label: 'О нас' }]} darkMode />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
            <div>
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">О нас</span>
              <h1 className="font-display text-[clamp(40px,6vw,72px)] text-white tracking-wider leading-[1] mt-2 mb-6">
                Небольшое<br />производство<br />в <span className="text-[#FF6B00]">Уфе</span>
              </h1>
              <p className="text-white/55 text-lg leading-[1.75] mb-8 max-w-lg">
                Мы — Центр лазерной резки. Работаем в Уфе с 2018 года. Делаем изделия, детали и заготовки по вашему макету: от одной штуки до больших партий.
              </p>
              <ContactButtons size="lg" variant="dark" />
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map(s => (
                <div key={s.n} className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-[#FF6B00]/30 transition-colors">
                  <div className="font-display text-5xl text-[#FF6B00] tracking-wider leading-none mb-2">{s.n}</div>
                  <div className="text-sm text-white/40 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#2D2D2D]">
              <Image
                src="/images/old-site/izd-main-06.jpeg"
                alt="Изделия Центр лазерной резки — ключницы, органайзеры, часы"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <div>
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">История</span>
              <h2 className="font-display text-4xl text-[#1A1A1A] tracking-wider mt-2 mb-6">
                Как мы появились
              </h2>
              <div className="space-y-4 text-[#2D2D2D] leading-[1.75]">
                <p>
                  Начинали с одного лазерного станка и нескольких видов материалов. Постепенно расширялись — добавили УФ-принтер, фрезерный станок, маркиратор по дереву. Сегодня у нас четыре технологии в одном цехе на 5-м этаже ТЦ «Чайка».
                </p>
                <p>
                  Не строим монстр-холдинг. Мы небольшая команда, которая знает своих клиентов в лицо, берёт трубку и отвечает в мессенджере — а не прячется за менеджеров и скрипты.
                </p>
                <p>
                  За эти годы сделали тысячи заказов: медали для спортивных клубов, таблички для офисов, детали для производств, подарки с гравировкой, рекламные вывески. Каждый раз — по-настоящему.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="py-20 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Оборудование</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
              4 технологии в одном месте
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {equipment.map(eq => (
              <div key={eq.name} className="bg-white rounded-2xl overflow-hidden border border-[#E8E6E0] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow group">
                <div className="relative h-52 bg-[#2D2D2D] overflow-hidden">
                  <Image
                    src={eq.image}
                    alt={eq.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <h3 className="absolute bottom-4 left-5 font-display text-xl text-white tracking-wide drop-shadow">
                    {eq.name}
                  </h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-[#6E6A64] leading-[1.7]">{eq.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Принципы</span>
            <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wider mt-2">
              Как мы работаем
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(v => (
              <div
                key={v.title}
                className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#FF6B00]/30 hover:bg-white/[0.07] transition-[border-color,background-color] duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 flex items-center justify-center mb-4">
                  <SymbolIcon symbol={v.icon} size={20} className="text-[#FF6B00]" />
                </div>
                <h3 className="font-display text-lg text-white tracking-wide mb-2">{v.title}</h3>
                <p className="text-sm text-white/40 leading-[1.7]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Примеры работ</span>
              <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
                Что мы делаем
              </h2>
            </div>
            <Link href="/portfolio" className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4">
              Всё портфолио →
            </Link>
          </div>

          {/* Photo grid with lightbox */}
          <GalleryGrid
            gridClass="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            items={[
              { src: '/images/old-site/uv-medali-15.jpg',             alt: 'Медали с УФ-печатью' },
              { src: '/images/old-site/laser-statuetki-06.jpeg',      alt: 'Наградные статуэтки' },
              { src: '/images/old-site/izd-chasy-02.jpeg',            alt: 'Настенные часы' },
              { src: '/images/old-site/izd-organajzery-02.jpeg',      alt: 'Органайзеры' },
              { src: '/images/old-site/laser-shkatulki-03.jpg',       alt: 'Шкатулки из фанеры' },
              { src: '/images/old-site/grav-wood-menazhnica-01.jpeg', alt: 'Менажницы' },
              { src: '/images/old-site/uv-dtf-02.jpg',                alt: 'UV DTF наклейки' },
              { src: '/images/old-site/laser-bejdzhi-01.jpg',         alt: 'Бейджики' },
            ]}
          />
        </div>
      </section>

      <CTASection dark />
    </>
  )
}
