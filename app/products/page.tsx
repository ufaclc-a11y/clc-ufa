import type { Metadata }   from 'next'
import Image               from 'next/image'
import Link                from 'next/link'
import { services }        from '@/data/services'
import { business }        from '@/data/contacts'
import { ProductsGrid }    from '@/components/ProductsGrid'
import { CTASection }      from '@/components/CTASection'
import { FAQAccordion }    from '@/components/FAQAccordion'
import { OrderForm }       from '@/components/OrderForm'
import { GalleryGrid }     from '@/components/GalleryGrid'
import { SymbolIcon }      from '@/components/Icons'
import { RichText }        from '@/components/RichText'
import { ContactButtons }  from '@/components/ContactButtons'

export const metadata: Metadata = {
  title:       'Изготовление изделий из фанеры и акрила в Уфе | ЦЛР',
  description: 'Каталог изделий Центр лазерной резки: часы, ключницы, медальницы, таблички, вывески, бейджи, хештеги, шкатулки, сувениры. Изготовление в Уфе по вашему макету.',
  keywords:    ['изготовление изделий из фанеры уфа', 'изделия из акрила уфа', 'сувениры на заказ уфа', 'таблички на заказ уфа', 'вывески уфа', 'шкатулки фанера уфа', 'медальницы уфа', 'часы из фанеры уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/products' },
}

function getPortfolioPhotos(service: typeof services[number]): string[] {
  if (service.portfolioPhotos?.length) return service.portfolioPhotos
  if (service.portfolioPrefixes?.length)
    return service.portfolioPrefixes.map(c => `/images/portfolio/${c.prefix}-001.jpg`)
  if (!service.portfolioPrefix || !service.portfolioCount) return []
  const limit = 9
  const step  = Math.max(1, Math.floor(service.portfolioCount / limit))
  const photos: string[] = []
  for (let i = 1; i <= service.portfolioCount && photos.length < limit; i += step)
    photos.push(`/images/portfolio/${service.portfolioPrefix}-${String(i).padStart(3, '0')}.jpg`)
  return photos
}

export default function ProductsPage() {
  const service = services.find(s => s.slug === 'izgotovlenie-izdelij')!
  const others  = services.filter(s => s.slug !== service.slug)
  const portfolioPhotos = getPortfolioPhotos(service)

  const waText = encodeURIComponent(`Здравствуйте! Интересует изготовление изделий. Подскажите стоимость.`)

  return (
    <>
      {/* ── HERO ── */}
      <div className="relative min-h-[560px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        {service.heroImage && (
          <div className="absolute inset-0">
            <Image
              src={service.heroImage}
              alt={service.title}
              fill priority
              className="object-cover opacity-30"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/95 via-[#1A1A1A]/70 to-[#1A1A1A]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 w-full">
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Изделия</span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white tracking-wider mt-2 mb-5 leading-[1] max-w-3xl">
            {service.h1}
          </h1>
          <p className="text-lg text-white/55 max-w-2xl leading-relaxed mb-10">
            {service.description}
          </p>
          <ContactButtons size="lg" variant="dark" />
        </div>
      </div>

      {/* ── СТАТЫ ── */}
      {service.stats && (
        <div className="bg-[#FF6B00]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/20">
              {service.stats.map(s => (
                <div key={s.label} className="py-7 px-6 text-center">
                  <div className="font-display text-3xl sm:text-4xl text-white tracking-wider leading-none mb-1">{s.value}</div>
                  <div className="text-sm text-white/80 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SEO-ТЕКСТ ── */}
      {service.bodyText && (
        <section className="py-14 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <p className="text-lg text-[#2D2D2D] leading-[1.85]"><RichText text={service.bodyText} /></p>
          </div>
        </section>
      )}

      {/* ── КАТАЛОГ ── */}
      <section className="py-16 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Каталог</span>
            <h2 className="font-display text-4xl text-[#1A1A1A] tracking-wider mt-2">Что мы изготавливаем</h2>
          </div>
          <ProductsGrid />
        </div>
      </section>

      {/* ── МАТЕРИАЛЫ ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Работаем с</span>
            <h2 className="font-display text-3xl text-[#1A1A1A] tracking-wider mt-1">Материалы</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {service.materials.map(m => {
              const href = service.materialLinks?.[m] ?? '/products'
              return (
                <Link key={m} href={href}
                  className="group flex items-center gap-2.5 bg-white border border-[#E8E6E0] hover:border-[#FF6B00] hover:bg-[#FF6B00] text-[#1A1A1A] hover:text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00] group-hover:bg-white shrink-0 transition-colors duration-200" />
                  {m}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── ПРЕИМУЩЕСТВА ── */}
      {service.advantages && service.advantages.length > 0 && (
        <section className="py-16 bg-[#F5F4F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Почему выбирают нас</span>
              <h2 className="font-display text-4xl text-[#1A1A1A] tracking-wider mt-2">Преимущества</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.advantages.map(a => (
                <div key={a.title} className="bg-white rounded-2xl p-6 border border-[#E8E6E0] hover:border-[#FF6B00]/30 hover:shadow-[0_4px_24px_rgba(255,107,0,0.07)] transition-[border-color,box-shadow] duration-200">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center mb-4">
                    <SymbolIcon symbol={a.icon} size={20} className="text-[#FF6B00]" />
                  </div>
                  <h3 className="font-display text-lg text-[#1A1A1A] tracking-wide mb-2">{a.title}</h3>
                  <p className="text-sm text-[#8A8680] leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ПРАЙС ── */}
      {service.priceTables && service.priceTables.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Стоимость</span>
              <h2 className="font-display text-4xl text-[#1A1A1A] tracking-wider mt-2">Цены</h2>
              <p className="text-[#8A8680] mt-3 max-w-2xl">
                Ориентировочные тарифы. Точная стоимость — после расчёта по вашему макету.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {service.priceTables.map(table => (
                <div key={table.title} className="bg-[#F5F4F0] rounded-2xl border border-[#E8E6E0] overflow-hidden">
                  <div className="bg-[#1A1A1A] px-6 py-4">
                    <h3 className="font-display text-lg text-white tracking-wide">{table.title}</h3>
                    <span className="text-xs text-white/40 font-mono">{table.unit}</span>
                  </div>
                  <div className="divide-y divide-white">
                    {table.rows.map(row => (
                      <div key={row.label} className="flex items-center justify-between px-6 py-3">
                        <span className="text-sm text-[#2D2D2D]">{row.label}</span>
                        <span className="font-semibold text-[#FF6B00] font-mono text-sm tabular-nums">{row.price} ₽</span>
                      </div>
                    ))}
                  </div>
                  {table.note && (
                    <div className="px-6 py-3 bg-white/60 border-t border-[#E8E6E0]">
                      <p className="text-xs text-[#8A8680]">{table.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-[#8A8680]">Для точного расчёта — отправьте макет любым способом:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <a href={`${business.whatsapp.split('?')[0]}?text=${waText}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1fb855] transition-colors">
                  WhatsApp
                </a>
                <a href={`${business.telegram}?text=${waText}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#2AABEE] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1a9adc] transition-colors">
                  Telegram
                </a>
                <a href={business.max} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#2B7FFF] to-[#9B3FE8] text-white text-sm font-semibold px-4 py-2 rounded-full hover:brightness-110 transition-[filter]">
                  MAX
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ГАЛЕРЕЯ ── */}
      {portfolioPhotos.length > 0 && (
        <section className="py-16 bg-[#F5F4F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Наши работы</span>
              <h2 className="font-display text-4xl text-[#1A1A1A] tracking-wider mt-2">Примеры</h2>
            </div>
            <GalleryGrid
              gridClass="grid grid-cols-2 sm:grid-cols-3 gap-3"
              roundedClass="rounded-2xl"
              imageSizes="(max-width: 640px) 50vw, 33vw"
              itemClasses={portfolioPhotos.map((_, i) =>
                i === 0 ? 'col-span-2 sm:col-span-1 row-span-2 aspect-square sm:aspect-auto' : 'aspect-square'
              )}
              items={portfolioPhotos.map((src, i) => ({
                src,
                alt: `Изделия из фанеры и акрила — пример ${i + 1}`,
              }))}
            />
            <div className="mt-8 text-center">
              <Link href="/portfolio" className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4">
                Все работы →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── ФОРМА ЗАКАЗА ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Заявка</span>
            <h2 className="font-display text-4xl text-[#1A1A1A] tracking-wider mt-2 mb-2">Рассчитать стоимость</h2>
            <p className="text-[#8A8680]">Опишите задачу — ответим с расчётом.</p>
          </div>
          <OrderForm />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14 bg-[#F5F4F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="font-display text-3xl text-[#1A1A1A] tracking-wide">Частые вопросы</h2>
            <Link href="/faq" className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4 shrink-0">
              Все вопросы →
            </Link>
          </div>
          <FAQAccordion limit={5} categories={['order', 'prices', 'files']} />
        </div>
      </section>

      {/* ── ДРУГИЕ УСЛУГИ ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl text-[#1A1A1A] tracking-wider mb-8">Другие услуги</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {others.slice(0, 3).map(s => (
              <Link key={s.id} href={`/services/${s.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-[#2D2D2D] aspect-[16/9] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                {s.heroImage && (
                  <Image src={s.heroImage} alt={s.title} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="mb-2">
                    <SymbolIcon symbol={s.icon} size={20} className="text-[#FF6B00]" />
                  </div>
                  <h3 className="font-display text-xl text-white tracking-wide group-hover:text-[#FF6B00] transition-colors">{s.title}</h3>
                  <p className="text-xs text-white/50 mt-1">{s.shortDescription}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection dark />
    </>
  )
}
