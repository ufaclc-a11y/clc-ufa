const steps = [
  {
    n:    '01',
    title: 'Отправьте идею или макет',
    desc:  'Подойдёт описание словами, фото похожего изделия или готовый файл. Формат не важен.',
  },
  {
    n:    '02',
    title: 'Уточняем детали',
    desc:  'Спросим про материал, размер, количество и сроки. Если нужно — поможем доработать макет.',
  },
  {
    n:    '03',
    title: 'Считаем стоимость',
    desc:  'Быстро рассчитаем цену и назовём точный срок изготовления.',
  },
  {
    n:    '04',
    title: 'Изготавливаем',
    desc:  'После предоплаты запускаем в работу. Вы будете знать, когда готово.',
  },
  {
    n:    '05',
    title: 'Забираете заказ',
    desc:  'У нас в цехе или договоримся о доставке. Работаем без выходных с 10:00 до 19:00.',
  },
]

export function ProcessSteps() {
  return (
    <section className="py-20 bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-14">
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Процесс</span>
          <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wider mt-2">
            Оформить заказ просто
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative">
          {/* Соединительная линия */}
          <div className="hidden sm:block absolute top-7 left-[10%] right-[10%] h-px bg-white/8" />

          {steps.map(s => (
            <div key={s.n} className="relative flex flex-col">
              <div className="font-mono text-[56px] font-bold leading-none text-[#FF6B00]/15 mb-3 select-none">
                {s.n}
              </div>
              <h3 className="font-display text-lg text-white tracking-wide mb-2 leading-tight">
                {s.title}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
