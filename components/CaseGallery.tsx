'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { CaseImage } from '@/data/cases'

type Props = {
  images: CaseImage[]
}

export function CaseGallery({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex] ?? images[0]

  return (
    <div aria-label="Фотографии проекта">
      <p className="sr-only" aria-live="polite">Показано фото {activeIndex + 1} из {images.length}: {active.alt}</p>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#D4D5D5] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <Image
          src={active.src}
          alt={active.alt}
          fill
          loading="eager"
          className="object-contain"
          sizes="(max-width: 1024px) calc(100vw - 2rem), 640px"
        />
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Выбор фотографии">
          {images.map((image, index) => (
            <li key={`${image.src}-${index}`}>
              <button
                type="button"
                aria-label={`Показать фото ${index + 1} из ${images.length}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => setActiveIndex(index)}
                className={`relative block h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-[#D4D5D5] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A] sm:h-20 sm:w-24 ${index === activeIndex ? 'border-[#FF6B00]' : 'border-white/20 hover:border-white/65'}`}
              >
                <Image src={image.src} alt="" fill className="object-cover" sizes="96px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
