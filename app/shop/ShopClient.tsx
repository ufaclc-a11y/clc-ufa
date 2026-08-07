'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { shopItems, shopCategories } from '@/data/shop'

export function ShopClient() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let items = shopItems
    if (activeCategory !== 'all') {
      items = items.filter(i => i.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.categoryName.toLowerCase().includes(q) ||
        i.desc.toLowerCase().includes(q)
      )
    }
    return items
  }, [activeCategory, search])

  // Counts per category
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: shopItems.length }
    shopItems.forEach(i => {
      map[i.category] = (map[i.category] || 0) + 1
    })
    return map
  }, [])

  return (
    <div className="min-h-screen bg-[#1A1A1A]">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-[#111] pt-20 pb-16">
        {/* Background grain */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />
        {/* Orange glow */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#FF6B00]/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#FF6B00]/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Магазин</span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white tracking-wider mt-2 mb-5 leading-[1]">
            Товары на<br />
            <span className="text-[#FF6B00]">Wildberries</span>
          </h1>
          <p className="text-lg text-white/55 max-w-2xl leading-relaxed mb-8">
            Изделия из дерева ручной работы — декор, руны, кормушки, органайзеры и многое другое.
            Быстрая доставка по России через Wildberries.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="https://www.wildberries.ru/seller/1553621"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#CB11AB] text-white font-semibold rounded-xl
                hover:bg-[#b80e99] transition-colors duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CB11AB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Перейти в магазин WB
            </a>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
              {shopItems.length} товаров в наличии
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTERS + SEARCH ── */}
      <div className="sticky top-16 z-30 bg-[#1A1A1A]/95 backdrop-blur-sm border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-shrink-0 w-full sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="search"
                placeholder="Поиск по товарам..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25
                  focus:outline-none focus:border-[#FF6B00]/50 focus:bg-white/8 transition-colors"
              />
            </div>

            {/* Category pills — scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide flex-nowrap">
              {shopCategories.map(cat => {
                const count = counts[cat.id] || 0
                const active = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0
                      transition-colors duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]
                      ${active
                        ? 'bg-[#FF6B00] text-white'
                        : 'bg-white/5 text-white/55 hover:text-white hover:bg-white/10 border border-white/8'
                      }`}
                  >
                    <span className="text-base leading-none">{cat.emoji}</span>
                    <span>{cat.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-white/8 text-white/40'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/40 text-lg">Ничего не найдено</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all') }}
              className="mt-4 text-[#FF6B00] text-sm hover:text-[#FF8C33] transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filtered.map(item => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* ── CTA BANNER ── */}
      <div className="bg-[#111] border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase mb-3">Нужен индивидуальный заказ?</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wider mb-4">
            Сделаем по вашему макету
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mb-8 leading-relaxed">
            Изготовим любое изделие из дерева и акрила по вашим размерам и дизайну.
            Оставьте заявку — ответим в течение часа.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="/contacts"
              className="px-6 py-3 bg-[#FF6B00] text-white font-semibold rounded-xl
                hover:bg-[#e05a00] transition-colors duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
            >
              Оставить заявку
            </a>
            <a
              href="/services"
              className="px-6 py-3 bg-white/5 text-white/70 font-semibold rounded-xl border border-white/10
                hover:bg-white/10 hover:text-white transition-colors duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Наши услуги
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}

/* ─────────────── Product Card ─────────────── */
type ShopItem = typeof shopItems[number]

function ProductCard({ item }: { item: ShopItem }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/shop/${item.slug}`}
      className="group relative flex flex-col bg-[#222] rounded-2xl overflow-hidden
        border border-white/6 hover:border-[#FF6B00]/30
        transition-[transform,border-color,box-shadow] duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_8px_32px_rgba(255,107,0,0.15)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] bg-[#2A2A2A] overflow-hidden">
        {!imgError ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-4xl">
            🪵
          </div>
        )}
        {/* WB badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-[#CB11AB]/90 rounded-full text-white text-[10px] font-bold tracking-wide">
          WB
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3.5 gap-2">
        <p className="text-[11px] text-[#FF6B00]/80 font-mono tracking-wider uppercase leading-none">
          {item.categoryName}
        </p>
        <h3 className="text-sm text-white/90 leading-snug line-clamp-3 flex-1 group-hover:text-white transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center justify-between pt-1 border-t border-white/6">
          <span className="font-display text-lg text-white tracking-wider">
            {item.price.toLocaleString('ru-RU')} ₽
          </span>
          <span className="text-[10px] text-white/25 group-hover:text-[#FF6B00]/60 transition-colors">
            подробнее →
          </span>
        </div>
      </div>
    </Link>
  )
}
