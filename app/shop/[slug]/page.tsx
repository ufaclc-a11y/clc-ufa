import type { Metadata } from 'next'
import Image           from 'next/image'
import Link            from 'next/link'
import { notFound }    from 'next/navigation'
import { shopItems, shopItemBySlug } from '@/data/shop'
import { shopDescriptions } from '@/data/shop-descriptions.generated'
import { Breadcrumbs }  from '@/components/Breadcrumbs'
import { GalleryGrid }  from '@/components/GalleryGrid'
import { RichText }     from '@/components/RichText'
import { SITE, localBusinessRef } from '@/lib/seo'
import { IconCheck, IconBolt, IconTarget } from '@/components/Icons'
import { AddToCart }  from '@/components/AddToCart'
import { ProductContactActions } from '@/components/ProductContactActions'
import { ProductDeliveryPreview } from '@/components/ProductDeliveryPreview'
import { ProductStickyCart } from '@/components/ProductStickyCart'
import { descriptionAfterLead, getProductFacts } from '@/lib/shop-product-facts'

type Props = { params: Promise<{ slug: string }> }

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
  const { slug } = await params
  const item = shopItemBySlug(slug)
  if (!item) notFound()

  const title = `${item.title} — купить в Уфе`
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

export default async function ShopProductPage({ params }: Props) {
  const { slug } = await params
  const item = shopItemBySlug(slug)
  if (!item) notFound()

  const fullDesc = shopDescriptions[item.id] ?? item.desc
  const size     = packSize(item)
  const weight   = item.packaging?.weightGrams
  const productFacts = getProductFacts({
    title: item.title,
    description: fullDesc,
    category: item.categoryName,
    sku: item.sku,
  })
  const detailedDescription = descriptionAfterLead(fullDesc)

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

      <div className="shop-marketplace">
      <div className="bg-[#F5F6F9]">
        <div className="mx-auto max-w-[1480px] px-4 py-7 sm:px-6 sm:py-9">
          <Breadcrumbs items={[
            { label: 'Магазин', href: '/shop' },
            { label: item.categoryName, href: `/shop?category=${item.category}#catalog` },
            { label: item.title },
          ]} visual />

          <section id="product-primary-buy" className="mb-5 rounded-2xl bg-white p-5 shadow-[0_10px_28px_rgba(37,31,49,0.07)] lg:hidden" aria-label="Краткая информация о товаре">
            <h1 className="text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[#17181B] sm:text-4xl">
              {item.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-extrabold tracking-[-0.03em] tabular-nums text-[#17181B]">
                {item.price.toLocaleString('ru-RU')} ₽
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                item.inStock ? 'bg-[#1F9D55]/10 text-[#1F9D55]' : 'bg-[#6E6A64]/10 text-[#6E6A64]'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${item.inStock ? 'bg-[#1F9D55]' : 'bg-[#6E6A64]'}`} aria-hidden="true" />
                {item.inStock ? 'В наличии' : 'Под заказ'}
              </span>
            </div>
            <div className="mt-5">
              <AddToCart id={item.id} inStock={item.inStock} />
            </div>
          </section>

          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,.92fr)] lg:gap-9">
            {/* ── Фото ── */}
            <div className="lg:sticky lg:top-[174px]">
              <GalleryGrid
                items={item.images.map((src, i) => ({
                  src,
                  alt: i === 0 ? item.title : `${item.title} — фото ${i + 1}`,
                }))}
                gridClass="grid grid-cols-5 gap-3"
                itemClasses={item.images.map((_, i) => i === 0
                  ? 'col-span-5 aspect-[3/4] shadow-[0_12px_32px_rgba(39,32,56,0.08)]'
                  : 'aspect-[3/4]')}
                aspectClass="aspect-[3/4]"
                roundedClass="rounded-2xl"
                imageSizes="(max-width: 1024px) 100vw, 50vw"
                imageClassName="object-contain"
                surfaceClassName="bg-white"
                priorityFirst
              />
            </div>

            {/* ── Описание и цена ── */}
            <div className="rounded-2xl bg-white p-5 shadow-[0_12px_32px_rgba(39,32,56,0.08)] sm:p-8">
              <h1 className="mb-5 hidden text-4xl font-extrabold leading-tight tracking-[-0.035em] text-[#17181B] lg:block xl:text-5xl">
                {item.title}
              </h1>

              <div className="mb-6 hidden flex-wrap items-center gap-4 lg:flex">
                <span className="text-4xl font-extrabold tracking-[-0.03em] tabular-nums text-[#17181B]">
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

              <p className="mb-7 text-base leading-7 text-[#4F515A] sm:text-lg">
                {leadParagraph(fullDesc, item.desc)}
              </p>

              <div id="product-primary-buy-desktop" className="mb-7 hidden lg:block">
                <AddToCart id={item.id} inStock={item.inStock} />
              </div>

              {/* Характеристики */}
              <h2 className="text-lg font-extrabold text-[#25262B]">Характеристики товара</h2>
              <dl className="mb-7 mt-2 divide-y divide-[#E6E7EC] border-y border-[#E6E7EC]">
                {productFacts.map(fact => (
                  <div key={fact.label} className="flex justify-between gap-4 py-3">
                    <dt className="text-sm text-[#62646D]">{fact.label}</dt>
                    <dd className="max-w-[62%] text-right text-sm font-semibold text-[#1A1A1A]">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              {(size || weight) && (
                <section className="mb-7" aria-labelledby="packaging-title">
                  <h2 id="packaging-title" className="text-base font-extrabold text-[#25262B]">Упаковка для доставки</h2>
                  <p className="mt-1 text-xs leading-5 text-[#62646D]">Эти габариты относятся к посылке, а не к самому изделию.</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2">
                    {size && (
                      <div className="rounded-xl bg-[#F7F7FA] px-4 py-3">
                        <dt className="text-xs font-semibold text-[#62646D]">Габариты посылки</dt>
                        <dd className="mt-1 text-sm font-bold tabular-nums text-[#2A2B30]">{size}</dd>
                      </div>
                    )}
                    {weight && (
                      <div className="rounded-xl bg-[#F7F7FA] px-4 py-3">
                        <dt className="text-xs font-semibold text-[#62646D]">Вес посылки</dt>
                        <dd className="mt-1 text-sm font-bold tabular-nums text-[#2A2B30]">
                          {weight >= 1000 ? `${(weight / 1000).toFixed(1)} кг` : `${weight} г`}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}

              <ProductDeliveryPreview itemId={item.id} />

              <ProductContactActions id={item.id} title={item.title} sku={item.sku} price={item.price} />

              <div className="grid grid-cols-1 gap-1 border-y border-[#E6E7EC] py-2 sm:grid-cols-3 sm:divide-x sm:divide-[#E6E7EC]">
                {[
                  { Icon: IconCheck,  text: 'Своё производство' },
                  { Icon: IconBolt,   text: 'Отправка 1–3 дня'  },
                  { Icon: IconTarget, text: 'Возможен свой макет' },
                ].map(s => (
                  <div key={s.text} className="flex items-center gap-2 px-3 py-2 sm:flex-col sm:text-center">
                    <div className="flex justify-center mb-1">
                      <s.Icon size={18} className="text-[#FF5A00]" />
                    </div>
                    <div className="text-xs font-semibold leading-tight text-[#62646D]">{s.text}</div>
                  </div>
                ))}
              </div>

              {/* Wildberries — вторичный канал */}
              <a
                href={item.wbUrl}
                target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded text-sm text-[#62646D] underline decoration-[#C9CBD3] underline-offset-4 transition-colors hover:text-[#34353B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                Этот товар также есть на Wildberries →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Полное описание ── */}
      {detailedDescription && (
        <section className="bg-white py-14 sm:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="mb-6 text-2xl font-extrabold tracking-[-0.025em] text-[#17181B]">Описание</h2>
            <RichText text={detailedDescription} paragraphs className="text-[#2D2D2D] leading-[1.75]" />
          </div>
        </section>
      )}

      {/* ── Похожие товары ── */}
      {related.length > 0 && (
        <section className="bg-[#F5F6F9] py-14">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6">
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2 className="text-2xl font-extrabold tracking-[-0.025em] text-[#17181B]">
                Похожие товары
              </h2>
              <Link href="/shop" className="inline-flex min-h-11 items-center rounded text-sm font-semibold text-[#9D3900] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">
                Весь магазин →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {related.map(r => (
                <Link
                  key={r.id}
                  href={`/shop/${r.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-[0_8px_22px_rgba(45,37,58,0.07)]
                    transition-[box-shadow] hover:shadow-[0_14px_30px_rgba(45,37,58,0.12)]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                >
                  <div className="relative aspect-[3/4] bg-white">
                    <Image
                      src={r.image}
                      alt={r.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-[#2D2D2D] leading-snug line-clamp-2 mb-1">{r.title}</p>
                    <p className="text-lg font-extrabold tracking-[-0.02em] tabular-nums text-[#17181B]">
                      {r.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-[#E5E6EB] bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">Нужно изделие по вашему макету?</h2>
            <p className="mt-2 text-[#62646D]">Расскажите о задаче — подберём материал и рассчитаем изготовление.</p>
          </div>
          <Link href="/contacts" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#C94700] px-6 text-sm font-bold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#B13E00] active:translate-y-0 active:bg-[#9D3700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2">Оставить заявку</Link>
        </div>
      </section>
      <ProductStickyCart id={item.id} price={item.price} inStock={item.inStock} />
      </div>
    </>
  )
}
