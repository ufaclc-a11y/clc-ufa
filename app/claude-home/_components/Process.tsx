import Link from 'next/link'

/**
 * Процесс как линейка с засечками, а не четыре одинаковые декоративные карточки.
 * Этапы соответствуют components/ProcessSteps.tsx и data/faq.ts — ничего не добавлено.
 */

const steps = [
  { n: '01', title: 'Присылаете задачу',  text: 'Файл, фотография образца или описание словами — формат не важен.' },
  { n: '02', title: 'Уточняем детали',    text: 'Материал, размер, количество и срок. Поможем доработать макет.' },
  { n: '03', title: 'Считаем',            text: 'Называем стоимость и точный срок изготовления.' },
  { n: '04', title: 'Изготавливаем',      text: 'После предоплаты запускаем в работу и сообщаем о готовности.' },
  { n: '05', title: 'Забираете',          text: 'В цехе на Менделеева, 177 или отправляем транспортной компанией.' },
]

export function Process() {
  return (
    <section className="ch-section bg-[color:var(--ch-paper)]">
      <div className="ch-wrap">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ch-mono text-[color:var(--ch-muted)]">Порядок работы</p>
            <h2 className="ch-h2 mt-3">Пять шагов от задачи до заказа</h2>
          </div>
          <Link href="#raschet" className="ch-link shrink-0">
            Начать с расчёта
            <span className="ch-arrow" aria-hidden="true">→</span>
          </Link>
        </div>

        <ol className="ch-rail mt-9 grid gap-x-6 gap-y-0 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(s => (
            <li key={s.n} className="ch-rail-step">
              <span className="ch-rail-num" aria-hidden="true">{s.n}</span>
              <h3 className="mt-3 text-[18px] font-extrabold leading-snug sm:text-[19px]">{s.title}</h3>
              <p className="mt-2 max-w-[34ch] text-[14px] leading-snug text-[color:var(--ch-muted)] sm:text-[15px]">
                {s.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
