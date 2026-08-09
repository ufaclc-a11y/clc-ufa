import type { Metadata } from 'next'
import Image           from 'next/image'
import Link            from 'next/link'
import { notFound }    from 'next/navigation'
import { shopItems, shopItemBySlug } from '@/data/shop'
import { shopDescriptions } from '@/data/shop-descriptions.generated'
import { Breadcrumbs }  from '@/components/Breadcrumbs'
import { CTASection }   from '@/components/CTASection'
import { GalleryGrid }  from '@/components/GalleryGrid'
import { RichText }     from '@/components/RichText'
import { business }     from '@/data/contacts'
import { SITE, localBusinessRef } from '@/lib/seo'
import { IconCheck, IconBolt, IconTarget } from '@/components/Icons'
import { AddToCart }  from '@/components/AddToCart'

type Props = { params: { slug: string } }

/*
 * ShopItem.desc — жёсткий срез ~250 символов из выгрузки WB, он рвётся на
 * полуслове («…Сочный жёлты»). Для карточки в списке это скрыто обрезкой по
 * строкам, но в тексте страницы и в сниппете выдачи выглядит браком, поэтому
 * здесь берём текст из полного описания.
 */

/** Первый абзац полного описания — вводный текст под заголовком. */
function leadParagraph(full: string, fallback: string): string {
  const first = full.split('\n\n').map(p => p.trim()).find(Boolean)
  return first || fallback
}

/** Аккуратная обрезка по границе слова — для <meta description>. */
function metaDescription(full: string, fallback: string, max = 160): string {
  const text = full.replace(/\s+/g, ' ').trim() || fallback
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[.,;:—-]+$/, '')}…`
}

/*
 * Все товары известны на этапе билда. Флаг обязателен: app/shop/loading.tsx
 * распространяется на этот сегмент, и без него Next начнёт стримить ответ со
 * статусом 200 раньше, чем сработает notFound() — несуществующий товар отдавал
 * бы soft-404 (та же ловушка, что была в app/portfolio/[category]).
 */
export const dynamicParams = false

export function generateStaticParams() {
  return shopItems.map(item => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = shopItemBySlug(params.slug)
  if (!item) notFound()

  const title = `${item.title} — купить в Уфе | Центр лазерной резки`
  const description = metaDescription(shopDescriptions[item.id] ?? '', item.desc)
  return {
    title,
    description,
    alternates:  { canonical: `${SITE}/shop/${item.slug}` },
    openGraph: {
      title,
      description,
      images:      item.images.map(src => ({ url: `${SITE}${src}` })),
    },
  }
}

/** «77 × 25 × 2 см» из габаритов упаковки, если они заполнены. */
function packSize(item: ReturnType<typeof shopItemBySlug>) {
  const p = item?.packaging
  if (!p?.packLengthCm || !p?.packWidthCm || !p?.packHeightCm) return null
  return `${p.packLengthCm} × ${p.packWidthCm} × ${p.packHeightCm} см`
}

export default function ShopProductPage({ params }: Props) {
  const item = shopItemBySlug(params.slug)
  if (!item) notFound()

  const fullDesc = shopDescriptions[item.id] ?? item.desc
  const size     = packSize(item)
  const weight   = item.packaging?.weightGrams
  const gallery  = item.images.slice(1)

  const waText = encodeURIComponent(
    `Здравствуйте! Хочу заказать: ${item.title} (артикул ${item.sku}) — ${item.price.toLocaleString('ru-RU')} ₽.`,
  )

  /*
   * aggregateRating сознательно не добавляем: отзывы на сайте относятся к
   * мастерской в целом, а не к конкретному товару. Привязывать их к SKU с
   * ценой — прямой путь к санкциям за недостоверную разметку.
   */
  const productLd = {
    '@context':   'https://schema.org',
    '@type':      'Product',
    '@id':        `${SITE}/shop/${item.slug}#product`,
    name:         item.title,
    description:  metaDescription(fullDesc, item.desc, 300),
    sku:          item.sku,
    image:        item.images.map(src => `${SITE}${src}`),
    url:          `${SITE}/shop/${item.slug}`,
    category:     item.categoryName,
    brand:        { '@type': 'Brand', name: 'Центр лазерной резки' },
    manufacturer: localBusinessRef,
    ...(weight ? { weight: { '@type': 'QuantitativeValue', value: weight, unitCode: 'GRM' } } : {}),
    offers: {
      '@type':        'Offer',
      priceCurrency:  'RUB',
      price:          String(item.price),
      availability:   item.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url:            `${SITE}/shop/${item.slug}`,
      itemCondition:  'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Центр лазерной резки' },
    },
  }

  const related = shopItems
    .filter(i => i.category === item.category && i.id !== item.id)
    .slice(0, 5)

  return (
    <>
      {/* BreadcrumbList отдаёт сам <Breadcrumbs> ниже — второй здесь был бы дублем. */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />

      <div className="pt-24 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Breadcrumbs items={[
            { label: 'Магазин', href: '/shop' },
            { label: item.title },
          ]} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* ── Фото ── */}
            <div className="lg:sticky lg:top-24">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-[#E8E6E0]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {gallery.length > 0 && (
                <div className="mt-4">
                  <GalleryGrid
                    items={gallery.map((src, i) => ({
                      src,
                      alt: `${item.title} — фото ${i + 2}`,
                    }))}
                    gridClass="grid grid-cols-4 sm:grid-cols-5 gap-3"
                    aspectClass="aspect-square"
                    imageSizes="120px"
                  />
                </div>
              )}
            </div>

            {/* ── Описание и цена ── */}
            <div>
              <p className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase mb-2">
                {item.categoryName}
              </p>

              <h1 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mb-4 leading-[1.1]">
                {item.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="font-display text-4xl text-[#1A1A1A] tracking-wider tabular-nums">
                  {item.price.toLocaleString('ru-RU')} ₽
                </span>
                <span className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full ${
                  item.inStock
                    ? 'bg-[#1F9D55]/10 text-[#1F9D55]'
                    : 'bg-[#6E6A64]/10 text-[#6E6A64]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    item.inStock ? 'bg-[#1F9D55]' : 'bg-[#6E6A64]'
                  }`} aria-hidden="true" />
                  {item.inStock ? 'В наличии' : 'Под заказ'}
                </span>
              </div>

              <p className="text-lg text-[#2D2D2D] leading-[1.75] mb-8">
                {leadParagraph(fullDesc, item.desc)}
              </p>

              <div className="mb-6">
                <AddToCart id={item.id} inStock={item.inStock} />
              </div>

              {/* Мессенджеры — запасной путь для тех, кому проще написать. */}
              <div className="flex flex-wrap gap-3 mb-8">
                <a
                  href={`${business.whatsapp.split('?')[0]}?text=${waText}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full
                    hover:bg-[#1fb855] active:bg-[#1aa34a] transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2
                    shadow-[0_2px_12px_rgba(37,211,102,0.3)]"
                >
                  Заказать в WhatsApp
                </a>
                <a
                  href={`${business.telegram}?text=${waText}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#2AABEE] text-white font-semibold px-6 py-3 rounded-full
                    hover:bg-[#1a9adc] active:bg-[#1589c7] transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2AABEE] focus-visible:ring-offset-2"
                >
                  Telegram
                </a>
              </div>

              {/* Характеристики */}
              <dl className="border-t border-[#E8E6E0] divide-y divide-[#E8E6E0] mb-8">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-[#6E6A64]">Артикул</dt>
                  <dd className="text-sm text-[#1A1A1A] font-mono">{item.sku}</dd>
                </div>
                {size && (
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-sm text-[#6E6A64]">Размер упаковки</dt>
                    <dd className="text-sm text-[#1A1A1A] tabular-nums">{size}</dd>
                  </div>
                )}
                {weight && (
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-sm text-[#6E6A64]">Вес с упаковкой</dt>
                    <dd className="text-sm text-[#1A1A1A] tabular-nums">
                      {weight >= 1000 ? `${(weight / 1000).toFixed(1)} кг` : `${weight} г`}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-[#6E6A64]">Категория</dt>
                  <dd className="text-sm text-[#1A1A1A]">{item.categoryName}</dd>
                </div>
              </dl>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: IconCheck,  text: 'Своё производство' },
                  { Icon: IconBolt,   text: 'Отправка 1–3 дня'  },
                  { Icon: IconTarget, text: 'Возможен свой макет' },
                ].map(s => (
                  <div key={s.text} className="bg-white rounded-xl p-3 text-center border border-[#E8E6E0]">
                    <div className="flex justify-center mb-1">
                      <s.Icon size={18} className="text-[#FF6B00]" />
                    </div>
                    <div className="text-xs text-[#6E6A64] leading-tight">{s.text}</div>
                  </div>
                ))}
              </div>

              {/* Wildberries — вторичный канал */}
              <a
                href={item.wbUrl}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-sm text-[#6E6A64]
                  hover:text-[#CB11AB] transition-colors underline underline-offset-4
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CB11AB] rounded"
              >
                Этот товар также есть на Wildberries →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Полное описание ── */}
      {fullDesc && (
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">Описание</h2>
            <RichText text={fullDesc} paragraphs className="text-[#2D2D2D] leading-[1.75]" />
          </div>
        </section>
      )}

      {/* ── Похожие товары ── */}
      {related.length > 0 && (
        <section className="py-14 bg-[#F5F4F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide">
                Похожие товары
              </h2>
              <Link href="/shop" className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4">
                Весь магазин →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {related.map(r => (
                <Link
                  key={r.id}
                  href={`/shop/${r.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-[#E8E6E0]
                    hover:border-[#FF6B00]/40 transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                >
                  <div className="relative aspect-square bg-white">
                    <Image
                      src={r.image}
                      alt={r.title}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-[#2D2D2D] leading-snug line-clamp-2 mb-1">{r.title}</p>
                    <p className="font-display text-base text-[#1A1A1A] tracking-wide tabular-nums">
                      {r.price.toLocaleString('ru-RU')} ₽
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
