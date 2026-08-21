'use client'

import Link from 'next/link'
import { shopCategories } from '@/data/shop-categories'
import { CartButton } from '@/components/CartButton'
import { trackGoal } from '@/lib/analytics'

export function ShopHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E7E8EE] bg-white text-[#17181B] shadow-[0_8px_28px_rgba(39,32,56,0.06)]">
      <div className="hidden border-b border-[#EFF0F4] bg-[#FAFAFC] md:block">
        <div className="mx-auto flex min-h-11 max-w-[1480px] items-center justify-between px-6 text-xs text-[#62646D]">
          <div className="flex items-center gap-5">
            <span>Уфа</span>
            <span>Доставка по России</span>
            <Link className="inline-flex min-h-11 items-center rounded font-semibold text-[#555760] hover:text-[#9D3900] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]" href="/products">Изготовление на заказ</Link>
          </div>
          <div className="flex items-center gap-5">
            <Link className="inline-flex min-h-11 items-center rounded hover:text-[#17181B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]" href="/about">О компании</Link>
            <Link className="inline-flex min-h-11 items-center rounded hover:text-[#17181B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]" href="/contacts">Контакты</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-[66px] max-w-[1480px] items-center gap-3 px-4 sm:h-[74px] sm:gap-4 sm:px-6">
        <Link
          href="/shop"
          aria-label="CLC — магазин готовых изделий"
          className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
        >
          <span className="text-3xl font-extrabold leading-none tracking-[-0.04em] text-[#FF5A00] sm:text-4xl">CLC</span>
          <span className="hidden max-w-[112px] text-xs font-extrabold uppercase leading-[1.15] tracking-[0.06em] text-[#24252A] lg:block">
            Центр<br />лазерной<br />резки
          </span>
        </Link>

        <form
          action="/shop"
          className="relative min-w-0 flex-1"
          role="search"
          onSubmit={event => {
            const data = new FormData(event.currentTarget)
            trackGoal('shop_search_submit', { query: String(data.get('q') ?? '').trim() })
          }}
        >
          <label htmlFor="shop-header-search" className="sr-only">Поиск по товарам</label>
          <svg aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#62646D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.7-3.7" strokeLinecap="round" />
          </svg>
          <input
            id="shop-header-search"
            name="q"
            type="search"
            placeholder="Поиск по товарам"
            className="h-11 w-full rounded-2xl border border-[#DCDDE5] bg-[#F8F8FB] pl-11 pr-3 text-sm text-[#17181B] outline-none placeholder:text-[#73757F] transition-[background-color,border-color,box-shadow] focus:border-[#FF6B00] focus:bg-white focus:ring-4 focus:ring-[#FF6B00]/10 sm:h-12 sm:pl-12 sm:pr-4"
          />
        </form>

        <CartButton variant="light" showLabel />
      </div>

      <div className="relative mx-auto max-w-[1480px]">
        <nav className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-2 pr-12 sm:px-6 sm:pb-3 sm:pr-14" aria-label="Категории магазина">
          {shopCategories.slice(0, 10).map(category => (
            <Link
              key={category.id}
              href={category.id === 'all' ? '/shop#catalog' : `/shop?category=${category.id}#catalog`}
              className="inline-flex min-h-11 shrink-0 items-center rounded-xl border border-[#E1E2E8] bg-white px-3 text-sm font-semibold text-[#393A41] transition-[background-color,border-color,color,transform] hover:-translate-y-px hover:border-[#CFC8DE] hover:bg-[#F7F4FB] hover:text-[#5B3A86] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] sm:px-4"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white via-white/90 to-transparent sm:w-16" />
      </div>
    </header>
  )
}
