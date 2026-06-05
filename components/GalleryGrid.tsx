'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface GalleryItem {
  src: string
  alt: string
}

interface Props {
  items: GalleryItem[]
  /** Tailwind grid класс, по умолчанию 4 колонки */
  gridClass?: string
  /** Класс для всех элементов (если одинаковый) */
  aspectClass?: string
  /** Кастомные классы для каждого элемента (массив, приоритет над aspectClass) */
  itemClasses?: string[]
  /** border-radius кнопки, по умолчанию rounded-xl */
  roundedClass?: string
  /** sizes для next/image */
  imageSizes?: string
}

export function GalleryGrid({
  items,
  gridClass = 'grid grid-cols-2 sm:grid-cols-4 gap-3',
  aspectClass = 'aspect-square',
  itemClasses,
  roundedClass = 'rounded-xl',
  imageSizes = '(max-width: 640px) 50vw, 25vw',
}: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const total = items.length

  const open  = useCallback((i: number) => setLightboxIdx(i), [])
  const close  = useCallback(() => setLightboxIdx(null), [])
  const prev   = useCallback(() => setLightboxIdx(i => i !== null ? (i - 1 + total) % total : null), [total])
  const next   = useCallback(() => setLightboxIdx(i => i !== null ? (i + 1) % total  : null), [total])

  useEffect(() => {
    if (lightboxIdx === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     close()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIdx, close, prev, next])

  return (
    <>
      <div className={gridClass}>
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            onClick={() => open(i)}
            className={`relative ${itemClasses ? (itemClasses[i] ?? aspectClass) : aspectClass} ${roundedClass} overflow-hidden bg-[#2D2D2D] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2`}
            aria-label={`Открыть фото: ${item.alt}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={imageSizes}
            />
            {/* Zoom icon on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фото"
        >
          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums">
            {lightboxIdx + 1} / {total}
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] mx-auto px-16"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={items[lightboxIdx].src}
              alt={items[lightboxIdx].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Caption */}
          <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-sm px-4">
            {items[lightboxIdx].alt}
          </div>

          {/* Prev / Next */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); prev() }}
                aria-label="Предыдущее фото"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); next() }}
                aria-label="Следующее фото"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
