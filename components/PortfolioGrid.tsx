'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link  from 'next/link'
import { portfolioItems, portfolioCategories, type PortfolioItem } from '@/data/portfolio'

const PAGE = 48

type Props = { limit?: number; showFilter?: boolean; defaultCategory?: string }

export function PortfolioGrid({ limit, showFilter = true, defaultCategory = 'all' }: Props) {
  const [active,       setActive]       = useState(defaultCategory)
  const [visible,      setVisible]      = useState(PAGE)
  const [lightboxIdx,  setLightboxIdx]  = useState<number | null>(null)

  const filtered = useMemo(() =>
    active === 'all'
      ? portfolioItems
      : portfolioItems.filter(i => i.category === active),
    [active]
  )

  const items = filtered.slice(0, limit ?? visible)
  const hasMore = !limit && visible < filtered.length

  function changeCategory(id: string) {
    setActive(id)
    setVisible(PAGE)
  }

  /* ── Lightbox helpers ── */
  const lightboxItems = limit ? items : filtered   // навигация по всем отфильтрованным
  const lbTotal = lightboxItems.length

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), [])
  const closeLightbox = useCallback(() => setLightboxIdx(null), [])

  const goPrev = useCallback(() =>
    setLightboxIdx(i => i !== null ? (i - 1 + lbTotal) % lbTotal : null), [lbTotal])
  const goNext = useCallback(() =>
    setLightboxIdx(i => i !== null ? (i + 1) % lbTotal : null), [lbTotal])

  useEffect(() => {
    if (lightboxIdx === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')      closeLightbox()
      if (e.key === 'ArrowLeft')   goPrev()
      if (e.key === 'ArrowRight')  goNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIdx, closeLightbox, goPrev, goNext])

  return (
    <>
      {/* ── Filter buttons ── */}
      {showFilter && (
        <div className="flex flex-wrap gap-2 mb-8">
          {portfolioCategories.map(cat => {
            const isActive = active === cat.id
            const cls = `inline-flex items-center text-sm px-4 py-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 active:scale-95 ${
              isActive
                ? 'bg-[#FF6B00] text-white shadow-[0_2px_12px_rgba(255,107,0,0.35)]'
                : 'bg-[#E8E6E0] text-[#6E6A64] hover:bg-[#1A1A1A] hover:text-white'
            }`
            const badge = <span className={`ml-1.5 text-[11px] leading-none ${isActive ? 'text-white/70' : 'text-[#6E6A64]/60'}`}>{cat.count}</span>

            if (cat.id === 'all') {
              return (
                <button key="all" onClick={() => changeCategory('all')} className={cls}>
                  {cat.label}{badge}
                </button>
              )
            }
            return (
              <Link
                key={cat.id}
                href={`/portfolio/${cat.id}`}
                onClick={(e) => { e.preventDefault(); changeCategory(cat.id) }}
                className={cls}
              >
                {cat.label}{badge}
              </Link>
            )
          })}
        </div>
      )}

      {/* ── Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <PortfolioCard
            key={item.id}
            item={item}
            priority={idx < 8}
            onClick={() => openLightbox(idx)}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-[#6E6A64]">
          <p className="font-display text-2xl tracking-wider mb-2">Нет фото в этой категории</p>
        </div>
      )}

      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setVisible(v => v + PAGE)}
            className="px-8 py-3 bg-white border-2 border-[#E8E6E0] text-[#1A1A1A] font-semibold rounded-full hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
          >
            Показать ещё — {Math.min(PAGE, filtered.length - visible)} фото
          </button>
          <p className="mt-3 text-sm text-[#6E6A64]">
            Показано {visible} из {filtered.length}
          </p>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (
        <Lightbox
          items={lightboxItems}
          index={lightboxIdx}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </>
  )
}

/* ── PortfolioCard ── */
function PortfolioCard({ item, priority, onClick }: { item: PortfolioItem; priority?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-square bg-[#1A1A1A] rounded-xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.32)] transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 w-full"
    >
      <Image
        src={item.image}
        alt={item.alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      {/* Zoom icon on hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-end justify-start p-3">
        <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zm-6-3v6m-3-3h6" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-white text-sm font-semibold leading-tight">{item.title}</p>
      </div>
    </button>
  )
}

/* ── Lightbox modal ── */
function Lightbox({
  items, index, onClose, onPrev, onNext,
}: {
  items: PortfolioItem[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const item = items[index]

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(10,10,10,0.92)' }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Закрыть"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums select-none">
        {index + 1} / {items.length}
      </div>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        className="absolute left-2 sm:left-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Предыдущее фото"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Image */}
      <div
        className="relative max-w-[90vw] max-h-[88vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full" style={{ maxWidth: '90vw', maxHeight: '88vh' }}>
          <Image
            src={item.image}
            alt={item.alt}
            fill
            sizes="90vw"
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="absolute right-2 sm:right-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Следующее фото"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Caption */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm text-center select-none px-4">
        {item.alt}
      </div>
    </div>
  )
}
