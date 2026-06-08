import type { Metadata } from 'next'
import Link from 'next/link'
import { services }          from '@/data/services'
import { products }          from '@/data/products'
import { ServiceCard }       from '@/components/ServiceCard'
import { ContactButtons }    from '@/components/ContactButtons'
import { B2BSection }        from '@/components/B2BSection'
import { ProcessSteps }      from '@/components/ProcessSteps'
import { PortfolioGrid }     from '@/components/PortfolioGrid'
import { OrderForm }         from '@/components/OrderForm'
import { CTASection }        from '@/components/CTASection'
import { LaserBackground }   from '@/components/LaserBackground'
import { ReviewsSection }    from '@/components/ReviewsSection'
import { FAQAccordion }      from '@/components/FAQAccordion'
import { blogPosts }         from '@/data/blog'
import Image                 from 'next/image'
import { SymbolIcon }        from '@/components/Icons'

export const metadata: Metadata = {
  title:       'Центр лазерной резки — Лазерная резка, УФ-печать и фрезеровка ЧПУ в Уфе',
  description: 'Изготавливаем изделия и детали по вашему макету: лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ в Уфе. От одной штуки до партии.',
  keywords:    ['лазерная резка уфа', 'центр лазерной резки уфа', 'уф печать уфа', 'гравировка уфа', 'фрезеровка чпу уфа', 'изготовление изделий уфа', 'лазерная резка на заказ уфа', 'резка акрила уфа', 'резка фанеры уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru' },
}

const whatWeMake = [
  'Медали и награды',        'Таблички и шильдики',
  'Вывески и короба',        'Детали для производств',
  'Сувениры и брелоки',      'Заготовки для творчества',
  'Интерьерный декор',       'POS-материалы',
  'Хештеги и фотозоны',      'Бейджи и номерки',
  'Трафареты',               'Элементы мебели',
  'Ключницы и органайзеры',  'Медальницы и шкатулки',
  'Менюхолдеры и тейбл-тенты', 'Часы настенные',
]

const advantages = [
  { icon: '✦', title: 'Можно без макета',            desc: 'Опишите задачу словами или пришлите фото — разберёмся и сделаем.' },
  { icon: '⚡', title: '4 технологии в одном месте',  desc: 'Резка, печать, гравировка, фрезеровка — не нужно искать разных подрядчиков.' },
  { icon: '◎', title: 'От одной штуки до партии',    desc: 'Нет минимального тиража. Работаем с единичными заказами и сериями.' },
  { icon: '↗', title: 'Ведём в мессенджере',          desc: 'Обсуждаем детали, согласовываем макет, сообщаем о готовности — быстро и удобно.' },
  { icon: '▣', title: 'Быстрая гравировка партий',     desc: 'Только у нас в городе. Гравируем большие объёмы в разы быстрее обычного лазера.' },
  { icon: '◈', title: 'Срочно — от 1 часа',           desc: 'Небольшой заказ выполним за час. Стандартный — 1–3 дня. Скажем честно.' },
]

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen bg-black flex flex-col justify-end pb-20 pt-32 overflow-hidden">
        {/* Анимированный лазерный фон */}
        <LaserBackground />

        {/* Тонкий оранжевый акцент снизу-слева поверх лазера */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              'radial-gradient(ellipse 60% 40% at 10% 90%, rgba(255,107,0,0.07) 0%, transparent 60%)',
              'radial-gradient(ellipse 40% 30% at 90% 10%, rgba(255,107,0,0.04) 0%, transparent 55%)',
            ].join(', '),
          }}
        />

        {/* SVG-зернистость */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.45]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-4xl">
            {/* Метка */}
            <div className="inline-flex items-center gap-3 mb-8 animate-fade-in">
              <span className="w-8 h-px bg-[#FF6B00]" />
              <span className="font-mono text-xs text-[#FF6B00] tracking-[0.2em] uppercase">
                Уфа · Воплощаем идеи
              </span>
            </div>

            {/* Заголовок */}
            <h1 className="font-display text-[clamp(48px,8vw,96px)] text-white tracking-wider leading-[0.95] mb-8 animate-fade-up">
              Лазерная резка,{' '}
              <span className="text-gradient">УФ-печать</span>
              <br />и фрезеровка ЧПУ
              <br />в Уфе
            </h1>

            <p className="text-[clamp(16px,2vw,20px)] text-white/55 max-w-2xl leading-relaxed mb-10 animate-fade-up delay-100">
              Изготавливаем изделия, детали и заготовки по вашему макету — от одной штуки до партии. Фанера, акрил, ПВХ, МДФ, дерево, металл, кожа, стекло и другие материалы.
            </p>

            <div className="animate-fade-up delay-200">
              <ContactButtons size="lg" variant="light" />
            </div>

            {/* Цифры */}
            <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 sm:gap-16 animate-fade-up delay-300">
              {[
                { n: '4',    sub: 'технологии в одном месте' },
                { n: '1–3',  sub: 'дня — стандартный срок'   },
                { n: '1 ч',  sub: 'срочный небольшой заказ'  },
              ].map(s => (
                <div key={s.n}>
                  <div className="font-display text-3xl sm:text-4xl text-[#FF6B00] tracking-wider leading-none">
                    {s.n}
                  </div>
                  <div className="text-xs sm:text-sm text-white/35 mt-1 leading-tight">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── УСЛУГИ ─── */}
      <section className="py-20 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Технологии</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
              Наши услуги
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>

      {/* ─── ЧТО ДЕЛАЕМ ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Изделия</span>
              <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
                Что можем изготовить
              </h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4 shrink-0">
              Полный каталог →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.slice(0, 25).map(p => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group relative aspect-square rounded-2xl overflow-hidden block bg-[#2D2D2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="text-xs font-semibold text-white group-hover:text-[#FF6B00] transition-colors leading-snug">
                    {p.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── B2B ─── */}
      <B2BSection />

      {/* ─── ПОРТФОЛИО ─── */}
      <section className="py-20 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Портфолио</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
              Наши работы
            </h2>
          </div>
          <PortfolioGrid limit={8} showFilter={false} />
          <div className="mt-8 text-center">
            <Link href="/portfolio" className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4">
              Смотреть все работы →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── БЛОГ ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Блог</span>
              <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
                Советы и статьи
              </h2>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4 shrink-0">
              Все статьи →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {blogPosts.slice(0, 3).map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group relative aspect-[16/10] rounded-2xl overflow-hidden block bg-[#2D2D2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                <span className="absolute top-3 left-3 text-xs font-semibold bg-[#FF6B00] text-white px-2.5 py-1 rounded-full">
                  {post.category}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="text-[10px] text-white/45 font-mono mb-1.5">{post.readTime} мин чтения</div>
                  <h3 className="font-display text-base text-white tracking-wide leading-snug group-hover:text-[#FF6B00] transition-colors duration-200">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── КАК ВСЁРАБОТАЕТ ─── */}
      <ProcessSteps />

      {/* ─── ПОЧЕМУ УДОБНО ─── */}
      <section className="py-20 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Преимущества</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
              Почему удобно с нами
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {advantages.map((a, i) => (
              <div
                key={a.title}
                className="bg-white rounded-2xl p-6 border border-[#E8E6E0] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(255,107,0,0.08),0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center mb-4">
                  <SymbolIcon symbol={a.icon} size={20} className="text-[#FF6B00]" />
                </div>
                <h3 className="font-display text-lg text-[#1A1A1A] tracking-wide mb-2">{a.title}</h3>
                <p className="text-sm text-[#8A8680] leading-[1.7]">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ОТЗЫВЫ ─── */}
      <ReviewsSection />

      {/* ─── FAQ ─── */}
      <section className="py-20 bg-[#F5F4F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Вопросы</span>
              <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
                Часто спрашивают
              </h2>
            </div>
            <Link href="/faq" className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4 shrink-0">
              Все вопросы →
            </Link>
          </div>
          <FAQAccordion limit={6} />
        </div>
      </section>

      {/* ─── ФОРМА РАСЧЁТА ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <OrderForm />
        </div>
      </section>

      <CTASection dark />
    </>
  )
}
