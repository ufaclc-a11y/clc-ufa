'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { previewFonts, fontCategories, type FontCategory } from '@/lib/fonts-preview'

const PLACEHOLDER = 'Здесь можно написать свой текст'

// Есть ли в строке кириллические символы
const hasCyrillic = (s: string) => /[Ѐ-ӿ]/.test(s)

export function FontPreview() {
  const searchParams = useSearchParams()
  // Стартовый текст из ?s= (паритет со старым ?s=Candle+She).
  const [text, setText] = useState(() => searchParams.get('s') ?? '')

  const sample = text.trim() || PLACEHOLDER
  const cyrillicInput = hasCyrillic(sample)

  const [activeCat, setActiveCat] = useState<FontCategory | 'all'>('all')

  const visibleFonts = useMemo(
    () => (activeCat === 'all' ? previewFonts : previewFonts.filter(f => f.category === activeCat)),
    [activeCat]
  )

  return (
    <div>
      {/* ── Поле ввода ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E6E0] shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-6">
        <label htmlFor="font-text" className="block font-display text-lg text-[#1A1A1A] tracking-wide mb-3">
          Подобрать шрифт
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="font-text"
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            maxLength={40}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-[#E8E6E0] bg-[#FAF9F7] text-[#1A1A1A] placeholder:text-[#A8A39B] focus:outline-none focus-visible:border-[#FF6B00] focus-visible:ring-2 focus-visible:ring-[#FF6B00]/30 transition-[border-color,box-shadow]"
          />
          <button
            onClick={() => setText('')}
            disabled={!text}
            className="shrink-0 px-5 py-3 rounded-xl border-2 border-[#E8E6E0] text-sm font-semibold text-[#6E6A64] hover:border-[#FF6B00]/40 hover:text-[#1A1A1A] active:bg-[#F5F4F0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
          >
            Очистить
          </button>
        </div>

        {/* Фильтр по категориям */}
        <div className="flex flex-wrap gap-2 mt-4">
          {([{ id: 'all', label: 'Все' }, ...fontCategories] as const).map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id as FontCategory | 'all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
                activeCat === c.id
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-[#F5F4F0] text-[#6E6A64] hover:bg-[#FF6B00]/10 hover:text-[#1A1A1A]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Сетка превью ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleFonts.map(font => {
          const latinOnly = cyrillicInput && !font.cyrillic
          return (
            <div
              key={font.id}
              className="group bg-white rounded-2xl border border-[#E8E6E0] shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-[#FF6B00]/40 hover:shadow-[0_6px_20px_rgba(255,107,0,0.10)]"
            >
              {/* Шапка карточки */}
              <div className="flex items-center justify-between px-5 pt-4">
                <span className="font-mono text-xs text-[#6E6A64] tracking-wide">{font.name}</span>
                <span
                  className={`font-mono text-[10px] tracking-[0.15em] px-2 py-0.5 rounded-full ${
                    font.cyrillic
                      ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                      : 'bg-[#E8E6E0] text-[#6E6A64]'
                  }`}
                >
                  {font.cyrillic ? 'RUS · ENG' : 'ENG'}
                </span>
              </div>

              {/* Превью текста */}
              <div className="px-5 py-6 min-h-[96px] flex items-center">
                <p
                  className="text-3xl sm:text-4xl leading-tight text-[#1A1A1A] break-words"
                  style={{ fontFamily: `var(${font.cssVar})` }}
                >
                  {sample}
                </p>
              </div>

              {/* Подсказка, если у шрифта нет кириллицы */}
              {latinOnly && (
                <div className="px-5 pb-4 -mt-2">
                  <span className="text-xs text-[#B45309] bg-[#FEF3C7] rounded-lg px-2.5 py-1 inline-block">
                    Шрифт без кириллицы — подходит для текста на латинице
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
