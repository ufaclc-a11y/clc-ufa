import Link from 'next/link'
import { OrderForm } from '@/components/OrderForm'
import { ContactButtons } from '@/components/ContactButtons'
import { business } from '@/data/contacts'
import { reviews, sourceLabels, sourceUrls } from '@/data/reviews'

/**
 * Заявка. Используется рабочая форма проекта (components/OrderForm) без изменений
 * её полей, валидации и аналитики — визуальная интеграция сделана точечными
 * правилами в claude-home.css под классом .ch-form.
 */

const rating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1).replace('.', ',')

/** Русское склонение по числу: 1 отзыву / 2 отзывам / 5 отзывам. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return many
  const mod10 = n % 10
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

// Две короткие реальные цитаты из data/reviews.ts
const quotes = reviews.filter(r => ['r05', 'r08'].includes(r.id))

export function OrderSection() {
  return (
    <section id="raschet" className="ch-section scroll-mt-20 bg-[color:var(--ch-canvas)]">
      <div className="ch-wrap grid gap-10 lg:grid-cols-12 lg:gap-12">

        <div className="lg:col-span-5">
          <p className="ch-mono text-[color:var(--ch-muted)]">Заявка</p>
          <h2 className="ch-h2 mt-3">Пришлите задачу — вернёмся с ценой и сроком</h2>
          <p className="ch-body mt-4">
            Достаточно контакта и пары слов о том, что нужно изготовить. Размер, материал
            и тираж уточним сами — и подскажем, если что-то удобнее сделать иначе.
          </p>

          {/* Отзывы — реальные, из data/reviews.ts */}
          <div className="mt-8 border-t border-[color:var(--ch-line)] pt-6">
            <p className="ch-mono text-[color:var(--ch-ink)]">
              <span className="text-[color:var(--ch-accent-ink)]">{rating} из 5</span>
              {` — по ${reviews.length} ${plural(reviews.length, 'отзыву', 'отзывам', 'отзывам')} с Яндекс.Карт и 2ГИС`}
            </p>
            <ul className="mt-4 space-y-4">
              {quotes.map(q => (
                <li key={q.id} className="border-l-2 border-[color:var(--ch-accent)] pl-4">
                  <p className="text-[15px] leading-snug">«{q.text}»</p>
                  <p className="ch-mono mt-2 text-[color:var(--ch-muted)]">
                    {q.name} · {sourceLabels[q.source]}
                  </p>
                </li>
              ))}
            </ul>
            <a
              href={sourceUrls.yandex}
              target="_blank"
              rel="noopener noreferrer"
              className="ch-link mt-4"
            >
              Отзывы на Яндекс.Картах
              <span className="ch-arrow" aria-hidden="true">→</span>
            </a>
          </div>

          {/* Контакты цеха */}
          <div className="mt-8 border-t border-[color:var(--ch-line)] pt-6">
            <h3 className="ch-h3">Цех в Уфе</h3>
            <dl className="mt-4 space-y-3 text-[15px] leading-snug">
              <div className="flex gap-3">
                <dt className="ch-mono w-[86px] shrink-0 pt-[3px] text-[color:var(--ch-muted)]">Адрес</dt>
                <dd>
                  {business.address}
                  <span className="block text-[color:var(--ch-muted)]">{business.landmark}</span>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="ch-mono w-[86px] shrink-0 pt-[3px] text-[color:var(--ch-muted)]">Часы</dt>
                <dd>{business.workingHours}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="ch-mono w-[86px] shrink-0 pt-[3px] text-[color:var(--ch-muted)]">Телефон</dt>
                <dd>
                  <a
                    href={`tel:${business.phone}`}
                    className="inline-flex min-h-11 items-center font-bold hover:text-[color:var(--ch-accent-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ch-focus)]"
                  >
                    {business.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>

            <p className="ch-mono mt-5 text-[color:var(--ch-muted)]">Ответим в мессенджере</p>
            <ContactButtons className="mt-3" size="sm" />

            <Link href="/contacts" className="ch-link mt-5">
              Как найти цех
              <span className="ch-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="ch-form lg:col-span-7">
          <OrderForm
            id="claude-home-order"
            title="Рассчитать заказ"
            description="Заполните поля, которые знаете, приложите файл — и отправьте письмом или в мессенджере."
          />
        </div>
      </div>
    </section>
  )
}
