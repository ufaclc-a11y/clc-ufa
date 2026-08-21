'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { SiteSearchResult } from '@/lib/site-search'

const TYPE_LABELS: Record<SiteSearchResult['type'], string> = {
  service: 'Услуга', product: 'На заказ', shop: 'В магазине', blog: 'Статья', page: 'Страница',
}

const TYPE_COLORS: Record<SiteSearchResult['type'], string> = {
  service: 'bg-[#FF6B00]/15 text-[#FF9A52]',
  product: 'bg-[#10B981]/15 text-[#6EE7B7]',
  shop: 'bg-[#A855F7]/15 text-[#D8B4FE]',
  blog: 'bg-[#3B82F6]/15 text-[#93C5FD]',
  page: 'bg-white/10 text-white/70',
}

export function SiteSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SiteSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const lastFocusRef = useRef<HTMLElement | null>(null)

  const openSearch = useCallback((trigger?: HTMLElement | null) => {
    lastFocusRef.current = trigger ?? (document.activeElement as HTMLElement | null)
    setQuery('')
    setResults([])
    setLoading(false)
    setOpen(true)
  }, [])

  const closeSearch = useCallback(() => {
    setOpen(false)
    window.setTimeout(() => lastFocusRef.current?.focus(), 0)
  }, [])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (open) closeSearch()
        else openSearch()
        return
      }
      if (!open) return
      if (event.key === 'Escape') {
        event.preventDefault()
        closeSearch()
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ))
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeSearch, open, openSearch])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open || !query.trim()) return

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        if (!response.ok) throw new Error('search failed')
        const data = await response.json() as { results?: SiteSearchResult[] }
        setResults(data.results ?? [])
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setResults([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 160)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [open, query])

  return (
    <>
      <button
        type="button"
        onClick={event => openSearch(event.currentTarget)}
        aria-label="Поиск по сайту"
        aria-haspopup="dialog"
        className="hidden min-h-11 items-center self-stretch gap-2 rounded-lg px-3 text-sm text-white/70 transition-[background-color,color] hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] xl:flex"
      >
        <SearchIcon size={14} />
        <span>Поиск</span>
      </button>

      <button
        type="button"
        onClick={event => openSearch(event.currentTarget)}
        aria-label="Поиск по сайту"
        aria-haspopup="dialog"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] xl:hidden"
      >
        <SearchIcon size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[10vh]">
          <button type="button" aria-label="Закрыть поиск" onClick={closeSearch}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm" />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-search-title"
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1A] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
          >
            <h2 id="site-search-title" className="sr-only">Поиск по сайту</h2>
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <span className="text-white/55"><SearchIcon size={18} /></span>
              <label htmlFor="site-search-input" className="sr-only">Поисковый запрос</label>
              <input
                id="site-search-input"
                ref={inputRef}
                name="site-search"
                type="search"
                autoComplete="off"
                value={query}
                onChange={event => {
                  const value = event.target.value
                  setQuery(value)
                  if (!value.trim()) {
                    setResults([])
                    setLoading(false)
                  }
                }}
                placeholder="Найти услугу, товар, статью…"
                aria-controls="site-search-results"
                aria-describedby="site-search-status"
                className="min-h-11 flex-1 bg-transparent text-base text-white placeholder:text-white/45 focus:outline-none"
              />
              <button type="button" onClick={closeSearch} aria-label="Закрыть поиск"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-xs font-mono text-white/55 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">
                ESC
              </button>
            </div>

            <div id="site-search-results" className="max-h-[400px] overflow-y-auto">
              <p id="site-search-status" role="status" aria-live="polite" className="sr-only">
                {loading ? 'Идёт поиск' : query && results.length ? `Найдено: ${results.length}` : ''}
              </p>
              {loading && <div className="px-5 py-8 text-center text-sm text-white/55">Ищем…</div>}
              {!loading && query && results.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-white/55">Ничего не найдено по «{query}»</div>
              )}
              {!loading && !query && (
                <div className="px-5 py-6 text-center text-sm text-white/55">Введите запрос — найдём услугу, товар или статью</div>
              )}
              {!loading && results.map(result => (
                <Link key={result.href} href={result.href} onClick={closeSearch}
                  className="group flex min-h-16 items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white transition-colors group-hover:text-[#FF8A33]">{result.title}</div>
                    <div className="mt-0.5 truncate text-xs text-white/55">{result.subtitle}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_COLORS[result.type]}`}>
                    {TYPE_LABELS[result.type]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function SearchIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M13.5 13.5L18 18" />
    </svg>
  )
}
