'use client'

/*
THESIS: CLC feels as immediate as a familiar marketplace while keeping products, not promotions, in command.
OWN-WORLD: porcelain surfaces, soft lavender fields, precise cool lines, large ink prices, and CLC orange actions.
STORY: search or choose a category, scan real 3:4 product photography, add an item, continue to checkout.
FIRST VIEWPORT: compact maker banner above a sidebar-led dense catalog; products begin before the fold.
FORM: approved marketplace canon, hybrid A+B, seed canon-marketplace-a-b-3x4.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
*/

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { shopItems, shopCategories, type ShopItem } from '@/data/shop'
import { useCart } from '@/lib/cart'

const showcase = [355794658, 293800230, 234003775, 874246986]
  .map(id => shopItems.find(item => item.id === id))
  .filter((item): item is ShopItem => Boolean(item))

export function ShopClient() {
  const params = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const category = params.get('category')
    // URL-фильтры могут меняться без размонтирования страницы через шапку магазина.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveCategory(category && shopCategories.some(item => item.id === category) ? category : 'all')
    setSearch(params.get('q')?.trim() ?? '')
  }, [params])

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: shopItems.length }
    shopItems.forEach(item => { map[item.category] = (map[item.category] || 0) + 1 })
    return map
  }, [])

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return shopItems.filter(item => {
      const inCategory = activeCategory === 'all' || item.category === activeCategory
      const inSearch = !query || `${item.title} ${item.categoryName} ${item.desc}`.toLowerCase().includes(query)
      return inCategory && inSearch
    })
  }, [activeCategory, search])

  function chooseCategory(id: string) {
    setActiveCategory(id)
    const next = new URL(window.location.href)
    if (id === 'all') next.searchParams.delete('category')
    else next.searchParams.set('category', id)
    window.history.replaceState({}, '', `${next.pathname}${next.search}${next.hash}`)
  }

  return (
    <div className="shop-marketplace min-h-screen bg-[#F5F6F9] text-[#17181B]" data-design-contract="canon-marketplace-a-b-3x4">
      <section className="mx-auto max-w-[1480px] px-4 pb-7 pt-5 sm:px-6 sm:pt-7">
        <div
          className="relative min-h-[270px] overflow-hidden rounded-2xl bg-[#F0EBFA] px-6 py-8 shadow-[0_12px_34px_rgba(80,57,112,0.08)] sm:px-10 lg:flex lg:min-h-[310px] lg:items-center lg:px-12"
          style={{
            backgroundImage: 'radial-gradient(circle at 12% 105%, rgba(255,255,255,.96) 0 18%, transparent 18.4%), radial-gradient(circle at 94% -10%, rgba(255,255,255,.72) 0 19%, transparent 19.4%), radial-gradient(circle at 70% 20%, rgba(255,255,255,.5), transparent 34%)',
          }}
        >
          <div className="relative z-10 max-w-[590px] lg:w-[43%]">
            <h1 className="max-w-[560px] text-balance font-body text-[34px] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#17181B] sm:text-[46px] lg:text-[52px]">
              Готовые изделия своего производства
            </h1>
            <p className="mt-4 max-w-[520px] text-base leading-7 text-[#565862] sm:text-lg">
              Из дерева, акрила и фанеры. Сделано в Уфе — доставим по России.
            </p>
            <a
              href="#catalog"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FF5A00] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(255,90,0,0.24)] transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#E95000] hover:shadow-[0_11px_25px_rgba(255,90,0,0.28)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F0EBFA]"
            >
              Смотреть каталог
            </a>
          </div>

          <div className="relative mt-8 grid grid-cols-4 items-center gap-2 lg:absolute lg:right-7 lg:top-1/2 lg:mt-0 lg:w-[54%] lg:-translate-y-1/2 lg:gap-3">
            {showcase.map((item, index) => (
              <Link
                key={item.id}
                href={`/shop/${item.slug}`}
                aria-label={item.title}
                className={`group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(56,42,74,0.14)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(56,42,74,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] ${index % 2 === 0 ? 'mb-4' : 'mt-4'}`}
              >
                <Image src={item.image} alt="" fill priority unoptimized className="object-cover" sizes="(max-width: 1024px) 25vw, 13vw" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-[1480px] scroll-mt-44 px-4 pb-16 sm:px-6">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden" aria-label="Фильтр по категориям">
          {shopCategories.map(category => (
            <CategoryButton key={category.id} category={category} count={counts[category.id] || 0} active={activeCategory === category.id} onClick={chooseCategory} compact />
          ))}
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[238px_minmax(0,1fr)] lg:gap-7">
          <aside className="sticky top-[166px] hidden rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(37,31,49,0.07)] lg:block">
            <h2 className="px-2 pb-3 text-lg font-extrabold tracking-[-0.02em]">Категории</h2>
            <div className="space-y-1">
              {shopCategories.map(category => (
                <CategoryButton key={category.id} category={category} count={counts[category.id] || 0} active={activeCategory === category.id} onClick={chooseCategory} />
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold tracking-[-0.03em] sm:text-[32px]">
                  {activeCategory === 'all' ? 'Все товары' : shopCategories.find(item => item.id === activeCategory)?.name}
                </h2>
                <p className="mt-1 text-sm text-[#73757F]">
                  {search ? `По запросу «${search}» · ` : ''}{filtered.length} товаров
                </p>
              </div>
              {(activeCategory !== 'all' || search) && (
                <button
                  type="button"
                  onClick={() => { setActiveCategory('all'); setSearch(''); window.history.replaceState({}, '', '/shop#catalog') }}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-[#5B3A86] underline decoration-[#C9B9DE] underline-offset-4 transition-colors hover:text-[#3E255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00]"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-[0_10px_28px_rgba(37,31,49,0.07)]">
                <svg aria-hidden="true" className="mx-auto h-10 w-10 text-[#A0A2AB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6" strokeLinecap="round"/></svg>
                <p className="mt-4 text-lg font-bold">Товары не найдены</p>
                <p className="mt-1 text-sm text-[#73757F]">Попробуйте другой запрос или сбросьте фильтры.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
                {filtered.map((item, index) => <ProductCard key={item.id} item={item} priority={index < 8} />)}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-[#E5E6EB] bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">Нужно изделие по вашему макету?</h2>
            <p className="mt-2 max-w-2xl text-[#62646D]">Изготовим деталь, декор или партию изделий по вашим размерам и дизайну.</p>
          </div>
          <Link href="/contacts" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-[#FF5A00] px-6 text-sm font-bold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#E95000] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] focus-visible:ring-offset-2">Оставить заявку</Link>
        </div>
      </section>
    </div>
  )
}

function CategoryButton({
  category,
  count,
  active,
  onClick,
  compact = false,
}: {
  category: (typeof shopCategories)[number]
  count: number
  active: boolean
  onClick: (id: string) => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(category.id)}
      className={`${compact ? 'w-auto shrink-0 px-4' : 'w-full px-3'} flex min-h-11 items-center justify-between gap-3 rounded-xl text-left text-sm font-semibold transition-[background-color,color,transform] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] ${active ? 'bg-[#F1EBF8] text-[#5B3A86]' : 'text-[#4A4C54] hover:bg-[#F7F7FA] hover:text-[#17181B]'}`}
    >
      <span className="whitespace-nowrap">{category.name}</span>
      <span className={`text-xs tabular-nums ${active ? 'text-[#6A4C93]' : 'text-[#989AA3]'}`}>{count}</span>
    </button>
  )
}

function ProductCard({ item, priority = false }: { item: ShopItem; priority?: boolean }) {
  const { add, entries } = useCart()
  const [imgError, setImgError] = useState(false)
  const inCart = entries.find(entry => entry.item.id === item.id)?.qty ?? 0

  return (
    <article className="group min-w-0">
      <Link
        href={`/shop/${item.slug}`}
        className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-white shadow-[0_8px_22px_rgba(45,37,58,0.07)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(45,37,58,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00]"
      >
        {!imgError ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-contain transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.025]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onError={() => setImgError(true)}
            priority={priority}
            unoptimized
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[#A5A7B0]">
            <svg aria-hidden="true" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 4.5-4.5 3.5 3 2-2 6 5"/></svg>
          </span>
        )}
      </Link>

      <div className="px-1 pt-3">
        <Link href={`/shop/${item.slug}`} className="block min-h-[42px] text-sm font-semibold leading-[1.45] text-[#2A2B30] transition-colors hover:text-[#5B3A86] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00]">
          <span className="line-clamp-2">{item.title}</span>
        </Link>
        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="text-[22px] font-extrabold leading-none tracking-[-0.025em] tabular-nums text-[#17181B] sm:text-2xl">
            {item.price.toLocaleString('ru-RU')} ₽
          </span>
          <button
            type="button"
            onClick={() => add(item.id, 1)}
            disabled={!item.inStock}
            aria-label={item.inStock ? `Добавить в корзину: ${item.title}` : `${item.title}: нет в наличии`}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF5A00] text-white shadow-[0_6px_16px_rgba(255,90,0,0.22)] transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#E95000] hover:shadow-[0_9px_20px_rgba(255,90,0,0.28)] active:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#C9CAD0] disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] focus-visible:ring-offset-2"
          >
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4h2l2.2 10.4a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L19.3 8H6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9.5" cy="19" r="1.2" fill="currentColor" stroke="none"/><circle cx="16.5" cy="19" r="1.2" fill="currentColor" stroke="none"/></svg>
            {inCart > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5B3A86] px-1 text-[10px] font-extrabold tabular-nums">{inCart}</span>}
          </button>
        </div>
      </div>
    </article>
  )
}
