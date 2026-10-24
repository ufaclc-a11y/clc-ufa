'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { CaseImage } from '@/data/cases'

export function ProductCaseGallery({ images: input }: { images: CaseImage[] }) {
  const unique = input.filter((image, i, all) => all.findIndex(other => other.src === image.src) === i)
  const images = [...unique.filter(image => image.stage === 'result'), ...unique.filter(image => image.stage !== 'result')]
  const [index, setIndex] = useState(0)
  const image = images[index] ?? images[0]
  if (!image) return null
  return <div aria-label="Фотографии кейса" data-product-gallery>
    <div style={{ aspectRatio: images[0]?.width && images[0]?.height ? `${images[0].width} / ${images[0].height}` : '4 / 3' }} className="relative max-h-[36vh] overflow-hidden rounded-xl bg-[#D4D5D5] sm:max-h-[52vh]">
      <Image src={image.src} alt={image.alt} fill loading="eager" sizes="(max-width: 1024px) calc(100vw - 2rem), 640px" className="object-contain p-2 sm:p-4" />
    </div>
    {images.length > 1 && <div className="mt-2 flex flex-wrap gap-1 rounded-lg border border-white/40 bg-white/10 p-1" aria-label="Выбор фотографии">
      {images.map((photo, i) => <button key={photo.src} type="button" aria-label={`Показать фото ${i + 1} из ${images.length}`} aria-pressed={index === i} onClick={() => setIndex(i)} className="min-h-11 min-w-11 flex-1 cursor-pointer rounded-md border border-transparent px-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white active:opacity-75 aria-pressed:border-white aria-pressed:bg-white aria-pressed:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">{photo.alt.startsWith('Лицевая сторона') ? 'Лицевая сторона' : photo.alt.startsWith('Оборот') ? 'Оборот' : photo.stage === 'before' ? 'Исходный материал' : photo.stage === 'process' ? 'В процессе' : `Фото ${i + 1}`}</button>)}
    </div>}
    <p className="sr-only" aria-live="polite">{image.alt}</p>
  </div>
}
