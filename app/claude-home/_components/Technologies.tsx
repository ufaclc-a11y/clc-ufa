import Image from 'next/image'
import Link from 'next/link'

/**
 * Технологии. Композиция намеренно неравномерная: одна ведущая технология
 * подана крупно, остальные — компактным списком-реестром. Никаких четырёх
 * одинаковых карточек. Материалы, изделия и цифры — из data/services.ts.
 */

type Tech = {
  index:     string
  title:     string
  href:      string
  image:     string
  alt:       string
  stamp:     string
  materials: string
  makes:     string
  fact:      string
}

const lead: Tech = {
  index:     '01',
  title:     'Лазерная резка',
  href:      '/services/lazernaya-rezka',
  image:     '/images/services/lazernaya-rezka.jpg',
  alt:       'Вырезанная лазером фигурная табличка лежит на решётчатом столе станка',
  stamp:     'Лазерная резка · фигурный контур',
  materials: 'Фанера, акрил, МДФ, дерево, кожа, картон, ткань',
  makes:     'Детали и заготовки под сборку, трафареты, бейджи и номерки, декоративные вставки, элементы упаковки',
  fact:      'Точность ±0,1 мм · срочный небольшой заказ — от 1 часа',
}

const rest: Tech[] = [
  {
    index:     '02',
    title:     'УФ-печать',
    href:      '/services/uf-pechat',
    image:     '/images/services/uf-pechat.jpg',
    alt:       'Полноцветное изображение, напечатанное УФ-печатью на деревянной табличке',
    stamp:     'УФ-печать · дерево',
    materials: 'Акрил, фанера, кожа, пластик, металл, стекло',
    makes:     'Таблички, наградные плакетки, сувениры, UV DTF-наклейки',
    fact:      'Рабочее поле 60 × 90 см · 1440 dpi',
  },
  {
    index:     '03',
    title:     'Гравировка и маркировка',
    href:      '/services/gravirovka',
    image:     '/images/portfolio/gravirovka-027.jpg',
    alt:       'Стопка кожаных нашивок с гравировкой логотипа',
    stamp:     'Гравировка · кожа · партия',
    materials: 'Нержавейка, алюминий, медь, латунь, дерево, кожа, экокожа, пластик',
    makes:     'Жетоны, шильдики, адресники, кружки и термосы, ножи, брелоки, органайзеры',
    fact:      'Точность на металле 0,01 мм · маркиратор в 5 раз быстрее лазера',
  },
  {
    index:     '04',
    title:     'Фрезеровка ЧПУ',
    href:      '/services/frezernaya-rezka-chpu',
    image:     '/images/portfolio/frezernaya-rezka-011.jpg',
    alt:       'Большой лист материала закреплён на столе фрезерного станка ЧПУ',
    stamp:     'Фрезеровка ЧПУ · раскрой листа',
    materials: 'Фанера, МДФ, ПВХ, акрил, дерево, поликарбонат, полистирол, алюминиевый композит',
    makes:     'Крупные детали, объёмные буквы и вывески, мебельные элементы, декоративные панели',
    fact:      'Стол 2440 × 1220 мм · фанера толщиной 6–40 мм',
  },
]

export function Technologies() {
  return (
    <section className="ch-section bg-[color:var(--ch-paper)]">
      <div className="ch-wrap">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ch-mono text-[color:var(--ch-muted)]">Технологии цеха</p>
            <h2 className="ch-h2 mt-3">Четыре технологии под одной крышей</h2>
          </div>
          <Link href="/services" className="ch-link shrink-0">
            Все услуги и цены
            <span className="ch-arrow" aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-9 grid gap-8 lg:grid-cols-12 lg:gap-10">

          {/* Ведущая технология */}
          <article className="lg:col-span-5">
            <Link
              href={lead.href}
              className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--ch-focus)]"
            >
              <div className="ch-photo ch-ticks relative aspect-[4/3]">
                <Image
                  src={lead.image}
                  alt={lead.alt}
                  fill
                  sizes="(max-width: 1023px) 100vw, 38vw"
                  className="object-cover"
                />
                <p className="ch-stamp ch-mono">
                  <b>{lead.index}</b> {lead.stamp}
                </p>
              </div>
              <h3 className="ch-h3 mt-5 text-[24px] sm:text-[27px]">{lead.title}</h3>
            </Link>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="ch-mono text-[color:var(--ch-muted)]">Материалы</dt>
                <dd className="mt-1 text-[15px] leading-snug">{lead.materials}</dd>
              </div>
              <div>
                <dt className="ch-mono text-[color:var(--ch-muted)]">Изготавливаем</dt>
                <dd className="mt-1 text-[15px] leading-snug text-[color:var(--ch-muted)]">{lead.makes}</dd>
              </div>
            </dl>
            <p className="ch-mono mt-4 border-l-2 border-[color:var(--ch-accent)] pl-3 text-[color:var(--ch-ink)]">
              {lead.fact}
            </p>
            <Link href={lead.href} className="ch-link mt-4">
              Подробнее о лазерной резке
              <span className="ch-arrow" aria-hidden="true">→</span>
            </Link>
          </article>

          {/* Реестр остальных технологий */}
          <div className="lg:col-span-7">
            {rest.map(t => (
              <Link key={t.index} href={t.href} className="ch-tech-row group grid grid-cols-[110px_1fr] gap-4 py-6 sm:grid-cols-[220px_1fr] sm:gap-6">
                <div className="ch-photo relative aspect-[4/3] self-start">
                  <Image
                    src={t.image}
                    alt={t.alt}
                    fill
                    sizes="(max-width: 639px) 110px, 220px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="ch-mono text-[color:var(--ch-accent-ink)]">{t.index}</p>
                  <h3 className="ch-h3 mt-1.5">{t.title}</h3>
                  <p className="mt-2 text-[14px] leading-snug text-[color:var(--ch-muted)] sm:text-[15px]">
                    {t.makes}
                  </p>
                  <p className="ch-mono mt-3 text-[color:var(--ch-ink)]">{t.fact}</p>
                  <p className="mt-2 hidden text-[13px] leading-snug text-[color:var(--ch-muted)] sm:block">
                    {t.materials}
                  </p>
                  <span className="ch-link mt-3">
                    Подробнее
                    <span className="ch-arrow" aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
