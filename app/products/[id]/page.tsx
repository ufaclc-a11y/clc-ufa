import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { products } from '@/data/products'
import { services } from '@/data/services'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CTASection } from '@/components/CTASection'
import { OrderForm } from '@/components/OrderForm'
import { FAQAccordion } from '@/components/FAQAccordion'
import { business } from '@/data/contacts'
import { IconCheck, IconBolt, IconTarget, SymbolIcon } from '@/components/Icons'
import { getPortfolioCatId } from '@/data/products'
import { GalleryGrid } from '@/components/GalleryGrid'
import { samplePhotos } from '@/data/portfolio'
import { RichText }   from '@/components/RichText'
import { selectFaqItems, type FAQItem } from '@/data/faq'
import { SITE, localBusinessRef, aggregateRating, reviewLd, faqPageLd } from '@/lib/seo'

/** Те же категории/лимит, что у <FAQAccordion> ниже — schema совпадает с видимым блоком. */
const faqSelection: { limit: number; categories: FAQItem['category'][] } = {
  limit: 5,
  categories: ['order', 'prices', 'files'],
}

type Props = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return products.map(p => ({ id: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = products.find(p => p.id === id)
  if (!product) return {}
  return {
    title:       `${product.title} на заказ в Уфе`,
    description: product.description,
    alternates:  { canonical: `https://clc-ufa.ru/products/${product.id}` },
    openGraph: {
      title:       `${product.title} — Центр лазерной резки Уфа`,
      description: product.description,
      images:      [{ url: product.image, alt: product.alt }],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = products.find(p => p.id === id)
  if (!product) notFound()

  // Find related services based on product tags
  const relatedServices = services.filter(s =>
    product.tags.some(t =>
      s.materials.some(m => m.toLowerCase().includes(t.toLowerCase())) ||
      s.useCases.some(u => u.toLowerCase().includes(product.title.toLowerCase().split(' ')[0]))
    )
  ).slice(0, 3)

  // Find related products (different, similar tags)
  const related = products
    .filter(p => p.id !== product.id)
    .filter(p => p.tags.some(t => product.tags.includes(t)))
    .slice(0, 4)

  // Portfolio gallery
  const portfolioPhotos = samplePhotos(product.portfolioPrefix, 8)

  /* Цены из таблиц — чтобы lowPrice/highPrice в разметке совпадали с видимыми на странице. */
  const tablePrices = (product.priceTables ?? [])
    .flatMap(t => t.rows)
    .map(r => Number(r.price.replace(/\D/g, '')))
    .filter(n => n > 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'Product',
    '@id':       `${SITE}/products/${product.id}#product`,
    name:        product.title,
    description: product.description,
    image:       `${SITE}${product.image}`,
    url:         `${SITE}/products/${product.id}`,
    category:    product.category,
    material:    product.tags,
    brand: {
      '@type': 'Brand',
      name:    'Центр лазерной резки',
    },
    manufacturer: localBusinessRef,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'minimumOrder', value: '400 RUB' },
      { '@type': 'PropertyValue', name: 'productionTime', value: '1-3 days' },
      { '@type': 'PropertyValue', name: 'city', value: business.city },
      ...(product.popularFor ? [{ '@type': 'PropertyValue', name: 'popularFor', value: product.popularFor }] : []),
    ],
    offers: {
      // Цена индивидуальная (по макету), заказ от 400 ₽ — выражаем через AggregateOffer/lowPrice.
      // offerCount: одна позиция под заказ у одного продавца.
      '@type':        'AggregateOffer',
      priceCurrency:  'RUB',
      lowPrice:       tablePrices.length ? String(Math.min(...tablePrices)) : '400',
      ...(tablePrices.length ? { highPrice: String(Math.max(...tablePrices)) } : {}),
      offerCount:     tablePrices.length || 1,
      availability:   'https://schema.org/InStock',
      url:            `${SITE}/products/${product.id}`,
      seller: {
        '@type': 'Organization',
        name:    'Центр лазерной резки',
      },
    },
    aggregateRating,
    review: reviewLd,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd(selectFaqItems(faqSelection))) }}
      />

      <div className="pt-24 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Breadcrumbs items={[
            { label: 'Изделия', href: '/products' },
            { label: product.title },
          ]} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Photo */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#2D2D2D] sticky top-24">
              <Image
                src={product.image}
                alt={product.alt}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Info */}
            <div>
              {product.popularFor && (
                <div className="inline-flex items-center gap-2 bg-[#FF6B00]/10 rounded-full px-3 py-1 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" aria-hidden="true" />
                  <span className="text-xs font-semibold text-[#FF6B00]">{product.popularFor}</span>
                </div>
              )}

              <h1 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mb-4 leading-[1.1]">
                {product.title}
              </h1>

              <p className="text-lg text-[#2D2D2D] leading-[1.75] mb-6">{product.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.map(tag => (
                  <span key={tag} className="text-sm px-3 py-1.5 bg-white border border-[#E8E6E0] rounded-full text-[#6E6A64]">
                    {tag}
                  </span>
                ))}
              </div>


              {/* Trust signals */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { Icon: IconCheck,  text: 'От 1 штуки' },
                  { Icon: IconBolt,   text: 'Срок от 1 дня' },
                  { Icon: IconTarget, text: 'По вашему макету' },
                ].map(s => (
                  <div key={s.text} className="bg-white rounded-xl p-3 text-center border border-[#E8E6E0]">
                    <div className="flex justify-center mb-1">
                      <s.Icon size={18} className="text-[#FF6B00]" />
                    </div>
                    <div className="text-xs text-[#6E6A64] leading-tight">{s.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body text + Materials + How to order */}
      {(product.body || product.materials?.length || product.howToOrder) && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

              {/* Body + How to order */}
              {(product.body || product.howToOrder) && (
                <div>
                  {product.body && (
                    <div className="space-y-4 text-[#2D2D2D] leading-[1.75] mb-8">
                      <RichText text={product.body} paragraphs className="text-[#2D2D2D] leading-[1.75]" />
                    </div>
                  )}
                  {product.howToOrder && (
                    <div className="bg-[#F5F4F0] rounded-2xl p-6 border border-[#E8E6E0]">
                      <h2 className="font-display text-xl text-[#1A1A1A] tracking-wide mb-3">Как заказать</h2>
                      <p className="text-sm text-[#2D2D2D] leading-[1.75]">
                        <RichText text={product.howToOrder} />
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Materials */}
              {product.materials && product.materials.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">Материалы</h2>
                  <div className="space-y-4">
                    {product.materials.map(m => (
                      <div key={m.name} className="bg-[#F5F4F0] rounded-xl p-5 border border-[#E8E6E0]">
                        <h3 className="font-semibold text-[#1A1A1A] mb-1">{m.name}</h3>
                        <p className="text-sm text-[#6E6A64] leading-[1.7]">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* Прайс */}
      {product.priceTables && product.priceTables.length > 0 && (
        <section className="py-14 bg-[#F5F4F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">Цены</h2>
            <div className={`grid grid-cols-1 gap-6 ${
              product.priceTables.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'max-w-md'
            }`}>
              {product.priceTables.map(table => (
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
            <p className="text-sm text-[#6E6A64] mt-6">
              Цены ориентировочные. Точную стоимость рассчитаем по вашему макету.
            </p>
          </div>
        </section>
      )}

      {/* Related services */}
      {relatedServices.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">Используемые технологии</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedServices.map(s => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="group bg-[#F5F4F0] rounded-xl p-5 border border-[#E8E6E0] hover:border-[#FF6B00]/40 hover:bg-white transition-[border-color,background-color]"
                >
                  <div className="mb-2">
                    <SymbolIcon symbol={s.icon} size={22} className="text-[#FF6B00]" />
                  </div>
                  <h3 className="font-display text-lg text-[#1A1A1A] tracking-wide mb-1 group-hover:text-[#FF6B00] transition-colors">
                    {s.shortTitle}
                  </h3>
                  <p className="text-xs text-[#6E6A64] leading-relaxed">{s.shortDescription}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {portfolioPhotos.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">Примеры работ</h2>
            <GalleryGrid
              items={portfolioPhotos.map((src, i) => ({
                src,
                alt: `${product.title} — пример ${i + 1}`,
              }))}
            />
            {/* Ссылка внизу — пользователь долистал до конца примеров */}
            <div className="mt-6 text-center">
              <Link
                href={`/portfolio?cat=${getPortfolioCatId(product.portfolioPrefix)}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4"
              >
                Смотреть все работы в этой категории →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Order form */}
      <section className="py-16 bg-[#F5F4F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl text-[#1A1A1A] tracking-wider mb-2">Оформить заказ</h2>
          <p className="text-[#6E6A64] mb-8">Опишите детали — ответим с расчётом стоимости.</p>
          <OrderForm />
        </div>
      </section>

      {/* FAQ block */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide">Частые вопросы</h2>
            <Link href="/faq" className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4">
              Все вопросы →
            </Link>
          </div>
          <FAQAccordion limit={faqSelection.limit} categories={faqSelection.categories} />
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="py-14 bg-[#F5F4F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">Похожие изделия</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group relative aspect-square rounded-xl overflow-hidden block bg-[#2D2D2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                >
                  <Image
                    src={p.image}
                    alt={p.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="text-xs font-semibold text-white group-hover:text-[#FF6B00] transition-colors leading-snug">
                      {p.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection dark />
    </>
  )
}
