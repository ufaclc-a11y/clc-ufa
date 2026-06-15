'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { products }  from '@/data/products'
import { services }  from '@/data/services'
import { blogPosts } from '@/data/blog'

type SearchResult = {
  href:     string
  title:    string
  subtitle: string
  type:     'service' | 'product' | 'blog' | 'page'
}

// Build a static index of all searchable content
const INDEX: SearchResult[] = [
  ...services.map(s => ({
    href:     `/services/${s.slug}`,
    title:    s.title,
    subtitle: s.shortDescription,
    type:     'service' as const,
  })),
  ...products.map(p => ({
    href:     `/products/${p.id}`,
    title:    p.title,
    subtitle: p.description.slice(0, 80) + '…',
    type:     'product' as const,
  })),
  ...blogPosts.map(b => ({
    href:     `/blog/${b.slug}`,
    title:    b.title,
    subtitle: b.description.slice(0, 80) + '…',
    type:     'blog' as const,
  })),
  // Static pages
  { href: '/faq',        title: 'Частые вопросы',               subtitle: 'Ответы на популярные вопросы',     type: 'page' },
  { href: '/about',      title: 'О нас',                        subtitle: 'Производство в Уфе с 2018 года',   type: 'page' },
  { href: '/materials',  title: 'Материалы',                    subtitle: 'С чем мы работаем',                type: 'page' },
  { href: '/cases',      title: 'Кейсы с ценами',               subtitle: 'Реальные заказы и стоимость',      type: 'page' },
  { href: '/promo',      title: 'Акции и специальные условия',  subtitle: 'Скидки от тиража, срочные заказы', type: 'page' },
  { href: '/portfolio',  title: 'Наши работы',                  subtitle: 'Галерея выполненных заказов',      type: 'page' },
  { href: '/contacts',   title: 'Контакты',                     subtitle: 'Адрес, телефон, мессенджеры',      type: 'page' },
  { href: '/b2b',        title: 'Для бизнеса и производств',   subtitle: 'B2B-условия и регулярные поставки', type: 'page' },
  { href: '/partners',   title: 'Партнёрская программа',       subtitle: 'Вознаграждение за рефералов',        type: 'page' },
]

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  service: 'Услуга',
  product: 'Изделие',
  blog:    'Статья',
  page:    'Страница',
}
const TYPE_COLORS: Record<SearchResult['type'], string> = {
  service: 'bg-[#FF6B00]/10 text-[#FF6B00]',
  product: 'bg-[#059669]/10 text-[#059669]',
  blog:    'bg-[#2563EB]/10 text-[#2563EB]',
  page:    'bg-[#6E6A64]/10 text-[#6E6A64]',
}

function normalize(s: string) {
  return s.toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/й/g, 'и')
}

function score(item: SearchResult, q: string): number {
  const nq   = normalize(q)
  const txt  = normalize(`${item.title} ${item.subtitle}`)
  if (normalize(item.title).startsWith(nq)) return 3
  if (normalize(item.title).includes(nq))   return 2
  if (txt.includes(nq))                      return 1
  return 0
}

export function SiteSearch() {
  const [open,    setOpen]    = useState(false)
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) { setQuery(''); inputRef.current?.focus() }
  }, [open])

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Search
  const search = useCallback((q: string) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    const scored = INDEX
      .map(item => ({ item, s: score(item, q) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map(x => x.item)
    setResults(scored)
  }, [])

  return (
    <>
      {/* Десктоп-кнопка */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Поиск по сайту"
        className="hidden md:flex items-center self-stretch gap-2 text-sm text-[#6E6A64] hover:text-white transition-colors px-3 rounded-lg hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="8.5" cy="8.5" r="5.5"/>
          <path d="M13.5 13.5L18 18"/>
        </svg>
        <span>Поиск</span>
      </button>

      {/* Мобильная кнопка */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Поиск"
        className="md:hidden inline-flex items-center justify-center w-9 h-9 text-[#6E6A64] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded-lg"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="8.5" cy="8.5" r="5.5"/>
          <path d="M13.5 13.5L18 18"/>
        </svg>
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Поиск по сайту"
            className="relative w-full max-w-xl bg-[#1A1A1A] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#6E6A64" strokeWidth="1.8" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5.5"/>
                <path d="M13.5 13.5L18 18"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => search(e.target.value)}
                placeholder="Найти услугу, изделие, статью…"
                className="flex-1 bg-transparent text-white placeholder:text-white/30 text-base focus:outline-none"
              />
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-white/30 hover:text-white/60 transition-colors font-mono"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto">
              {query && results.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-white/30">
                  Ничего не найдено по «{query}»
                </div>
              )}
              {!query && (
                <div className="px-5 py-6 text-sm text-white/20 text-center">
                  Введите запрос — найдём услугу, изделие или статью
                </div>
              )}
              {results.map((r, i) => (
                <Link
                  key={r.href}
                  href={r.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors group focus-visible:outline-none focus-visible:bg-white/5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white group-hover:text-[#FF6B00] transition-colors truncate">
                      {r.title}
                    </div>
                    <div className="text-xs text-white/35 mt-0.5 truncate">{r.subtitle}</div>
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[r.type]}`}>
                    {TYPE_LABELS[r.type]}
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
