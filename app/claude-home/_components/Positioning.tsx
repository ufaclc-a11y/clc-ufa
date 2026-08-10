import Image from 'next/image'
import Link from 'next/link'

/**
 * Раннее производственное позиционирование: кто приходит в цех и что уносит.
 * Все формулировки подтверждены data/faq.ts, data/services.ts и components/B2BSection.tsx.
 */

const business = [
  'Детали и комплектующие по чертежу',
  'Шильдики, бирки, маркировка',
  'Таблички, вывески, навигация',
  'POS-материалы и элементы упаковки',
  'Заготовки под сборку',
  'Брендированные детали и сувениры',
]

const personal = [
  'Одно изделие без минимального тиража',
  'Подарки, награды, интерьерный декор',
  'Изготовление по фотографии образца',
  'Помощь с макетом, если его нет',
]

export function Positioning() {
  return (
    <section className="ch-section bg-[color:var(--ch-canvas)]">
      <div className="ch-wrap grid gap-10 lg:grid-cols-12 lg:gap-12">

        <div className="lg:col-span-5">
          <div className="ch-photo ch-ticks relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[3/4]">
            <Image
              src="/images/portfolio/gravirovka-033.jpg"
              alt="Стопки круглых деревянных изделий с гравировкой логотипа заказчика"
              fill
              sizes="(max-width: 1023px) 100vw, 40vw"
              className="object-cover"
            />
            <p className="ch-stamp ch-mono">
              <b>Партия</b> Гравировка логотипа на дереве
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <p className="ch-mono text-[color:var(--ch-muted)]">Как это работает</p>
          <h2 className="ch-h2 mt-3">
            Приносите задачу, а не готовый чертёж
          </h2>
          <p className="ch-body mt-4">
            Работаем по макету, чертежу, фотографии образца или описанию словами — макет
            поможем доработать или сделаем с нуля. Дальше подбираем технологию под материал
            и тираж: резка, печать, гравировка и фрезеровка находятся в одном цехе,
            поэтому изделие не переезжает между подрядчиками.
          </p>

          <div className="mt-8 grid gap-8 border-t border-[color:var(--ch-line)] pt-8 sm:grid-cols-2 sm:gap-6">
            <div>
              <h3 className="ch-h3">Производствам и агентствам</h3>
              <ul className="mt-4 space-y-2">
                {business.map(item => (
                  <li key={item} className="flex gap-2.5 text-[15px] leading-snug text-[color:var(--ch-muted)]">
                    <span aria-hidden="true" className="mt-[9px] h-[2px] w-[10px] shrink-0 bg-[color:var(--ch-accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="ch-mono mt-5 text-[color:var(--ch-ink)]">
                Для ИП и ООО: счёт, договор, закрывающие документы. Без НДС
              </p>
              <Link href="/b2b" className="ch-link mt-3">
                Условия для организаций
                <span className="ch-arrow" aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="sm:border-l sm:border-[color:var(--ch-line)] sm:pl-6">
              <h3 className="ch-h3">Частным заказчикам</h3>
              <ul className="mt-4 space-y-2">
                {personal.map(item => (
                  <li key={item} className="flex gap-2.5 text-[15px] leading-snug text-[color:var(--ch-muted)]">
                    <span aria-hidden="true" className="mt-[9px] h-[2px] w-[10px] shrink-0 bg-[color:var(--ch-accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="ch-mono mt-5 text-[color:var(--ch-ink)]">
                Минимальная сумма заказа — 400 ₽
              </p>
              <Link href="/products" className="ch-link mt-3">
                Каталог изделий
                <span className="ch-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
