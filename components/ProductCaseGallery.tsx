'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { CaseImage } from '@/data/cases'

export function ProductCaseGallery({ images: input, compact = false, sequence = false }: { images: CaseImage[]; compact?: boolean; sequence?: boolean }) {
  const unique = input.filter((image, i, all) => all.findIndex(other => other.src === image.src) === i)
  const firstResult = unique.find(image => image.stage === 'result')
  // A source-backed story keeps chronological controls, but opens on the finished item.
  const images = sequence ? [
    ...unique.filter(image => image.stage === 'before'),
    ...unique.filter(image => image.stage === 'process'),
    ...unique.filter(image => image.stage !== 'before' && image.stage !== 'process'),
  ] : firstResult ? [firstResult, ...unique.filter(image => image !== firstResult)] : unique
  const [index, setIndex] = useState(() => sequence && firstResult ? images.indexOf(firstResult) : 0)
  const frame = sequence && firstResult ? firstResult : images[0]
  const image = images[index] ?? images[0]
  const buttonClass = "min-h-11 min-w-11 flex-1 cursor-pointer rounded-md border border-transparent px-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white active:opacity-75 aria-pressed:border-white aria-pressed:bg-white aria-pressed:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
  if (!image) return null
  return <div aria-label="Фотографии кейса" data-product-gallery>
    <div style={{ aspectRatio: frame?.width && frame?.height ? `${frame.width} / ${frame.height}` : '4 / 3' }} className={compact ? 'relative w-full max-h-[21vh] overflow-hidden rounded-xl bg-[#D4D5D5] min-[360px]:max-h-[32vh] lg:max-h-[52vh]' : 'relative max-h-[36vh] overflow-hidden rounded-xl bg-[#D4D5D5] sm:max-h-[52vh]'}>
      <Image src={image.src} alt={image.alt} fill loading="eager" sizes="(max-width: 1024px) calc(100vw - 2rem), 640px" className="object-contain p-2 sm:p-4" />
    </div>
    {images.length > 1 && <div className="mt-2 flex flex-wrap gap-1 rounded-lg border border-white/40 bg-white/10 p-1" aria-label="Выбор фотографии">
      {images.map((photo, i) => <button key={photo.src} type="button" aria-label={`Показать фото ${i + 1} из ${images.length}`} aria-pressed={index === i} onClick={() => setIndex(i)} className={sequence ? buttonClass.replace('px-3 text-sm', 'px-1 text-xs [overflow-wrap:anywhere]') : buttonClass}>{photo.label?.trim() || (photo.alt.startsWith('Лицевая сторона') ? 'Лицевая сторона' : photo.alt.startsWith('Оборот') ? 'Оборот' : photo.stage === 'before' ? 'Исходный материал' : photo.stage === 'process' ? 'В процессе' : `Фото ${i + 1}`)}</button>)}
    </div>}
    <p className="sr-only" aria-live="polite">{image.alt}</p>
  </div>
}
