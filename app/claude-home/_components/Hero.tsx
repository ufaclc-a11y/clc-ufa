import Image from 'next/image'
import Link from 'next/link'
import { business } from '@/data/contacts'

/**
 * Первый экран: слева — графитовая панель со смыслом, справа — неприглушённая
 * производственная фотография. Фото не затемняется: панель непрозрачная и
 * занимает свою половину, поэтому снимок остаётся читаемым.
 */

// Все цифры — из data/services.ts (stats) и data/faq.ts. Ничего не выдумано.
const specs = [
  { value: '±0,1 мм',      label: 'точность лазерного реза' },
  { value: '2440 × 1220',  label: 'мм — стол фрезера ЧПУ'   },
  { value: '60 × 90 см',   label: 'рабочее поле УФ-печати'  },
  { value: 'от 1 шт',      label: 'без минимального тиража' },
]

export function Hero() {
  return (
    <section className="ch-dark relative bg-[color:var(--ch-steel)] text-white">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.86fr)]">

        {/* ── Смысловая панель ── */}
        <div className="order-2 lg:order-1 px-[var(--ch-gutter)] pb-10 pt-8 sm:pb-12 sm:pt-10 lg:py-16 xl:py-20 lg:pl-[max(var(--ch-gutter),calc((100vw-1280px)/2+var(--ch-gutter)))] lg:pr-12">
          <div className="max-w-[640px] lg:ml-auto lg:mr-0">

            <p className="ch-mono ch-rise text-[color:var(--ch-muted-dark)]">
              <span className="text-[color:var(--ch-accent)]">Уфа</span>
              {' · '}Менделеева, 177 · цех 509
            </p>

            <h1 className="ch-h1 ch-rise ch-rise-1 mt-4 text-white">
              Цех в Уфе: лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ
            </h1>

            <p className="ch-lead ch-rise ch-rise-2 mt-6 text-white/80">
              Изготавливаем детали, комплектующие и готовые изделия по вашему файлу,
              эскизу, фотографии образца или описанию словами. От одной штуки до серии.
            </p>

            <div className="ch-rise ch-rise-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#raschet" className="ch-btn ch-btn-primary">
                Рассчитать заказ
                <span className="ch-arrow" aria-hidden="true">→</span>
              </Link>
              <Link href="/portfolio" className="ch-btn ch-btn-ghost-dark">
                Смотреть работы
              </Link>
            </div>

            <div className="ch-rise ch-rise-3 mt-8 flex flex-col gap-2 border-t border-[color:var(--ch-line-dark)] pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <p className="ch-mono text-[color:var(--ch-muted-dark)]">
                Принимаем: DXF · SVG · CDR · AI · PDF · фото · эскиз
              </p>
              <a
                href={`tel:${business.phone}`}
                className="inline-flex min-h-11 items-center text-base font-bold text-white hover:text-[color:var(--ch-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ch-focus)]"
              >
                {business.phoneDisplay}
              </a>
            </div>
          </div>
        </div>

        {/* ── Производственная фотография ── */}
        <div className="ch-photo ch-ticks order-1 lg:order-2 relative h-[260px] sm:h-[360px] lg:h-auto lg:min-h-[580px]">
          <Image
            src="/images/portfolio/lazernaya-rezka-112.jpg"
            alt="Лазерная голова станка вырезает контур трафарета из листового материала"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 46vw"
            className="object-cover object-center"
          />
          <p className="ch-stamp ch-mono">
            <b>Цех</b> Лазерная резка · трафарет
          </p>
        </div>
      </div>

      {/* ── Проверяемые характеристики ── */}
      <div className="border-t border-[color:var(--ch-line-dark)] bg-[color:var(--ch-ink)]">
        <div className="ch-wrap">
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {specs.map((s, i) => (
              <div
                key={s.value}
                className={[
                  'py-5 lg:py-6',
                  i % 2 === 1 ? 'border-l border-[color:var(--ch-line-dark)] pl-4 sm:pl-6' : '',
                  i > 1 ? 'border-t border-[color:var(--ch-line-dark)] lg:border-t-0' : '',
                  i > 0 ? 'lg:border-l lg:border-[color:var(--ch-line-dark)] lg:pl-6' : '',
                  i % 2 === 0 ? 'pr-4' : '',
                ].join(' ')}
              >
                <dt className="text-[19px] font-extrabold leading-tight text-white sm:text-[22px]">
                  {s.value}
                </dt>
                <dd className="mt-1 text-[13px] leading-snug text-[color:var(--ch-muted-dark)] sm:text-sm">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
