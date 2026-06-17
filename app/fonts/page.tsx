import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FontPreview } from '@/components/FontPreview'
import { previewFontVars, previewFonts } from '@/lib/fonts-preview'

export const metadata: Metadata = {
  title: 'Выбор шрифта для гравировки — подбор онлайн | Центр лазерной резки в Уфе',
  description:
    'Введите свой текст и посмотрите, как он выглядит в разных шрифтах для гравировки. ' +
    'Более 15 шрифтов с поддержкой кириллицы для гравировки на дереве, металле, коже и акриле.',
  alternates: { canonical: 'https://clc-ufa.ru/fonts' },
  openGraph: {
    title: 'Выбор шрифта для гравировки — подбор онлайн',
    description: 'Введите текст и подберите шрифт для гравировки. Более 15 шрифтов с кириллицей.',
    url: 'https://clc-ufa.ru/fonts',
    type: 'website',
  },
}

export default function FontsPage() {
  return (
    <div className={`${previewFontVars} min-h-screen bg-[#F5F4F0] pt-24 pb-20`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-6 h-px bg-[#FF6B00]" />
            <span className="font-mono text-xs text-[#FF6B00] tracking-[0.2em] uppercase">Выбор шрифтов</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mb-3">
            Подбор шрифта для гравировки
          </h1>
          <p className="text-[#6E6A64] leading-relaxed max-w-2xl">
            Напишите свой текст — имя, фразу или дату — и сразу увидите, как он будет выглядеть
            разными шрифтами. Понравившийся шрифт назовите нам при заказе.
          </p>
        </div>

        <Suspense fallback={<div className="text-[#6E6A64]">Загрузка…</div>}>
          <FontPreview />
        </Suspense>

        {/* Note */}
        <p className="text-sm text-[#6E6A64] text-center mt-10 leading-relaxed">
          Это {previewFonts.length} популярных шрифтов из нашей подборки. Нужен другой шрифт?{' '}
          <Link href="/contacts" className="text-[#FF6B00] hover:underline">Напишите нам</Link>{' '}
          — подберём под вашу задачу.
        </p>
      </div>
    </div>
  )
}
