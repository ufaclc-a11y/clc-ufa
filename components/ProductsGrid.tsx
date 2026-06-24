'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link  from 'next/link'
import { products, productCategories, type ProductCategory } from '@/data/products'

const ALL = 'all'
type Filter = ProductCategory | typeof ALL

const FILTER_COUNTS: Record<Filter, number> = {
  all:           products.length,
  nagrady:       products.filter(p => p.category === 'nagrady').length,
  ofis:          products.filter(p => p.category === 'ofis').length,
  podarki:       products.filter(p => p.category === 'podarki').length,
  meropriyatiya: products.filter(p => p.category === 'meropriyatiya').length,
  proizvodstvo:  products.filter(p => p.category === 'proizvodstvo').length,
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',           label: 'Все' },
  { key: 'nagrady',       label: productCategories.nagrady },
  { key: 'ofis',          label: productCategories.ofis },
  { key: 'podarki',       label: productCategories.podarki },
  { key: 'meropriyatiya', label: productCategories.meropriyatiya },
  { key: 'proizvodstvo',  label: productCategories.proizvodstvo },
]

export function ProductsGrid() {
  const [active, setActive] = useState<Filter>('all')

  const visible = active === 'all'
    ? products
    : products.filter(p => p.category === active)

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Фильтр изделий">
        {FILTERS.map(f => {
          const isActive = active === f.key
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(f.key)}
              className={[
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold',
                'transition-[background-color,color,border-color,box-shadow] duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/50',
                isActive
                  ? 'bg-[#FF6B00] text-white shadow-[0_2px_12px_rgba(255,107,0,0.30)]'
                  : 'bg-white text-[#6E6A64] border border-[#E8E6E0] hover:border-[#FF6B00]/50 hover:text-[#FF6B00]',
              ].join(' ')}
            >
              {f.label}
              <span className={[
                'text-xs tabular-nums rounded-full px-1.5 py-0.5',
                isActive ? 'bg-white/20 text-white' : 'bg-[#F5F4F0] text-[#6E6A64]',
              ].join(' ')}>
                {FILTER_COUNTS[f.key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map(p => (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden block bg-[#2D2D2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
          >
            {/* Photo */}
            <Image
              src={p.image}
              alt={p.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Legibility scrim: bottom half nearly solid, fades out toward the top */}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.97)_0%,rgba(0,0,0,0.94)_45%,rgba(0,0,0,0.55)_65%,rgba(0,0,0,0.10)_100%)]" />

            {/* Top: category badge */}
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/50 text-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {productCategories[p.category]}
              </span>
            </div>

            {/* Bottom: text */}
            <div className="absolute inset-x-0 bottom-0 p-5 [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]">
              {p.popularFor && (
                <p className="text-[10px] text-[#FF6B00] font-semibold uppercase tracking-wider mb-1.5">
                  {p.popularFor}
                </p>
              )}
              <h2 className="font-display text-2xl text-white tracking-wider mb-2 leading-snug group-hover:text-[#FF6B00] transition-colors duration-200">
                {p.title}
              </h2>
              <p className="text-xs text-white/85 leading-relaxed line-clamp-2">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3 [text-shadow:none]">
                {p.tags.slice(0, 3).map(t => (
                  <span key={t} className="text-[10px] bg-black/35 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded-full border border-white/15">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-16 text-[#6E6A64]">
          <p className="text-lg">Ничего не найдено в этой категории</p>
        </div>
      )}
    </>
  )
}
