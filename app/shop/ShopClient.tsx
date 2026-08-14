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
import { trackGoal } from '@/lib/analytics'
import { filterAndSortShopItems, isShopSort, SHOP_SORTS, type ShopSort } from '@/lib/shop-catalog'

const showcase = [355794658, 293800230, 234003775, 874246986]
  .map(id => shopItems.find(item => item.id === id))
  .filter((item): item is ShopItem => Boolean(item))

export function ShopClient() {
  const params = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ShopSort>('recommended')
  const [inStockOnly, setInStockOnly] = useState(false)

  useEffect(() => {
    const category = params.get('category')
    // URL-фильтры могут меняться без размонтирования страницы через шапку магазина.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveCategory(category && shopCategories.some(item => item.id === category) ? category : 'all')
    setSearch(params.get('q')?.trim() ?? '')
    const sortValue = params.get('sort')
    setSort(isShopSort(sortValue) ? sortValue : 'recommended')
    setInStockOnly(params.get('stock') === '1')
  }, [params])

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: shopItems.length }
    shopItems.forEach(item => { map[item.category] = (map[item.category] || 0) + 1 })
    return map
  }, [])

  const filtered = useMemo(() => {
    return filterAndSortShopItems(shopItems, {
      category: activeCategory,
      query: search,
      inStockOnly,
      sort,
    })
  }, [activeCategory, inStockOnly, search, sort])

  useEffect(() => {
    if (search) trackGoal('shop_search', { query: search })
  }, [search])

  function updateUrl(changes: Record<string, string | null>) {
    const next = new URL(window.location.href)
    Object.entries(changes).forEach(([key, value]) => {
      if (!value) next.searchParams.delete(key)
      else next.searchParams.set(key, value)
    })
    window.history.replaceState({}, '', `${next.pathname}${next.search}${next.hash}`)
  }

  function chooseCategory(id: string) {
    setActiveCategory(id)
    updateUrl({ category: id === 'all' ? null : id })
    trackGoal('shop_category', { category: id })
  }

  function chooseSort(value: ShopSort) {
    setSort(value)
    updateUrl({ sort: value === 'recommended' ? null : value })
    trackGoal('shop_sort', { sort: value })
  }

  function toggleStock(checked: boolean) {
    setInStockOnly(checked)
    updateUrl({ stock: checked ? '1' : null })
    trackGoal('shop_stock_filter', { enabled: checked })
  }

  function resetFilters() {
    setActiveCategory('all')
    setSearch('')
    setSort('recommended')
    setInStockOnly(false)
    window.history.replaceState({}, '', '/shop#catalog')
  }

  return (
    <div className="shop-marketplace min-h-screen bg-[#F5F6F9] text-[#17181B]" data-design-contract="canon-marketplace-a-b-3x4">
      <section className="mx-auto max-w-[1480px] px-4 pb-7 pt-5 sm:px-6 sm:pt-7">
        <div
          className="relative min-h-[220px] overflow-hidden rounded-2xl bg-[#F0EBFA] px-5 py-6 shadow-[0_12px_34px_rgba(80,57,112,0.08)] sm:min-h-[270px] sm:px-10 sm:py-8 lg:flex lg:min-h-[310px] lg:items-center lg:px-12"
          style={{
            backgroundImage: 'radial-gradient(circle at 12% 105%, rgba(255,255,255,.96) 0 18%, transparent 18.4%), radial-gradient(circle at 94% -10%, rgba(255,255,255,.72) 0 19%, transparent 19.4%), radial-gradient(circle at 70% 20%, rgba(255,255,255,.5), transparent 34%)',
          }}
        >
          <div className="relative z-10 w-[64%] max-w-[590px] sm:w-auto lg:w-[43%]">
            <h1 className="max-w-[560px] text-balance font-body text-2xl font-extrabold leading-[1.06] tracking-[-0.035em] text-[#17181B] sm:text-[46px] sm:leading-[1.08] lg:text-[52px]">
              Готовые изделия своего производства
            </h1>
            <p className="mt-4 hidden max-w-[520px] text-base leading-7 text-[#565862] sm:block sm:text-lg">
              Из дерева, акрила и фанеры. Сделано в Уфе — доставим по России.
            </p>
            <a
              href="#catalog"
              className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-[#FF5A00] px-4 text-xs font-bold text-white shadow-[0_8px_20px_rgba(255,90,0,0.24)] transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#E95000] hover:shadow-[0_11px_25px_rgba(255,90,0,0.28)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F0EBFA] sm:mt-7 sm:min-h-12 sm:px-6 sm:text-sm"
            >
              Смотреть каталог
            </a>
          </div>

          <div className="absolute bottom-5 right-4 grid w-[31%] grid-cols-2 items-center gap-2 sm:relative sm:bottom-auto sm:right-auto sm:mt-8 sm:w-auto sm:grid-cols-4 lg:absolute lg:right-7 lg:top-1/2 lg:mt-0 lg:w-[54%] lg:-translate-y-1/2 lg:gap-3">
            {showcase.map((item, index) => (
              <Link
                key={item.id}
                href={`/shop/${item.slug}`}
                aria-label={item.title}
                className={`group relative aspect-[3/4] overflow-hidden rounded-xl bg-white shadow-[0_12px_30px_rgba(56,42,74,0.14)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(56,42,74,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] sm:block sm:rounded-2xl ${index > 1 ? 'hidden sm:block' : 'block'} ${index % 2 === 0 ? 'sm:mb-4' : 'sm:mt-4'}`}
              >
                <Image src={item.image} alt="" fill priority={index < 2} className="object-cover" sizes="(max-width: 640px) 18vw, (max-width: 1024px) 25vw, 13vw" />
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
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold tracking-[-0.03em] sm:text-[32px]">
                  {activeCategory === 'all' ? 'Все товары' : shopCategories.find(item => item.id === activeCategory)?.name}
                </h2>
                <p className="mt-1 text-sm text-[#73757F]">
                  {search ? `По запросу «${search}» · ` : ''}{filtered.length} товаров
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#DCDDE5] bg-white px-3 text-sm font-semibold text-[#42444C] transition-[border-color,background-color] hover:border-[#CFC8DE] hover:bg-[#FAF9FC] focus-within:ring-2 focus-within:ring-[#FF5A00]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={event => toggleStock(event.target.checked)}
                    className="h-4 w-4 accent-[#FF5A00]"
                  />
                  В наличии
                </label>
                <label className="sr-only" htmlFor="shop-sort">Сортировка товаров</label>
                <select
                  id="shop-sort"
                  value={sort}
                  onChange={event => chooseSort(event.target.value as ShopSort)}
                  className="min-h-11 cursor-pointer rounded-xl border border-[#DCDDE5] bg-white px-3 text-sm font-semibold text-[#42444C] outline-none transition-[border-color,box-shadow] focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/15"
                >
                  {(Object.entries(SHOP_SORTS) as [ShopSort, string][]).map(([value, title]) => (
                    <option key={value} value={value}>{title}</option>
                  ))}
                </select>
              </div>
              {(activeCategory !== 'all' || search || inStockOnly || sort !== 'recommended') && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-[#5B3A86] underline decoration-[#C9B9DE] underline-offset-4 transition-colors hover:text-[#3E255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00]"
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
                {filtered.map((item, index) => <ProductCard key={item.id} item={item} priority={index < 4} />)}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-[#E5E6EB] bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-6 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#ECEAF0] shadow-[0_12px_30px_rgba(37,31,49,0.1)]">
            <Image src="/images/old-site/about-01.jpg" alt="Производственный цех CLC в Уфе" fill className="object-cover" sizes="(max-width: 768px) 100vw, 42vw" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-[#17181B] sm:text-3xl">Покупаете напрямую у мастерской</h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#62646D]">Изготавливаем товары на собственном оборудовании в Уфе, проверяем перед отправкой и остаёмся на связи до получения заказа.</p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['Адрес', 'Менделеева, 177, цех 509'],
                ['График', 'Ежедневно, 10:00–19:00'],
                ['Получение', 'Самовывоз или доставка по России'],
              ].map(([term, value]) => (
                <div key={term} className="rounded-xl bg-[#F5F6F9] p-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#777984]">{term}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-5 text-[#2A2B30]">{value}</dd>
                </div>
              ))}
            </dl>
            <Link href="/about" className="mt-5 inline-flex min-h-11 items-center rounded-lg text-sm font-bold text-[#5B3A86] underline decoration-[#C9B9DE] underline-offset-4 transition-colors hover:text-[#3E255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00]">Подробнее о производстве →</Link>
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
      className={`${compact ? 'w-auto shrink-0 px-4' : 'w-full px-3'} flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl text-left text-sm font-semibold transition-[background-color,color,transform] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] ${active ? 'bg-[#F1EBF8] text-[#5B3A86]' : 'text-[#4A4C54] hover:bg-[#F7F7FA] hover:text-[#17181B]'}`}
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
        onClick={() => trackGoal('select_item', { product: item.id, category: item.category })}
        className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-white shadow-[0_8px_22px_rgba(45,37,58,0.07)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(45,37,58,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00]"
      >
        <span className={`absolute left-2.5 top-2.5 z-10 rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-[0_4px_12px_rgba(20,20,24,0.1)] ${item.inStock ? 'bg-white text-[#16854A]' : 'bg-[#F1EBF8] text-[#5B3A86]'}`}>
          {item.inStock ? 'В наличии' : 'Под заказ'}
        </span>
        {!imgError ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-contain transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.025]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onError={() => setImgError(true)}
            priority={priority}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[#A5A7B0]">
            <svg aria-hidden="true" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 4.5-4.5 3.5 3 2-2 6 5"/></svg>
          </span>
        )}
      </Link>

      <div className="px-1 pt-3">
        <Link href={`/shop/${item.slug}`} onClick={() => trackGoal('select_item', { product: item.id, category: item.category })} className="block min-h-[42px] text-sm font-semibold leading-[1.45] text-[#2A2B30] transition-colors hover:text-[#5B3A86] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00]">
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
            className="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#FF5A00] text-white shadow-[0_6px_16px_rgba(255,90,0,0.22)] transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#E95000] hover:shadow-[0_9px_20px_rgba(255,90,0,0.28)] active:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#C9CAD0] disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] focus-visible:ring-offset-2"
          >
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4h2l2.2 10.4a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L19.3 8H6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9.5" cy="19" r="1.2" fill="currentColor" stroke="none"/><circle cx="16.5" cy="19" r="1.2" fill="currentColor" stroke="none"/></svg>
            {inCart > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5B3A86] px-1 text-[10px] font-extrabold tabular-nums">{inCart}</span>}
          </button>
        </div>
      </div>
    </article>
  )
}
