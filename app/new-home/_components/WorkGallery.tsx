import Image from 'next/image'
import Link from 'next/link'

const works = [
  { image: '/images/portfolio/lazernaya-rezka-381.jpg', title: 'Шильдики и серийные детали', detail: 'Лазерная резка', href: '/portfolio/lazernaya-rezka', span: 'lg:col-span-7 lg:row-span-2', ratio: 'aspect-[4/3] lg:aspect-auto' },
  { image: '/images/portfolio/lazernaya-rezka-379.jpg', title: 'Награды из акрила', detail: 'Резка + печать', href: '/products/nagrady', span: 'lg:col-span-5', ratio: 'aspect-[4/3]' },
  { image: '/images/portfolio/lazernaya-rezka-382.jpg', title: 'Фигурная полноцветная печать', detail: 'УФ-печать', href: '/services/uf-pechat', span: 'lg:col-span-5', ratio: 'aspect-[4/3]' },
  { image: '/images/portfolio/frezernaya-rezka-042.jpg', title: 'Фрезерованные изделия', detail: 'Фрезеровка ЧПУ', href: '/services/frezernaya-rezka-chpu', span: 'lg:col-span-4', ratio: 'aspect-square' },
  { image: '/images/portfolio/gravirovka-073.jpg', title: 'Гравировка на металле', detail: 'Маркировка', href: '/services/gravirovka-na-metalle', span: 'lg:col-span-4', ratio: 'aspect-square' },
  { image: '/images/portfolio/uf-pechat-020.jpg', title: 'Таблички и вывески', detail: 'Для офиса и улицы', href: '/products/tablichki', span: 'lg:col-span-4', ratio: 'aspect-square' },
]

export function WorkGallery() {
  return (
    <section className="bg-white py-16 sm:py-28" aria-labelledby="works-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="works-title" className="new-home-display max-w-[13ch] text-[34px] leading-[1.04] sm:text-[48px]">Работы, которые можно рассмотреть</h2>
          <Link href="/portfolio" className="inline-flex min-h-11 items-center gap-3 self-start text-sm font-bold text-[#1647D8] underline decoration-[#FF541F] decoration-2 underline-offset-4 hover:text-[#0D2A80] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647D8] sm:self-auto">Все работы <span aria-hidden="true">→</span></Link>
        </div>

        <div className="mt-12 grid gap-x-3 gap-y-8 sm:grid-cols-2 lg:grid-cols-12">
          {works.map((work, index) => (
            <Link key={work.image} href={work.href} className={`group ${index > 1 ? 'hidden lg:block' : 'block'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647D8] focus-visible:ring-offset-4 ${work.span}`}>
              <div className={`relative overflow-hidden bg-[#C9CFD6] ${work.ratio}`}>
                <Image src={work.image} alt={work.title} fill className="object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.025] group-hover:opacity-95" sizes={index === 0 ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 100vw'} />
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-[#C9CFD6] pt-3">
                <div><h3 className="font-bold">{work.title}</h3><p className="mt-1 text-sm text-[#5E6672]">{work.detail}</p></div>
                <span className="text-[#1647D8] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
