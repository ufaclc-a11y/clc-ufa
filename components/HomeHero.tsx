import Image from 'next/image'
import Link from 'next/link'
import { business } from '@/data/contacts'
import { IconWA, IconTG, IconMax } from '@/components/ContactButtons'

const facts = [
  { icon: '▦', text: 'Собственное производство в Уфе' },
  { icon: '✎', text: 'Помогаем с макетом и конструкцией' },
  { icon: '≋', text: 'От 1 штуки до тиража' },
  { icon: '▣', text: 'Сроки от 1–3 дней' },
]

const makes = ['Награды', 'Упаковка', 'Таблички и указатели', 'Декор и интерьер', 'Сувениры и подарки', 'Детали и элементы']

const msg = 'inline-flex h-10 w-12 items-center justify-center rounded-[10px] text-white transition-[filter,transform] duration-200 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]'

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden bg-[#0c0c0d] text-white"
      style={{ backgroundImage: 'radial-gradient(ellipse 50% 60% at 75% 45%, rgba(255,107,0,0.16), transparent 70%)' }}
    >
      <div className="relative z-10 mx-auto grid max-w-7xl gap-0 px-4 pb-8 pt-24 sm:px-6 lg:min-h-[640px] lg:grid-cols-[minmax(0,500px)_1fr] lg:pb-24 lg:pt-28">
        <div className="lg:self-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FF6B00] sm:text-[13px]">Уфа • изделия на заказ</p>

          <h1 className="mb-4 mt-3 font-hero text-[42px] leading-[1.05] tracking-[-0.01em] sm:text-[54px]">
            От идеи —<br />к <span className="text-[#FF7A1A]">готовому</span><br />изделию.
            <span className="sr-only"> Лазерная резка, УФ-печать и фрезеровка ЧПУ в Уфе</span>
          </h1>

          <p className="max-w-[440px] text-[13.5px] leading-[1.55] text-white/80 sm:text-base">
            Изготавливаем таблички, награды, упаковку, декор, сувениры и детали по вашему макету, эскизу, фото или образцу. От одной штуки до партии.
          </p>

          {/* картинка на мобильном — между текстом и кнопками */}
          <Image
            src="/images/hero-products-m.jpg" alt="Изделия из фанеры, акрила, МДФ и ПВХ: награды, таблички, упаковка, декор"
            width={640} height={410} priority sizes="100vw"
            className="-mx-4 mt-3 block h-auto w-[calc(100%+2rem)] max-w-none lg:hidden"
          />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:mt-6">
            <a
              href={business.telegram} target="_blank" rel="noopener noreferrer"
              className="inline-flex h-[50px] items-center justify-center rounded-xl bg-gradient-to-b from-[#FF7A1A] to-[#F25C00] px-7 text-base font-bold text-white shadow-[0_8px_28px_rgba(255,107,0,0.35)] transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Обсудить задачу →
            </a>
            <Link
              href="/products"
              className="inline-flex h-[50px] items-center justify-center rounded-xl border border-white/35 px-7 text-sm font-medium transition-[background-color,transform] duration-200 hover:bg-white/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
            >
              Посмотреть изделия
            </Link>
          </div>

          <div className="mt-4 flex justify-center gap-2.5 lg:justify-start">
            <a href={business.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className={`${msg} bg-[#1676A7]`}><IconTG /></a>
            <a href={business.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={`${msg} bg-[#117A37]`}><IconWA /></a>
            <a href={business.max} target="_blank" rel="noopener noreferrer" aria-label="MAX" className={`${msg} bg-gradient-to-r from-[#145FC4] to-[#7130B8]`}><IconMax /></a>
          </div>

          <ul className="mt-5 grid grid-cols-4 gap-1.5 lg:flex lg:gap-3.5 lg:max-w-[480px]">
            {facts.map(f => (
              <li key={f.text} className="flex flex-col items-center gap-1 text-center text-[10px] leading-tight text-white/75 lg:flex-1 lg:flex-row lg:gap-2.5 lg:text-left lg:text-[11px]">
                <span aria-hidden className="text-xl text-[#FF7A1A]">{f.icon}</span>{f.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* десктоп: фото справа с плавным краем */}
      <Image
        src="/images/hero-products.jpg" alt="" aria-hidden width={770} height={515} priority sizes="770px"
        className="pointer-events-none absolute right-0 top-16 hidden h-auto w-[770px] lg:block xl:-right-5"
        style={{ WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 18%), linear-gradient(0deg, transparent 0, #000 10%)', WebkitMaskComposite: 'source-in', maskComposite: 'intersect' }}
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 px-4 py-4 text-[12px] text-white/85 sm:px-6 sm:text-[13px] lg:absolute lg:inset-x-0 lg:bottom-5 lg:border-t lg:px-6">
        <span className="rounded-full border border-[#FF6B00] px-3.5 py-2 font-bold text-[#FF7A1A]">Что мы изготавливаем:</span>
        {makes.map(m => <span key={m} className="max-lg:[&:nth-child(n+6)]:hidden">{m}</span>)}
      </div>
    </section>
  )
}
