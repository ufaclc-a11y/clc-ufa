import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumbs }   from '@/components/Breadcrumbs'
import { OrderForm }     from '@/components/OrderForm'
import { CTASection }    from '@/components/CTASection'
import { IconCheck, IconBolt, IconTarget, IconMessageSquare, IconRefresh, IconLayers } from '@/components/Icons'
import { business } from '@/data/contacts'

export const metadata: Metadata = {
  title:       'Производство деталей для бизнеса в Уфе | Центр лазерной резки',
  description: 'Лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ для производителей, агентств, дизайнеров и мастерских в Уфе. Работаем по макетам и чертежам.',
  keywords:    ['лазерная резка для производства уфа', 'фрезеровка для бизнеса уфа', 'производство деталей уфа', 'б2б лазерная резка уфа', 'изготовление партиями уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/b2b' },
}

const stats = [
  { value: '5+',   label: 'лет на рынке'           },
  { value: '4',    label: 'технологии в одном месте'},
  { value: 'от 1', label: 'штуки — без минималки'  },
  { value: '1–3',  label: 'дня — стандартный срок'  },
]

const clients = [
  {
    title: 'Заводы и производства',
    desc:  'Детали и элементы для встраивания в собственные изделия. Работаем по чертежам DXF, STEP, CDR.',
    img:   '/images/services/lazernaya-rezka.jpg',
    alt:   'Лазерная резка деталей для производства',
  },
  {
    title: 'Рекламные агентства',
    desc:  'POS-материалы, таблички, шильдики, элементы оформления и навигации точек продаж.',
    img:   '/images/products/tablichka-akril-shildik.jpg',
    alt:   'Таблички и шильдики для агентств',
  },
  {
    title: 'Ивент-агентства',
    desc:  'Медали, награды, декор мероприятий, фотозоны, именные изделия под мероприятие.',
    img:   '/images/products/medali-akril-fanera.jpg',
    alt:   'Медали и награды для мероприятий',
  },
  {
    title: 'Дизайнеры и мастерские',
    desc:  'Заготовки, элементы изделий, комплектующие для дальнейшей сборки и отделки.',
    img:   '/images/products/inter-er-dekor-fanera.jpg',
    alt:   'Заготовки из фанеры для дизайнеров',
  },
  {
    title: 'Мебельщики',
    desc:  'Декоративные фасады, резные вставки, элементы из МДФ и фанеры по вашим эскизам.',
    img:   '/images/products/b2b-detali-proizvodstvo.jpg',
    alt:   'Декоративные фасады и элементы из МДФ для мебельщиков',
  },
  {
    title: 'Производители сувениров',
    desc:  'Заготовки, бланки, детали под дальнейшую гравировку, печать или отделку.',
    img:   '/images/products/suveniры-gravировka.jpg',
    alt:   'Заготовки и сувениры с гравировкой',
  },
]

const technologies = [
  {
    title: 'Лазерная резка',
    desc:  'Фанера, акрил, МДФ, ПВХ, кожа, картон. Точность ±0,1 мм. Сложные контуры без доп. обработки.',
    img:   '/images/services/lazernaya-rezka.jpg',
    alt:   'Лазерная резка для бизнеса',
    href:  '/services/lazernaya-rezka',
  },
  {
    title: 'УФ-печать',
    desc:  'Брендирование деталей, POS-материалы, фотопечать на акриле, дереве, металле, пластике.',
    img:   '/images/services/uf-pechat.jpg',
    alt:   'УФ-печать для бизнеса',
    href:  '/services/uf-pechat',
  },
  {
    title: 'Гравировка',
    desc:  'Металл, дерево, кожа. Персонализация партий, нанесение логотипов, серийных номеров, QR-кодов.',
    img:   '/images/services/gravirovka-na-metalle.jpg',
    alt:   'Гравировка для бизнеса',
    href:  '/services/gravirovka-na-metalle',
  },
  {
    title: 'Фрезеровка ЧПУ',
    desc:  'Крупные детали, рельефные изделия, 3D-обработка. МДФ, фанера, пластик, пенопласт, лёгкие металлы.',
    img:   '/images/services/frezernaya-rezka-chpu.jpg',
    alt:   'Фрезеровка ЧПУ для производства',
    href:  '/services/frezernaya-rezka-chpu',
  },
]

const advantages = [
  { Icon: IconCheck,        title: 'Без минималки',       desc: 'Берёмся за единичные заказы и малые партии. Не нужно ждать накопления тиража.' },
  { Icon: IconBolt,         title: 'Быстро',              desc: 'Стандартный заказ — 1–3 дня. Срочные — от 1 часа. Скажем честный срок сразу.' },
  { Icon: IconLayers,       title: '4 технологии',        desc: 'Резка, печать, гравировка, фрезеровка в одном месте. Один подрядчик — меньше согласований.' },
  { Icon: IconTarget,       title: 'По вашим чертежам',   desc: 'Принимаем DXF, AI, CDR, STEP, PDF. Если нет чертежа — поможем сделать по образцу или фото.' },
  { Icon: IconRefresh,      title: 'Повторные заказы',    desc: 'Сохраняем макеты. Повторить партию — одно сообщение с указанием количества.' },
  { Icon: IconMessageSquare,title: 'Без бюрократии',      desc: 'Работаем в мессенджере. Быстро согласуем, считаем и подтверждаем — без долгих переписок.' },
]

const process = [
  { n: '01', title: 'Отправьте макет',     desc: 'Файл или фото детали в WhatsApp, Telegram или на почту.' },
  { n: '02', title: 'Получите расчёт',     desc: 'Считаем стоимость и срок. Ответим быстро, без долгих согласований.' },
  { n: '03', title: 'Подтвердите заказ',   desc: 'Согласуем детали, принимаем предоплату и запускаем производство.' },
  { n: '04', title: 'Заберите готовое',    desc: 'Самовывоз из нашего цеха или доставка. Сообщим, когда будет готово.' },
]

const msgText = encodeURIComponent('Здравствуйте! Хочу разместить B2B-заказ. Подскажите условия и сроки.')

export default function B2BPage() {
  return (
    <>
      {/* ── HERO ── */}
      <div className="relative min-h-[600px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        {/* Фото */}
        <div className="absolute inset-0">
          <Image
            src="/images/products/b2b-detali-proizvodstvo.jpg"
            alt="Производство деталей для бизнеса"
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-20 w-full">
          <Breadcrumbs items={[{ label: 'Для бизнеса' }]} darkMode />

          <div className="max-w-2xl">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">B2B</span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white tracking-wider mt-3 mb-6 leading-[0.95]">
              Производство деталей и заготовок для бизнеса
            </h1>
            <p className="text-xl text-white/60 leading-relaxed mb-8">
              Лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ для производителей,
              агентств, дизайнеров и мастерских в Уфе.
            </p>
            <div className="flex flex-wrap gap-3">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/79374838003?text=${msgText}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3.5 rounded-full hover:bg-[#1da857] transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.3)]"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.525 5.848L.057 23.944l6.244-1.637A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.359-.213-3.706.972.988-3.612-.234-.37A9.818 9.818 0 1112 21.818z"/></svg>
                WhatsApp
              </a>
              {/* Telegram */}
              <a
                href={`https://t.me/clcufa?text=${msgText}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#2AABEE] text-white font-semibold px-6 py-3.5 rounded-full hover:bg-[#1a9adc] transition-colors"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
              </a>
              {/* MAX */}
              <a
                href={`${business.max}?text=${msgText}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2B7FFF] to-[#9B3FE8] text-white font-semibold px-6 py-3.5 rounded-full hover:brightness-110 transition-[filter] duration-200"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 3a9 9 0 1 0 4.243 16.93l3.328.99-.99-3.328A9 9 0 0 0 12 3zm0 2a7 7 0 0 1 3.53 13.07l.47 1.578-1.578-.47A7 7 0 1 1 12 5z" fill="currentColor"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>
                MAX
              </a>
              {/* Почта */}
              <a
                href={`mailto:${business.email}?subject=${encodeURIComponent('B2B-заказ')}&body=${encodeURIComponent('Здравствуйте!\n\nХочу разместить заказ. Опишите условия.\n\nКомпания: \nЧто нужно: \nКоличество: \nСрок: ')}`}
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/15 border border-white/15 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Написать на почту
              </a>
              {/* Позвонить */}
              <a
                href={`tel:${business.phone}`}
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/15 border border-white/15 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                Позвонить
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── СТАТЫ ── */}
      <div className="bg-[#FF6B00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/20">
            {stats.map(s => (
              <div key={s.label} className="py-8 px-6 text-center">
                <div className="font-display text-4xl sm:text-5xl text-white tracking-wider leading-none mb-1">
                  {s.value}
                </div>
                <div className="text-sm text-white/75 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ДЛЯ КОГО ── */}
      <section className="py-20 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Кому подходит</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
              Для кого работаем
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clients.map(c => (
              <div
                key={c.title}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E8E6E0] hover:border-[#FF6B00]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-[border-color,box-shadow] duration-300"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[#2D2D2D]">
                  <Image
                    src={c.img}
                    alt={c.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-[#1A1A1A] tracking-wide mb-2 group-hover:text-[#FF6B00] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-sm text-[#8A8680] leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ТЕХНОЛОГИИ ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Что делаем</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
              4 технологии — один подрядчик
            </h2>
            <p className="mt-4 text-[#8A8680] max-w-2xl leading-relaxed">
              Не нужно искать отдельных исполнителей под каждую задачу. Резку, печать, гравировку и фрезеровку
              выполняем на собственном оборудовании в одном цехе.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {technologies.map(t => (
              <Link
                key={t.title}
                href={t.href}
                className="group bg-[#F5F4F0] rounded-2xl overflow-hidden border border-[#E8E6E0] hover:border-[#FF6B00]/40 hover:shadow-[0_8px_32px_rgba(255,107,0,0.08)] transition-[border-color,box-shadow] duration-300 block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#2D2D2D]">
                  <Image
                    src={t.img}
                    alt={t.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-[#1A1A1A] tracking-wide mb-2 group-hover:text-[#FF6B00] transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-[#8A8680] leading-relaxed">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ПРЕИМУЩЕСТВА ── */}
      <section className="py-20 bg-[#1A1A1A] relative overflow-hidden">
        {/* Фоновое фото */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/services/izgotovlenie-izdelij.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/80 to-[#1A1A1A]/95" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Преимущества</span>
            <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wider mt-2">
              Почему удобно с нами
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {advantages.map((a) => (
              <div
                key={a.title}
                className="bg-white/5 border border-white/8 rounded-2xl p-6 hover:bg-white/8 hover:border-[#FF6B00]/20 transition-[background-color,border-color] duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 flex items-center justify-center mb-4">
                  <a.Icon size={20} className="text-[#FF6B00]" />
                </div>
                <h3 className="font-display text-lg text-white tracking-wide mb-2">{a.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── КАК РАБОТАЕМ ── */}
      <section className="py-20 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Текст */}
            <div>
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Процесс</span>
              <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2 mb-10">
                Как проходит работа
              </h2>
              <div className="space-y-6">
                {process.map((p, i) => (
                  <div key={p.n} className="flex items-start gap-5">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-white border border-[#E8E6E0] flex items-center justify-center shadow-sm">
                      <span className="font-mono text-xs text-[#FF6B00] font-semibold">{p.n}</span>
                    </div>
                    <div className="pt-2">
                      <h3 className="font-semibold text-[#1A1A1A] mb-1">{p.title}</h3>
                      <p className="text-sm text-[#8A8680] leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Фото */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#2D2D2D] shadow-[0_24px_64px_rgba(0,0,0,0.15)]">
                <Image
                  src="/images/services/lazernaya-rezka.jpg"
                  alt="Процесс лазерной резки для бизнеса"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              {/* Плашка */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E8E6E0]">
                <div className="font-display text-3xl text-[#FF6B00] tracking-wider leading-none mb-0.5">1–3</div>
                <div className="text-xs text-[#8A8680] font-medium">дня — стандартный срок</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ФОРМА ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Заявка</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2 mb-3">
              Отправьте макет или фото детали
            </h2>
            <p className="text-[#8A8680] text-lg">
              Рассчитаем изготовление и ответим быстро.
            </p>
          </div>
          <OrderForm />
        </div>
      </section>

      <CTASection dark />
    </>
  )
}
