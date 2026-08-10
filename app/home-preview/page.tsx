import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FAQAccordion } from '@/components/FAQAccordion'
import { JsonLd } from '@/components/JsonLd'
import { OrderForm } from '@/components/OrderForm'
import { PortfolioGrid } from '@/components/PortfolioGrid'
import { ReviewsSection } from '@/components/ReviewsSection'
import { blogPosts } from '@/data/blog'
import { cases } from '@/data/cases'
import { business } from '@/data/contacts'
import { selectFaqItems } from '@/data/faq'
import { products } from '@/data/products'
import { services } from '@/data/services'
import { faqPageLd } from '@/lib/seo'

const FAQ_LIMIT = 6

export const metadata: Metadata = {
  title: 'Новая главная - Центр лазерной резки',
  description: 'Предварительная версия новой главной страницы Центра лазерной резки в Уфе.',
  robots: { index: false, follow: false },
}

const advantages = [
  ['Можно без макета', 'Пришлите фото, эскиз или опишите задачу. Подготовим файл и согласуем до запуска.'],
  ['Все в одном цехе', 'Лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ без разных подрядчиков.'],
  ['От одной штуки', 'Изготавливаем единичные изделия, тестовые образцы и регулярные партии для бизнеса.'],
  ['Срок от одного часа', 'Небольшие срочные заказы делаем в день обращения. Обычный срок составляет 1-3 дня.'],
]

const process = [
  ['01', 'Задача', 'Фото, эскиз, описание или готовый файл'],
  ['02', 'Расчёт', 'Материал, размер, тираж, цена и срок'],
  ['03', 'Макет', 'Проверяем и согласуем перед запуском'],
  ['04', 'Готово', 'Самовывоз в Уфе или доставка'],
]

const businessClients = [
  'Производства', 'Рекламные агентства', 'Ивент-команды', 'Мастерские',
  'Мебельные компании', 'Локальные бренды',
]

const howToLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Как заказать изделие в Центре лазерной резки',
  step: process.map(([number, title, text], index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: `${number}. ${title}`,
    text,
  })),
}

function SectionIntro({
  label,
  title,
  text,
  dark = false,
}: {
  label: string
  title: string
  text?: string
  dark?: boolean
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
      <p className={`font-mono text-[11px] uppercase tracking-[0.16em] ${dark ? 'text-[#ff7a32]' : 'text-[#df5724]'}`}>
        {label}
      </p>
      <div>
        <h2 className={`max-w-4xl font-body text-[clamp(34px,4.8vw,68px)] font-semibold leading-[1.02] ${dark ? 'text-white' : 'text-[#171717]'}`}>
          {title}
        </h2>
        {text && <p className={`mt-5 max-w-2xl text-base leading-7 ${dark ? 'text-white/62' : 'text-[#625f59]'}`}>{text}</p>}
      </div>
    </div>
  )
}

function Arrow() {
  return <span aria-hidden="true" className="ml-3 text-lg">↗</span>
}

export default function HomePreviewPage() {
  const faqLd = faqPageLd(selectFaqItems({ limit: FAQ_LIMIT }))

  return (
    <main className="overflow-hidden bg-[#f7f6f2] text-[#171717]">
      <JsonLd data={howToLd} />
      <JsonLd data={faqLd} />

      <section className="relative min-h-[700px] border-b border-black/10 bg-[#f7f6f2] pt-24 sm:pt-28 lg:min-h-[760px]">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 pb-10 sm:gap-10 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-10 lg:pb-12">
          <div className="relative z-10 order-2 lg:order-1 lg:py-6">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[#625f59]">
              <span className="h-2 w-2 bg-[#ed612a]" /> Производство в Уфе
            </p>
            <h1 className="mt-7 max-w-3xl font-body text-[clamp(44px,4.75vw,68px)] font-semibold leading-[0.98]">
              Из идеи в<br />готовое изделие
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#5f5c56] sm:text-lg sm:leading-8">
              Лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ. Делаем детали и изделия по вашему макету, фото или описанию.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-4">
              <Link
                href="#order"
                className="inline-flex min-h-12 items-center bg-[#ed612a] px-6 text-sm font-semibold text-white transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#d95220] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717] focus-visible:ring-offset-3 active:translate-y-0 active:scale-[0.98]"
              >
                Рассчитать заказ <Arrow />
              </Link>
              <Link href="/portfolio" className="hidden min-h-12 items-center border-b border-black/30 text-sm font-semibold transition-[border-color,color] duration-200 hover:border-[#ed612a] hover:text-[#d95220] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed612a] sm:inline-flex">
                Смотреть работы
              </Link>
            </div>
            <div className="mt-10 hidden max-w-xl grid-cols-3 border-y border-black/15 sm:grid">
              {[['4', 'технологии'], ['1-3', 'дня обычно'], ['от 1', 'штуки']].map(([value, label], index) => (
                <div key={label} className={`py-5 ${index > 0 ? 'border-l border-black/15 pl-4 sm:pl-6' : ''}`}>
                  <p className="text-2xl font-semibold sm:text-3xl">{value}</p>
                  <p className="mt-1 text-xs text-[#706c65] sm:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative order-1 min-h-[250px] sm:min-h-[450px] lg:order-2 lg:min-h-[570px]">
            <div className="absolute inset-0 overflow-hidden bg-[#ddd8ce] sm:inset-x-16 sm:h-[77%] lg:inset-x-0 lg:left-10">
              <Image
                src="/images/portfolio/medali-011.jpg"
                alt="Медали с полноцветной печатью, изготовленные в Центре лазерной резки"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 52vw"
              />
            </div>
            <div className="absolute bottom-0 left-0 hidden h-[42%] w-[44%] overflow-hidden border-[10px] border-[#f7f6f2] bg-[#d9d4ca] sm:block sm:border-[14px] lg:w-[46%]">
              <Image src="/images/portfolio/gravirovka-050.jpg" alt="Гравировка на изделии" fill className="object-cover" sizes="26vw" />
            </div>
            <div className="absolute bottom-[3%] right-0 hidden w-[47%] bg-[#171717] p-5 text-white sm:block sm:p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#ff7a32]">Сделано у нас</p>
              <p className="mt-3 text-sm leading-6 text-white/68 sm:text-base">Реальные работы, реальные материалы, производство в Уфе.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white py-5" aria-label="Материалы">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-8 gap-y-2 px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[#716d66] sm:px-6">
          <span>Фанера</span><span>Акрил</span><span>МДФ</span><span>ПВХ</span><span>Металл</span><span>Кожа</span><span>Стекло</span><span>Дерево</span>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionIntro
            label="Технологии"
            title="Один цех для всей задачи"
            text="Выберите технологию или просто расскажите, какой результат нужен. Подскажем материал и способ изготовления."
          />
          <div className="mt-12 border-y border-black/20">
            {services.map((service, index) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group grid min-h-32 gap-4 border-b border-black/15 py-5 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed612a] sm:grid-cols-[48px_0.9fr_1.1fr_150px] sm:items-center lg:min-h-40 lg:grid-cols-[64px_0.9fr_1.15fr_210px]"
              >
                <span className="font-mono text-xs text-[#88837a]">0{index + 1}</span>
                <h3 className="font-body text-2xl font-semibold leading-tight transition-[color] duration-200 group-hover:text-[#d95220] lg:text-3xl">{service.shortTitle}</h3>
                <p className="text-sm leading-6 text-[#69645c] lg:text-base">{service.shortDescription}</p>
                <div className="relative hidden aspect-[16/9] overflow-hidden bg-[#dedad1] sm:block">
                  <Image src={service.image} alt="" fill className="object-cover transition-[transform] duration-500 ease-out group-hover:scale-[1.035]" sizes="210px" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#191919] py-20 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionIntro
            label="Изделия"
            title="От подарка до серийной детали"
            text="Брендируем, персонализируем и собираем тиражи. В каталоге есть примеры, но форма и материал всегда могут быть вашими."
            dark
          />
          <div className="mt-12 grid gap-2 sm:grid-cols-2 lg:grid-cols-12">
            {products.slice(0, 7).map((product, index) => {
              const span = index === 0 ? 'lg:col-span-7 lg:row-span-2' : index === 1 || index === 2 ? 'lg:col-span-5' : 'lg:col-span-3'
              return (
                <Link key={product.id} href={`/products/${product.id}`} className={`group relative min-h-[280px] overflow-hidden bg-[#292929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a32] ${span} ${index === 0 ? 'sm:min-h-[570px]' : ''}`}>
                  <Image src={product.image} alt={product.alt} fill className="object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.025] group-hover:opacity-90" sizes={index === 0 ? '(max-width: 1024px) 100vw, 58vw' : '(max-width: 1024px) 50vw, 30vw'} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                    <div><p className="font-mono text-[10px] uppercase tracking-[0.13em] text-[#ff9a6f]">{product.tags.slice(0, 2).join(' / ')}</p><h3 className="mt-2 text-xl font-semibold sm:text-2xl">{product.title}</h3></div>
                    <span aria-hidden="true" className="text-xl">↗</span>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="mt-8 flex justify-end"><Link href="/products" className="inline-flex min-h-11 items-center border-b border-[#ff7a32] text-sm font-semibold hover:text-[#ff9a6f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a32]">Весь каталог <Arrow /></Link></div>
        </div>
      </section>

      <section className="bg-[#ebe7de] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#d95220]">Для бизнеса</p>
            <h2 className="mt-5 max-w-3xl font-body text-[clamp(38px,5vw,68px)] font-semibold leading-[1.02]">Детали и серии для вашего производства</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#625f59]">Работаем по чертежам, макетам, образцам и эскизам. Сделаем тестовую деталь или возьмём регулярный выпуск.</p>
            <Link href="/b2b" className="mt-8 inline-flex min-h-12 items-center bg-[#171717] px-6 text-sm font-semibold text-white transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed612a] active:translate-y-0 active:scale-[0.98]">Обсудить задачу <Arrow /></Link>
          </div>
          <div className="border-y border-black/20">
            {businessClients.map((item, index) => <div key={item} className="grid grid-cols-[42px_1fr] border-b border-black/15 py-4 last:border-b-0"><span className="font-mono text-xs text-[#a29b90]">0{index + 1}</span><span className="font-medium">{item}</span></div>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionIntro label="Портфолио" title="Сделано в нашем цехе" text="Здесь только реальные заказы: награды, таблички, гравировка, печать, заготовки и детали для производства." />
          <div className="mt-12"><PortfolioGrid limit={8} showFilter={false} /></div>
          <div className="mt-8 flex justify-end"><Link href="/portfolio" className="inline-flex min-h-11 items-center border-b border-[#ed612a] text-sm font-semibold hover:text-[#d95220] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed612a]">Все работы <Arrow /></Link></div>
        </div>
      </section>

      <section className="border-y border-black/10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionIntro label="Как работаем" title="Понятный путь от запроса до готового заказа" />
          <ol className="mt-12 grid border-y border-black/20 sm:grid-cols-4">
            {process.map(([number, title, description], index) => (
              <li key={number} className={`min-h-48 py-6 sm:px-5 ${index > 0 ? 'border-t border-black/15 sm:border-l sm:border-t-0' : ''}`}>
                <span className="font-mono text-xs text-[#d95220]">{number}</span>
                <h3 className="mt-9 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6a665e]">{description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-16 grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <h3 className="text-2xl font-semibold">Что важно заказчику</h3>
            <div className="grid border-t border-black/20 sm:grid-cols-2">
              {advantages.map(([title, description], index) => (
                <article key={title} className={`border-b border-black/15 py-6 sm:px-6 ${index % 2 === 1 ? 'sm:border-l' : ''}`}>
                  <h4 className="text-lg font-semibold">{title}</h4><p className="mt-3 text-sm leading-6 text-[#69645c]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection />

      {cases.length > 0 && (
        <section className="bg-[#ebe7de] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionIntro label="Кейсы" title="Задачи, сроки и результат" />
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              {cases.slice(0, 3).map(item => (
                <Link key={item.id} href="/cases" className="group border-t border-black/30 pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed612a]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#d6d1c7]"><Image src={item.image} alt={item.imageAlt} fill className="object-cover transition-[transform] duration-500 ease-out group-hover:scale-[1.025]" sizes="(max-width: 1024px) 100vw, 33vw" /></div>
                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#d95220]">{item.category}</p><h3 className="mt-2 text-xl font-semibold leading-tight">{item.title}</h3>
                  <div className="mt-5 grid grid-cols-2 border-t border-black/15 pt-4 text-sm"><div><span className="block text-xs text-[#777168]">Тираж</span>{item.qty}</div><div><span className="block text-xs text-[#777168]">Срок</span>{item.deadline}</div></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionIntro label="Полезное" title="Материалы, технологии и подготовка макета" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {blogPosts.slice(0, 3).map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group border-t border-black/30 pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed612a]">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#dedad1]"><Image src={post.image} alt={post.imageAlt} fill className="object-cover transition-[transform] duration-500 ease-out group-hover:scale-[1.025]" sizes="(max-width: 768px) 100vw, 33vw" /></div>
                <div className="mt-5 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[#7c766d]"><span>{post.category}</span><span>{post.readTime} мин</span></div><h3 className="mt-3 text-xl font-semibold leading-tight transition-[color] duration-200 group-hover:text-[#d95220]">{post.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#f7f6f2] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr]">
          <div><p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#d95220]">Вопросы</p><h2 className="mt-5 text-4xl font-semibold leading-[1.05] sm:text-5xl">Коротко о важном до заказа</h2><Link href="/faq" className="mt-7 inline-flex min-h-11 items-center border-b border-[#ed612a] text-sm font-semibold hover:text-[#d95220] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed612a]">Все вопросы <Arrow /></Link></div>
          <FAQAccordion limit={FAQ_LIMIT} />
        </div>
      </section>

      <section id="order" className="scroll-mt-24 bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28"><p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#d95220]">Расчёт заказа</p><h2 className="mt-5 max-w-lg text-[clamp(38px,5vw,66px)] font-semibold leading-[1.02]">Покажите задачу. Ответим с ценой и сроком.</h2><p className="mt-6 max-w-md text-base leading-7 text-[#68635b]">Приложите файл, фото или эскиз. Если макета нет, достаточно описания.</p></div>
          <OrderForm />
        </div>
      </section>

      <section className="bg-[#ed612a] py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">Начать просто</p><h2 className="mt-4 max-w-4xl text-[clamp(34px,5vw,66px)] font-semibold leading-[1.02]">Пришлите идею, фото или макет</h2></div>
          <div className="flex flex-wrap gap-3"><a href={business.telegram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center bg-[#171717] px-6 text-sm font-semibold text-white transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:translate-y-0 active:scale-[0.98]">Написать в Telegram <Arrow /></a><a href={`tel:${business.phone}`} className="inline-flex min-h-12 items-center border border-white/60 px-6 text-sm font-semibold transition-[background-color,color] duration-200 hover:bg-white hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{business.phoneDisplay}</a></div>
        </div>
      </section>
    </main>
  )
}
