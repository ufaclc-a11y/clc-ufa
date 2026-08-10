import Image from 'next/image'
import Link from 'next/link'

/**
 * Работы. Композиция задана: верхний ряд — три широких кадра, нижний — четыре
 * вертикальных. Пропорции плиток совпадают с пропорциями исходных фотографий,
 * поэтому ничего не растягивается и не искажается.
 * Подписи описывают только то, что видно на снимке и подтверждено данными проекта.
 */

type Work = {
  title: string
  meta:  string
  image: string
  alt:   string
  href:  string
}

const wide: Work[] = [
  {
    title: 'Коробки с гравировкой',
    meta:  'Фанера · партия',
    image: '/images/portfolio/koroba-fanera-029.jpg',
    alt:   'Партия фанерных коробок с гравировкой, сложенных стопками',
    href:  '/portfolio/koroba-fanera',
  },
  {
    title: 'Бейджи с фотографиями',
    meta:  'Акрил · печать и резка',
    image: '/images/portfolio/bejdzhi-003.jpg',
    alt:   'Именные бейджи с фотографиями сотрудников, напечатанные на акриле',
    href:  '/portfolio/bejdzhi',
  },
  {
    title: 'Наградные статуэтки',
    meta:  'Дерево и акрил · серия',
    image: '/images/portfolio/nagradnye-statuetki-018.jpg',
    alt:   'Четыре одинаковые наградные статуэтки из дерева и чёрного акрила',
    href:  '/portfolio/nagradnye-statuetki',
  },
]

const tall: Work[] = [
  {
    title: 'Таблички с логотипом',
    meta:  'Акрил · печать и резка',
    image: '/images/portfolio/tablitchki-016.jpg',
    alt:   'Стопка красных акриловых табличек с логотипом и контактами',
    href:  '/portfolio/tablitchki',
  },
  {
    title: 'Заготовки с логотипами',
    meta:  'Фанера · гравировка',
    image: '/images/portfolio/zagotovki-002.jpg',
    alt:   'Круглые фанерные заготовки с выгравированными логотипами разных компаний',
    href:  '/portfolio/zagotovki',
  },
  {
    title: 'Резные детали и рейки',
    meta:  'Фрезеровка ЧПУ · раскрой',
    image: '/images/portfolio/frezernaya-rezka-008.jpg',
    alt:   'Фрезерованные рейки и панели с прорезным узором, подготовленные к отгрузке',
    href:  '/portfolio/frezernaya-rezka',
  },
  {
    title: 'Вывеска на фасад',
    meta:  'Монтаж на фасаде',
    image: '/images/portfolio/vyveski-001.jpg',
    alt:   'Вывеска барбершопа с объёмными буквами и цифрами на кирпичной стене',
    href:  '/portfolio/vyveski',
  },
]

function Tile({ work, ratio, sizes, className = '' }: { work: Work; ratio: string; sizes: string; className?: string }) {
  return (
    <Link href={work.href} className={`ch-work ${className}`}>
      <div className={`ch-work-img relative ${ratio}`}>
        <Image src={work.image} alt={work.alt} fill sizes={sizes} className="object-cover" />
      </div>
      <div className="ch-work-cap flex flex-col gap-1 pt-2.5 xl:flex-row xl:items-baseline xl:justify-between xl:gap-3">
        <h3 className="text-[15px] font-bold leading-snug">{work.title}</h3>
        <p className="ch-mono text-[color:var(--ch-muted)] xl:shrink-0 xl:text-right">{work.meta}</p>
      </div>
    </Link>
  )
}

export function Works() {
  return (
    <section className="ch-section bg-[color:var(--ch-canvas)]">
      <div className="ch-wrap">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ch-mono text-[color:var(--ch-muted)]">Работы</p>
            <h2 className="ch-h2 mt-3">Что выходит из цеха</h2>
          </div>
          <Link href="/portfolio" className="ch-link shrink-0">
            Все работы
            <span className="ch-arrow" aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wide.map((w, i) => (
            <Tile
              key={w.title}
              work={w}
              /* третья плитка занимает обе колонки на планшете — чтобы ряд не заканчивался «сиротой» */
              className={i === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}
              ratio="aspect-[16/10]"
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tall.map(w => (
            <Tile
              key={w.title}
              work={w}
              ratio="aspect-[3/4]"
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 25vw"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
