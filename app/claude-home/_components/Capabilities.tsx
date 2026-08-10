import Image from 'next/image'
import Link from 'next/link'

/**
 * Возможности цеха в формате «характеристика → что это даёт».
 * Левая колонка — только проверяемые цифры из data/services.ts и data/faq.ts,
 * правая — практический вывод, который прямо следует из этой цифры.
 */

const rows = [
  {
    spec: 'Точность лазерного реза ±0,1 мм',
    gain: 'Детали в партии одинаковые — собираются без подгонки по месту',
  },
  {
    spec: 'Стол фрезера 2440 × 1220 мм, фанера 6–40 мм',
    gain: 'Крупная деталь режется целиком, без стыков и склейки',
  },
  {
    spec: 'УФ-печать 60 × 90 см, 1440 dpi',
    gain: 'Полноцветное изображение наносится прямо на готовое изделие',
  },
  {
    spec: 'Гравировка по металлу — точность 0,01 мм',
    gain: 'Мелкий шрифт и номера на шильдиках остаются читаемыми',
  },
  {
    spec: 'Маркиратор гравирует в 5 раз быстрее лазера',
    gain: 'Тираж жетонов и бирок не растягивает срок изготовления',
  },
  {
    spec: 'Срок 1–3 дня, срочный заказ — от 1 часа',
    gain: 'Под дедлайн можно успеть в тот же рабочий день',
  },
  {
    spec: 'От 1 штуки, минимальный заказ 400 ₽',
    gain: 'Тестовый образец перед серией — без условий по тиражу',
  },
]

export function Capabilities() {
  return (
    <section className="ch-section ch-dark bg-[color:var(--ch-steel)] text-white">
      <div className="ch-wrap grid gap-10 lg:grid-cols-12 lg:gap-12">

        <div className="lg:col-span-7">
          <p className="ch-mono text-[color:var(--ch-muted-dark)]">Возможности цеха</p>
          <h2 className="ch-h2 mt-3 text-white">Что стоит за каждой цифрой</h2>

          <dl className="mt-7">
            {rows.map(r => (
              <div key={r.spec} className="ch-spec-row grid gap-1 py-4 sm:grid-cols-[1.45fr_1fr] sm:gap-7 sm:py-[18px]">
                <dt className="text-[15px] font-bold leading-snug text-white sm:text-base">{r.spec}</dt>
                <dd className="text-[14px] leading-snug text-[color:var(--ch-muted-dark)] sm:text-[15px]">{r.gain}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <p className="ch-mono max-w-[42ch] text-[color:var(--ch-muted-dark)]">
              Для ИП и ООО: счёт, договор и закрывающие документы. Работаем без НДС
            </p>
            <Link href="/b2b" className="ch-btn ch-btn-ghost-dark shrink-0">
              Условия для организаций
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="ch-photo ch-ticks relative aspect-[4/3] h-full lg:aspect-auto lg:min-h-[440px]">
            <Image
              src="/images/portfolio/frezernaya-rezka-016.jpg"
              alt="Шпиндель фрезерного станка обрабатывает круглую деталь, вокруг стружка"
              fill
              sizes="(max-width: 1023px) 100vw, 38vw"
              className="object-cover"
            />
            <p className="ch-stamp ch-mono">
              <b>Цех</b> Обработка детали на ЧПУ
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
