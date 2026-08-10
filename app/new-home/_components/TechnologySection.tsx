import Image from 'next/image'
import Link from 'next/link'

const technologies = [
  {
    title: 'Лазерная резка',
    task: 'Вырезать точные детали',
    text: 'Контуры, детали, заготовки и серии из листовых материалов. Подходит, когда важны чистый край и повторяемость.',
    fact: 'Точность до ±0,1 мм',
    image: '/images/services/lazernaya-rezka.jpg',
    href: '/services/lazernaya-rezka',
    alt: 'Лазерная резка готового изделия в цехе',
  },
  {
    title: 'УФ-печать',
    task: 'Нанести полноцветное изображение',
    text: 'Полноцветные изображения, логотипы и маркировка на жёстких материалах — от табличек до наград.',
    fact: 'Рабочая область до 60 × 90 см',
    image: '/images/services/uf-pechat.jpg',
    href: '/services/uf-pechat',
    alt: 'Полноцветная УФ-печать на деревянной табличке',
  },
  {
    title: 'Гравировка',
    task: 'Сделать стойкую маркировку',
    text: 'Стойкая персонализация, номера и техническая маркировка на металле и других поверхностях.',
    fact: 'Текст, логотипы и переменные данные',
    image: '/images/services/gravirovka-na-metalle.jpg',
    href: '/services/gravirovka-na-metalle',
    alt: 'Лазерная гравировка на металлическом изделии',
  },
  {
    title: 'Фрезеровка ЧПУ',
    task: 'Обработать крупную заготовку',
    text: 'Крупные и толстые детали, пазы и объёмный рельеф из фанеры, дерева, пластика и композитов.',
    fact: 'Стол 2440 × 1220 мм',
    image: '/images/services/frezernaya-rezka-chpu.jpg',
    href: '/services/frezernaya-rezka-chpu',
    alt: 'Фрезеровка деревянных деталей на станке ЧПУ',
  },
]

export function TechnologySection() {
  return (
    <section className="py-16 sm:py-28" aria-labelledby="technology-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <h2 id="technology-title" className="new-home-display max-w-[13ch] text-[34px] leading-[1.04] sm:text-[48px]">Не продаём станки. Решаем задачу целиком.</h2>
          <p className="max-w-[68ch] text-base leading-7 text-[#5E6672] lg:justify-self-end">Покажите изделие или опишите результат. Мы подберём технологию, материал и последовательность операций — даже если готового макета пока нет.</p>
        </div>

        <nav aria-label="Выбор технологии по задаче" className="mt-10 grid grid-cols-2 border-l border-t border-[#C9CFD6] lg:grid-cols-4">
          {technologies.map(item => (
            <Link key={item.task} href={item.href} className="group flex min-h-24 items-center justify-between gap-4 border-b border-r border-[#C9CFD6] p-4 text-sm font-bold text-[#0D2A80] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1647D8]">
              <span>{item.task}</span>
              <span className="text-[#FF541F] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>

        <div className="mt-14 space-y-14 sm:mt-20 sm:space-y-24">
          {technologies.map((item, index) => (
            <article key={item.title} className={`${index > 0 ? 'hidden lg:grid' : 'grid'} gap-6 lg:grid-cols-12 lg:items-center`}>
              <Link href={item.href} className={`group relative aspect-[4/3] overflow-hidden bg-[#C9CFD6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647D8] focus-visible:ring-offset-4 lg:col-span-7 ${index % 2 ? 'lg:order-2' : ''}`}>
                <Image src={item.image} alt={item.alt} fill className="object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.025] group-hover:opacity-95" sizes="(min-width: 1024px) 58vw, 100vw" />
              </Link>
              <div className={`border-t border-[#C9CFD6] pt-5 lg:col-span-5 lg:border-t-0 lg:pt-0 ${index % 2 ? 'lg:order-1 lg:pr-10' : 'lg:pl-10'}`}>
                <h3 className="new-home-display text-[30px] leading-tight sm:text-[38px]">{item.title}</h3>
                <p className="mt-5 max-w-[56ch] text-base leading-7 text-[#5E6672]">{item.text}</p>
                <p className="mt-7 border-y border-[#C9CFD6] py-4 text-sm font-bold text-[#0D2A80]">{item.fact}</p>
                <Link href={item.href} className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm font-bold text-[#1647D8] underline decoration-[#FF541F] decoration-2 underline-offset-4 hover:text-[#0D2A80] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647D8]">
                  Подробнее об услуге <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
