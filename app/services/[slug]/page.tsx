import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound }       from 'next/navigation'
import { services }       from '@/data/services'
import { business }       from '@/data/contacts'
import { Breadcrumbs }    from '@/components/Breadcrumbs'
import { OrderForm }      from '@/components/OrderForm'
import { CTASection }     from '@/components/CTASection'
import { FAQAccordion }   from '@/components/FAQAccordion'
import { SymbolIcon }     from '@/components/Icons'
import { GalleryGrid }   from '@/components/GalleryGrid'
import { RichText }      from '@/components/RichText'
import { samplePhotos, firstPhoto } from '@/data/portfolio'
import { selectFaqItems, type FAQItem } from '@/data/faq'
import { SITE, localBusinessRef, faqPageLd } from '@/lib/seo'

/** Те же категории/лимит, что у <FAQAccordion> ниже — schema совпадает с видимым блоком. */
const faqSelection: { limit: number; categories: FAQItem['category'][] } = {
  limit: 5,
  categories: ['order', 'prices', 'files'],
}

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return services.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const s = services.find(s => s.slug === slug)
  if (!s) return {}
  return {
    title:       s.seoTitle,
    description: s.seoDescription,
    keywords:    s.keywords,
    alternates:  { canonical: `https://clc-ufa.ru/services/${s.slug}` },
    openGraph: {
      title:  s.seoTitle,
      description: s.seoDescription,
      images: s.heroImage ? [{ url: s.heroImage }] : [],
    },
  }
}

/** Генерирует массив путей к фото из портфолио для данной услуги */
function getPortfolioPhotos(service: {
  portfolioPrefix?: string
  portfolioCount?: number
  portfolioPrefixes?: { prefix: string; count: number }[]
  portfolioPhotos?: string[]
}): string[] {
  if (service.portfolioPhotos?.length) {
    return service.portfolioPhotos
  }
  if (service.portfolioPrefixes?.length) {
    return service.portfolioPrefixes.flatMap(cat => firstPhoto(cat.prefix) ?? [])
  }
  return samplePhotos(service.portfolioPrefix, 9)
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const service = services.find(s => s.slug === slug)
  if (!service) notFound()

  const others = services.filter(s => s.slug !== service.slug)

  const portfolioPhotos = getPortfolioPhotos(service)

  const waText = encodeURIComponent(
    `Здравствуйте! Интересует услуга: ${service.title}. Подскажите стоимость.`
  )

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type':    'Service',
    '@id':       `${SITE}/services/${service.slug}#service`,
    name:        service.title,
    serviceType: service.title,
    description: service.description,
    url:         `${SITE}/services/${service.slug}`,
    mainEntityOfPage: `${SITE}/services/${service.slug}`,
    ...(service.heroImage ? { image: `${SITE}${service.heroImage}` } : {}),
    provider:    localBusinessRef,
    areaServed:  { '@type': 'City', name: 'Уфа' },
    // aggregateRating на Service не вешаем: Google не поддерживает Service как
    // itemReviewed для review snippets и ругается «Invalid object type <parent_node>».
    // Рейтинг бизнеса живёт на LocalBusiness в layout.
    category:    service.materials,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'minimumOrder', value: '400 RUB' },
      { '@type': 'PropertyValue', name: 'productionTime', value: '1-3 days' },
      { '@type': 'PropertyValue', name: 'rushProduction', value: 'from 1 hour' },
      { '@type': 'PropertyValue', name: 'acceptedFiles', value: 'DXF, SVG, CDR, AI, PDF' },
    ],
    ...(service.priceTables?.length
      ? {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'RUB',
            lowPrice: '400',
            availability: 'https://schema.org/InStock',
            url: `${SITE}/services/${service.slug}`,
          },
        }
      : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd(selectFaqItems(faqSelection))) }} />
      {/* ── HERO ── */}
      <div className="relative min-h-[560px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        <div className="absolute inset-0">
          {service.heroVideo ? (
            <video
              src={service.heroVideo}
              poster={service.heroImage}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover opacity-40"
            />
          ) : service.heroImage ? (
            <Image
              src={service.heroImage}
              alt={service.title}
              fill
              priority
              className="object-cover opacity-30"
              sizes="100vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/95 via-[#1A1A1A]/70 to-[#1A1A1A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 w-full">
          <Breadcrumbs
            items={[{ label: 'Услуги', href: '/services' }, { label: service.title }]}
            darkMode
          />

          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Услуга</span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white tracking-wider mt-2 mb-5 leading-[1] max-w-3xl">
            {service.h1}
          </h1>
          <p className="text-lg text-white/55 max-w-2xl leading-relaxed mb-10">
            {service.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/79374838003?text=${waText}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3.5 rounded-full hover:bg-[#1da857] transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.3)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.525 5.848L.057 23.944l6.244-1.637A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.359-.213-3.706.972.988-3.612-.234-.37A9.818 9.818 0 1112 21.818z"/></svg>
              WhatsApp
            </a>
            <a
              href={`https://t.me/clcufa?text=${waText}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2AABEE] text-white font-semibold px-6 py-3.5 rounded-full hover:bg-[#1a9adc] transition-colors"
            >
              Telegram
            </a>
            <a
              href={business.max}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2B7FFF] to-[#9B3FE8] text-white font-semibold px-6 py-3.5 rounded-full hover:brightness-110 transition-[filter]"
            >
              MAX
            </a>
            <a
              href={`tel:+79374838003`}
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/15 border border-white/15 transition-colors"
            >
              Позвонить
            </a>
          </div>
        </div>
      </div>

      {/* ── СТАТЫ ── */}
      {service.stats && (
        <div className="bg-[#FF6B00]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/20">
              {service.stats.map(s => (
                <div key={s.label} className="py-7 px-6 text-center">
                  <div className="font-display text-3xl sm:text-4xl text-white tracking-wider leading-none mb-1">
                    {s.value}
                  </div>
                  <div className="text-sm text-white/80 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ТЕЛО / SEO-ТЕКСТ ── */}
      {service.bodyText && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <p className="text-lg text-[#2D2D2D] leading-[1.85]"><RichText text={service.bodyText} /></p>
          </div>
        </section>
      )}

      {/* ── АССОРТИМЕНТ (только если есть featuredProducts) ── */}
      {service.featuredProducts && service.featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Ассортимент</span>
              <h2 className="font-display text-4xl text-[#1A1A1A] tracking-wider mt-2">
                Что мы изготавливаем
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {service.featuredProducts.map(p => (
                <div
                  key={p.image}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-[#2D2D2D]"
                >
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <p className="text-white text-sm font-semibold leading-tight">{p.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── МАТЕРИАЛЫ + ЧТО ДЕЛАЕМ ── */}
      <section className="py-20 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">

          {/* Материалы */}
          <div>
            <div className="mb-5">
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Работаем с</span>
              <h2 className="font-display text-3xl text-[#1A1A1A] tracking-wider mt-1">Материалы</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {service.materials.map(m => {
                const href = service.materialLinks?.[m] ?? `/services/${service.slug}`
                return (
                  <Link
                    key={m}
                    href={href}
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

          {/* Что изготавливаем */}
          {!service.featuredProducts?.length && (
            <div>
              <div className="mb-5">
                <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Применение</span>
                <h2 className="font-display text-3xl text-[#1A1A1A] tracking-wider mt-1">{service.useCasesTitle ?? 'Что изготавливаем'}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {service.useCases.map(u => {
                  const href = service.useCaseLinks?.[u] ?? `/services/${service.slug}`
                  return (
                    <Link
                      key={u}
                      href={href}
                      className="group flex items-center justify-between gap-3 bg-white border border-[#E8E6E0] hover:border-[#FF6B00] px-5 py-4 rounded-xl text-sm font-semibold text-[#2D2D2D] hover:text-[#FF6B00] transition-all duration-200"
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                        {u}
                      </span>
                      <span className="text-[#FF6B00] translate-x-0 group-hover:translate-x-1 transition-transform duration-200 shrink-0">→</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── ПРЕИМУЩЕСТВА ── */}
      {service.advantages && service.advantages.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Почему выбирают нас</span>
              <h2 className="font-display text-4xl text-[#1A1A1A] tracking-wider mt-2">
                Преимущества
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.advantages.map(a => (
                <div key={a.title} className="bg-[#F5F4F0] rounded-2xl p-6 border border-[#E8E6E0] hover:border-[#FF6B00]/30 hover:shadow-[0_4px_24px_rgba(255,107,0,0.07)] transition-[border-color,box-shadow] duration-200">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center mb-4">
                    <SymbolIcon symbol={a.icon} size={20} className="text-[#FF6B00]" />
                  </div>
                  <h3 className="font-display text-lg text-[#1A1A1A] tracking-wide mb-2">{a.title}</h3>
                  <p className="text-sm text-[#6E6A64] leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ПРАЙС ── */}
      {service.priceTables && service.priceTables.length > 0 && (
        <section className="py-16 bg-[#F5F4F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Стоимость</span>
              <h2 className="font-display text-4xl text-[#1A1A1A] tracking-wider mt-2">Цены</h2>
              <p className="text-[#6E6A64] mt-3 max-w-2xl">
                Точная стоимость рассчитывается по вашему макету — зависит от длины реза,
                материала и тиража. Ниже — ориентировочные тарифы.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.priceTables.map(table => (
                <div key={table.title} className="bg-white rounded-2xl border border-[#E8E6E0] overflow-hidden">
                  {/* Шапка */}
                  <div className="bg-[#1A1A1A] px-6 py-4">
                    <h3 className="font-display text-lg text-white tracking-wide">{table.title}</h3>
                    <span className="text-xs text-white/40 font-mono">{table.unit}</span>
                  </div>
                  {/* Строки */}
                  <div className="divide-y divide-[#F5F4F0]">
                    {table.rows.map(row => (
                      <div key={row.label} className="flex items-center justify-between px-6 py-3">
                        <span className="text-sm text-[#2D2D2D]">{row.label}</span>
                        <span className="font-semibold text-[#FF6B00] font-mono text-sm tabular-nums">
                          {row.price} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Сноска */}
                  {table.note && (
                    <div className="px-6 py-3 bg-[#F5F4F0] border-t border-[#E8E6E0]">
                      <p className="text-xs text-[#6E6A64]">{table.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Дисклеймер */}
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-[#6E6A64]">
                Цены ориентировочные. Для точного расчёта — отправьте макет любым способом:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <a href={`${business.whatsapp.split('?')[0]}?text=${encodeURIComponent('Здравствуйте! Хочу узнать точную стоимость.')}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1fb855] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href={`${business.telegram}?text=${encodeURIComponent('Здравствуйте! Хочу узнать точную стоимость.')}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#2AABEE] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1a9adc] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
                <a href={business.max} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#2B7FFF] to-[#9B3FE8] text-white text-sm font-semibold px-4 py-2 rounded-full hover:brightness-110 transition-[filter]">
                  MAX
                </a>
                <a href={`mailto:${business.email}?subject=${encodeURIComponent('Запрос стоимости')}`}
                  className="inline-flex items-center gap-1.5 bg-[#1A1A1A]/8 text-[#1A1A1A] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1A1A1A]/15 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  Написать на почту
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ГАЛЕРЕЯ РАБОТ ── */}
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
                i === 0
                  ? 'col-span-2 sm:col-span-1 row-span-2 aspect-square sm:aspect-auto'
                  : 'aspect-square'
              )}
              items={portfolioPhotos.map((src, i) => ({
                src,
                alt: `${service.title} — пример работы ${i + 1}`,
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
            <h2 className="font-display text-4xl text-[#1A1A1A] tracking-wider mt-2 mb-2">
              Рассчитать стоимость
            </h2>
            <p className="text-[#6E6A64]">Опишите задачу — ответим с расчётом.</p>
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
          <FAQAccordion limit={faqSelection.limit} categories={faqSelection.categories} />
        </div>
      </section>

      {/* ── ДРУГИЕ УСЛУГИ ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl text-[#1A1A1A] tracking-wider mb-8">Другие услуги</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {others.slice(0, 3).map(s => (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-[#2D2D2D] aspect-[16/9] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                {s.heroImage && (
                  <Image
                    src={s.heroImage}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="mb-2">
                    <SymbolIcon symbol={s.icon} size={20} className="text-[#FF6B00]" />
                  </div>
                  <h3 className="font-display text-xl text-white tracking-wide group-hover:text-[#FF6B00] transition-colors">
                    {s.title}
                  </h3>
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
