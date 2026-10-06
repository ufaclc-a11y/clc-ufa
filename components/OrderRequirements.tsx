import Link from 'next/link'

type Kind = 'laser' | 'engraving' | 'stencil' | 'uv-dtf'

const requirements: Record<Kind, { title: string; items: string[]; link: string; label: string }> = {
  laser: {
    title: 'Что нужно для расчёта резки',
    items: [
      'Макет в масштабе 1:1: DXF, SVG, CDR, AI или PDF. Укажите размеры в миллиметрах и количество деталей.',
      'Название и толщину материала; сообщите, нужен наш материал или вы привезёте свой.',
      'Желаемую дату готовности. Стоимость зависит от длины реза и толщины; материал оплачивается отдельно. Минимальный заказ — 450 ₽.',
    ],
    link: '/blog/kak-podgotovit-maket-dlya-lazernoy-rezki',
    label: 'Как подготовить макет для резки',
  },
  engraving: {
    title: 'Что нужно для расчёта гравировки',
    items: [
      'Фото изделия, материал, размеры области нанесения и количество. Для партии уточните, одинаковые ли надписи.',
      'Текст, логотип или рисунок: DXF, SVG, CDR, AI или PDF. Если макета нет, отправьте эскиз — обсудим подготовку.',
      'Желаемую дату готовности. Расчёт зависит от материала, площади рисунка и тиража; стоимость согласуем до работы.',
    ],
    link: '/fonts',
    label: 'Подобрать шрифт для гравировки',
  },
  stencil: {
    title: 'Что нужно для заказа трафарета',
    items: [
      'Пришлите логотип, надпись или орнамент, размеры в миллиметрах и количество трафаретов.',
      'Укажите поверхность и способ нанесения: краска, штукатурка или маркировка. Подберём ПЭТ или фанеру под задачу.',
      'Для букв с внутренними элементами предусмотрим перемычки. Цена зависит от материала, толщины и длины реза; минимальный заказ — 450 ₽.',
    ],
    link: '/services/lazernaya-rezka',
    label: 'Материалы и цены лазерной резки',
  },
  'uv-dtf': {
    title: 'Что нужно для заказа UV DTF-наклеек',
    items: [
      'PNG с прозрачным фоном или PDF, размер каждой наклейки и количество. Печать рассчитывается по листам A3.',
      'Укажите поверхность нанесения: металл, стекло, пластик или керамика. Для необычной поверхности обсудим пробное нанесение.',
      'Стоимость листа зависит от тиража: 1–2 листа — 1 210 ₽ за лист; от 30 листов — 715 ₽ за лист. Срок согласуем при заказе.',
    ],
    link: '/blog/uv-dtf-naklejki-chto-eto',
    label: 'Что такое UV DTF и как переносить наклейку',
  },
}

const linkClass = 'inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold cursor-pointer hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A84300] focus-visible:ring-offset-2 active:scale-[0.98] transition-[transform,opacity]'

export function OrderRequirements({ kind }: { kind: Kind }) {
  const content = requirements[kind]
  return (
    <section className="bg-[#F5F4F0] py-12 sm:py-16" aria-labelledby="order-requirements-title">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 id="order-requirements-title" className="scroll-mt-24 font-display text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide">{content.title}</h2>
        <ol className="mt-6 space-y-4 text-base leading-[1.7] text-[#2D2D2D]">
          {content.items.map((item, index) => (
            <li key={item} className="flex gap-4">
              <span className="font-mono text-sm text-[#A84300] pt-1 shrink-0">0{index + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#calc" className={`${linkClass} bg-[#1A1A1A] text-white`}>Отправить макет и получить расчёт</a>
          <Link href={content.link} className={`${linkClass} border border-[#D7D3CB] text-[#A84300]`}>{content.label}</Link>
        </div>
      </div>
    </section>
  )
}
