import Link from 'next/link'

const clients = [
  'Заводы и производства',
  'Рекламные агентства',
  'Ивент-агентства',
  'Дизайнеры и мастерские',
  'Мебельщики',
  'Производители упаковки',
  'Производители игрушек',
  'Локальные бренды',
]

const outputs = [
  'Детали из фанеры',
  'Элементы из акрила',
  'Шильдики и бирки',
  'POS-материалы',
  'Элементы упаковки',
  'Заготовки под сборку',
  'Декоративные вставки',
  'Брендированные детали',
]

export function B2BSection() {
  return (
    <section className="py-20 bg-[#2D2D2D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          <div>
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Для бизнеса</span>
            <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wider mt-2 mb-6 leading-tight">
              Изготавливаем детали для ваших изделий
            </h2>
            <p className="text-[#6E6A64] leading-relaxed mb-4">
              Помогаем производствам, рекламным агентствам, дизайнерам и мастерским закрывать задачи по резке, печати, гравировке и фрезеровке.
            </p>
            <p className="text-[#6E6A64] leading-relaxed mb-8">
              Работаем по вашим чертежам, макетам, эскизам и образцам. Можно заказать одну деталь, тестовую партию или регулярное производство.
            </p>
            <Link
              href="/b2b"
              className="inline-flex items-center gap-2 bg-[#C94700] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#B13E00] transition-colors"
            >
              Подробнее о B2B-производстве
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-mono text-xs text-[#FF8A33] tracking-widest uppercase mb-4">Для кого</h3>
              <ul className="space-y-2.5">
                {clients.map(c => (
                  <li key={c} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="w-1 h-1 bg-[#FF6B00] rounded-full mt-1.5 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-xs text-[#FF8A33] tracking-widest uppercase mb-4">Что делаем</h3>
              <ul className="space-y-2.5">
                {outputs.map(o => (
                  <li key={o} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="w-1 h-1 bg-[#FF6B00] rounded-full mt-1.5 shrink-0" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
