import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CTASection }  from '@/components/CTASection'
import { business }    from '@/data/contacts'

export const metadata: Metadata = {
  title:       'Материалы для лазерной резки в Уфе — фанера, акрил, ПВХ, МДФ | ЦЛР',
  description: 'Фанера, акрил, ПВХ, МДФ, кожа, металл и другие материалы для лазерной резки, гравировки, УФ-печати и фрезеровки в Уфе. Помогаем выбрать нужный под задачу.',
  keywords:    ['материалы для лазерной резки уфа', 'фанера для резки уфа', 'акрил для резки уфа', 'мдф резка уфа', 'кожа лазерная резка уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/materials' },
}

const materials = [
  {
    id:         'fanera',
    name:       'Фанера',
    subtitle:   'Берёзовая, 3–15 мм',
    image:      '/images/portfolio/shkatulki-fanera-001.jpg',
    desc:       'Универсальный материал — лёгкий, тёплый на вид, легко режется и гравируется. Идеален для подарков, декора, заготовок и деталей. В наличии 3, 4, 6, 8, 10, 12, 15 мм.',
    properties: ['Экологичный', 'Лёгкий', 'Хорошо красится', 'Гравируется и режется'],
    tech:       ['Лазерная резка', 'Гравировка', 'УФ-печать', 'Фрезеровка'],
    examples:   'Шкатулки, часы, ключницы, медальницы, органайзеры, копилки, декор',
    href:       '/lazernaya-rezka-fanery-ufa',
  },
  {
    id:         'akril',
    name:       'Акрил / Оргстекло',
    subtitle:   'Цветной, прозрачный, зеркальный',
    image:      '/images/portfolio/medali-001.jpg',
    desc:       'Яркий, прочный, влагостойкий. Доступен в десятках цветов: прозрачный, матовый, зеркальный, флуоресцентный. Отлично смотрится с подсветкой. Рез — чистый, без механической обработки.',
    properties: ['Влагостойкий', 'Яркие цвета', 'Прозрачный / зеркальный', 'Гигиеничный'],
    tech:       ['Лазерная резка', 'УФ-печать', 'Гравировка', 'Фрезеровка'],
    examples:   'Медали, таблички, бейджи, вывески, наградные статуэтки, менюхолдеры',
    href:       '/lazernaya-rezka-akrila-ufa',
  },
  {
    id:         'pvh',
    name:       'ПВХ',
    subtitle:   'Листовой, 1–10 мм',
    image:      '/images/products/vyveski-pvh-kompozit.jpg',
    desc:       'Лёгкий пластик для вывесок, шаблонов, трафаретов и POS-материалов. Влагостойкий, легко красится и оклеивается плёнкой. Хорошо переносит уличные условия.',
    properties: ['Влагостойкий', 'Уличное применение', 'Легко красится', 'Бюджетный'],
    tech:       ['Лазерная резка', 'УФ-печать', 'Фрезеровка'],
    examples:   'Вывески, трафареты, таблички, тейбл тенты, шаблоны',
    href:       '/services/lazernaya-rezka',
  },
  {
    id:         'mdf',
    name:       'МДФ',
    subtitle:   '3–22 мм',
    image:      '/images/portfolio/frezernaya-rezka-003.jpg',
    desc:       'Гладкая поверхность, равномерная плотность — идеален для фрезеровки и покраски. Популярен для мебельных фасадов, панно, 3D-рельефов и рекламных конструкций.',
    properties: ['Гладкая поверхность', 'Равномерная плотность', 'Хорошо красится', 'Под покраску'],
    tech:       ['Фрезеровка', 'Лазерная резка', 'УФ-печать'],
    examples:   'Мебельные фасады, рекламные конструкции, панно, буквы и логотипы',
    href:       '/services/frezernaya-rezka-chpu',
  },
  {
    id:         'kozha',
    name:       'Кожа и экокожа',
    subtitle:   'Натуральная и синтетическая',
    image:      '/images/portfolio/breloki-001.jpg',
    desc:       'Лазерная резка и гравировка кожи даёт аккуратный рез без бахромы. Гравировка — тёмная и стойкая. Используем натуральную и экокожу разной толщины и цвета.',
    properties: ['Аккуратный рез', 'Стойкая гравировка', 'Натуральный материал', 'Премиум вид'],
    tech:       ['Лазерная резка', 'Гравировка', 'УФ-печать'],
    examples:   'Брелоки, обложки, бирки, кошельки, подарочная упаковка',
    href:       '/services/gravirovka-na-nemetalah',
  },
  {
    id:         'metall',
    name:       'Металл',
    subtitle:   'Сталь, алюминий, медь, латунь',
    image:      '/images/portfolio/gravirovka-001.jpg',
    desc:       'Гравировка маркиратором на металлических изделиях: термосы, кружки, ножи, жетоны, медали, адресники. Глубокая, стойкая гравировка — не стирается и не выцветает.',
    properties: ['Стойкая гравировка', 'Глубокий рез', 'Долговечность', 'Профессиональный вид'],
    tech:       ['Гравировка (маркиратор)', 'УФ-печать'],
    examples:   'Термосы, кружки, ножи, жетоны, адресники, флаги, корпоративные подарки',
    href:       '/services/gravirovka-na-metalle',
  },
  {
    id:         'abs',
    name:       'АБС пластик',
    subtitle:   'Двухслойный гравировальный',
    image:      '/images/portfolio/tablitchki-001.jpg',
    desc:       'Двухслойный пластик: при гравировке снимается верхний слой, открывая контрастный нижний. Используется для промышленных шильдиков, маркировки оборудования и табличек.',
    properties: ['Контрастная гравировка', 'Прочный', 'Влагостойкий', 'Промышленный'],
    tech:       ['Гравировка', 'Лазерная резка'],
    examples:   'Шильдики, таблички для промышленности, маркировка оборудования',
    href:       '/services/izgotovlenie-izdelij',
  },
  {
    id:         'kompozit',
    name:       'Алюминиевый композит',
    subtitle:   'Для вывесок и конструкций',
    image:      '/images/portfolio/vyveski-001.jpg',
    desc:       'Лёгкий и прочный материал для наружных вывесок, рекламных конструкций и фасадных панелей. Легко фрезеруется, стойкий к деформациям, выдерживает уличные условия.',
    properties: ['Лёгкий', 'Прочный', 'Уличный', 'Долговечный'],
    tech:       ['Фрезеровка', 'УФ-печать'],
    examples:   'Наружные вывески, рекламные конструкции, фасадные панели',
    href:       '/services/frezernaya-rezka-chpu',
  },
]

export default function MaterialsPage() {
  const calcText = encodeURIComponent('Здравствуйте! Помогите выбрать материал.')
  return (
    <>
      {/* ── HERO ── */}
      <div className="relative min-h-[420px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        <div className="absolute inset-0">
          <Image
            src="/images/portfolio/zagotovki-001.jpg"
            alt="Материалы для лазерной резки"
            fill priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/95 via-[#1A1A1A]/70 to-[#1A1A1A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-14 w-full">
          <Breadcrumbs items={[{ label: 'Материалы' }]} darkMode />
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Материалы</span>
          <h1 className="font-display text-5xl sm:text-6xl text-white tracking-wider mt-2 mb-4 leading-[1]">
            С чем мы работаем
          </h1>
          <p className="text-white/55 text-lg leading-relaxed max-w-xl">
            Фанера, акрил, ПВХ, МДФ, кожа, металл — в одном цехе. Помогаем выбрать нужный под вашу задачу.
          </p>
        </div>
      </div>

      {/* ── СРАВНИТЕЛЬНАЯ ТАБЛИЦА ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Сравнение</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mt-2">
              Таблица материалов
            </h2>
            <p className="text-[#8A8680] mt-3 max-w-2xl leading-relaxed">
              Краткая сводка: материал, в каком виде он бывает, какими технологиями обрабатываем и для чего подходит. Не уверены в выборе — подскажем бесплатно.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E8E6E0] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <table className="w-full min-w-[820px] text-left border-collapse">
              <caption className="sr-only">
                Сравнение материалов для лазерной резки, гравировки, УФ-печати и фрезеровки в Уфе
              </caption>
              <thead>
                <tr className="bg-[#1A1A1A]">
                  {['Материал', 'Вид / толщина', 'Технологии', 'Подходит для'].map(h => (
                    <th
                      key={h}
                      scope="col"
                      className="font-mono text-[11px] text-white/70 uppercase tracking-wider font-semibold px-5 py-4 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materials.map((mat, i) => (
                  <tr
                    key={mat.id}
                    className={`${i % 2 ? 'bg-[#FAF9F6]' : 'bg-white'} border-t border-[#E8E6E0] hover:bg-[#FF6B00]/[0.04] transition-colors`}
                  >
                    <th scope="row" className="align-top px-5 py-4 font-normal">
                      <Link
                        href={mat.href}
                        className="font-display text-xl text-[#1A1A1A] tracking-wide hover:text-[#FF6B00] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded"
                      >
                        {mat.name}
                      </Link>
                    </th>
                    <td className="align-top px-5 py-4 text-sm text-[#8A8680] whitespace-nowrap">
                      {mat.subtitle}
                    </td>
                    <td className="align-top px-5 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                        {mat.tech.map(t => (
                          <span
                            key={t}
                            className="text-xs px-2.5 py-1 bg-[#FF6B00]/8 text-[#FF6B00] rounded-full font-medium whitespace-nowrap"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="align-top px-5 py-4 text-sm text-[#2D2D2D] leading-relaxed max-w-[320px]">
                      {mat.examples}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-[#8A8680]/70 mt-3">
            Минимальный заказ — от 400 ₽. Стандартный срок — 1–3 дня, срочно — от 1 часа.
          </p>
        </div>
      </section>

      {/* ── СЕТКА МАТЕРИАЛОВ ── */}
      <section className="py-16 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {materials.map(mat => (
              <div
                key={mat.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8E6E0] shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow group"
              >
                <div className="relative h-52 bg-[#2D2D2D] overflow-hidden">
                  <Image
                    src={mat.image}
                    alt={mat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <h2 className="font-display text-2xl text-white tracking-wide drop-shadow leading-tight">
                      {mat.name}
                    </h2>
                    <p className="text-sm text-white/60 mt-0.5">{mat.subtitle}</p>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm text-[#2D2D2D] leading-[1.75] mb-4">{mat.desc}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mat.properties.map(p => (
                      <span key={p} className="text-xs px-2.5 py-1 bg-[#F5F4F0] text-[#8A8680] rounded-full border border-[#E8E6E0]">
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-[#8A8680] uppercase tracking-wider mb-2">Технологии</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mat.tech.map(t => (
                        <span key={t} className="text-xs px-2.5 py-1 bg-[#FF6B00]/8 text-[#FF6B00] rounded-full font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#8A8680] leading-relaxed border-t border-[#E8E6E0] pt-4">
                    <span className="font-semibold text-[#1A1A1A]">Примеры: </span>
                    {mat.examples}
                  </p>

                  <Link
                    href={mat.href}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded"
                  >
                    Узнать больше →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ПОМОЩЬ В ВЫБОРЕ ── */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Консультация</span>
          <h2 className="font-display text-3xl sm:text-4xl text-[#1A1A1A] tracking-wider mt-2 mb-4">
            Не знаете какой материал выбрать?
          </h2>
          <p className="text-[#8A8680] leading-relaxed mb-8">
            Опишите задачу — мы подберём оптимальный материал по характеристикам, бюджету и внешнему виду. Бесплатно.
          </p>
          <div className="flex justify-center flex-wrap gap-3">
            <a href={`${business.whatsapp.split('?')[0]}?text=${calcText}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-5 py-3 rounded-full hover:bg-[#1fb855] transition-colors shadow-[0_2px_12px_rgba(37,211,102,0.25)]">
              WhatsApp
            </a>
            <a href={`${business.telegram}?text=${calcText}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2AABEE] text-white font-semibold px-5 py-3 rounded-full hover:bg-[#1a9adc] transition-colors shadow-[0_2px_12px_rgba(42,171,238,0.25)]">
              Telegram
            </a>
            <a href={business.max} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2B7FFF] to-[#9B3FE8] text-white font-semibold px-5 py-3 rounded-full hover:brightness-110 transition-[filter]">
              MAX
            </a>
            <a href={`mailto:${business.email}?subject=${encodeURIComponent('Помогите выбрать материал')}`}
              className="inline-flex items-center gap-2 bg-[#1A1A1A]/8 text-[#1A1A1A] font-semibold px-5 py-3 rounded-full hover:bg-[#1A1A1A]/15 transition-colors">
              Написать на почту
            </a>
          </div>
        </div>
      </section>

      <CTASection dark />
    </>
  )
}
