'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { business } from '@/data/contacts'
import { SiteSearch } from '@/components/SiteSearch'

const nav = [
  { href: '/services',  label: 'Услуги'      },
  { href: '/products',  label: 'Изделия'     },
  { href: '/shop',      label: 'Магазин'     },
  { href: '/portfolio', label: 'Работы'      },
  { href: '/b2b',       label: 'Для бизнеса' },
  { href: '/contacts',  label: 'Контакты'    },
]

export function Header() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-[#111] transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_2px_24px_rgba(0,0,0,0.6)]' : ''
      }`}
    >
      {/* Оранжевая полоска */}
      <div className="h-[3px] bg-gradient-to-r from-[#FF6B00] via-[#FFA500] to-[#FF6B00]" />

      {/* Главная строка: все три секции растянуты на h-16, контент центрируется внутри */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between">

        {/* ── 1. Логотип ── */}
        <Link
          href="/"
          aria-label="Центр лазерной резки — главная"
          className="shrink-0 flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111] rounded"
        >
          <div className="relative w-9 h-9 shrink-0">
            <Image src="/logo.svg" alt="Центр лазерной резки" fill className="object-contain" priority />
          </div>
          <span className="hidden lg:block font-display text-[13px] tracking-[0.12em] leading-none text-white/70 group-hover:text-white transition-colors whitespace-nowrap">
            ЦЕНТР ЛАЗЕРНОЙ РЕЗКИ
          </span>
        </Link>

        {/* ── 2. Навигация — центрируется вертикально ── */}
        <nav className="hidden md:flex items-center gap-5" aria-label="Основная навигация">
          {nav.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center text-sm text-white/55 hover:text-white transition-colors duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* ── 3. Правый блок — всё h-full, items-center ── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Поиск */}
          <SiteSearch />
          {/* Разделитель */}
          <span className="w-px h-5 bg-white/15 shrink-0" aria-hidden="true" />
          {/* Телефон */}
          <a
            href={`tel:${business.phone}`}
            className="flex items-center px-3 text-sm font-mono text-white/50 hover:text-white transition-colors whitespace-nowrap rounded-lg hover:bg-white/5 self-stretch"
          >
            {business.phoneDisplay}
          </a>
          {/* Мессенджеры */}
          <a href={business.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#25D366] hover:bg-[#1fb855] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111] shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          <a href={business.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#2AABEE] hover:bg-[#1a9adc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2AABEE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111] shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          </a>
          <a href={business.max} target="_blank" rel="noopener noreferrer" aria-label="MAX"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-[#2B7FFF] to-[#9B3FE8] hover:brightness-110 transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B3FE8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111] shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M12 3a9 9 0 1 0 4.243 16.93l3.328.99-.99-3.328A9 9 0 0 0 12 3zm0 2a7 7 0 0 1 3.53 13.07l.47 1.578-1.578-.47A7 7 0 1 1 12 5z" fill="white"/><circle cx="12" cy="12" r="2.5" fill="white"/></svg>
          </a>
        </div>

        {/* ── Мобиль ── */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          <SiteSearch />
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded"
          >
            <span className={`w-5 h-[2px] bg-white block transition-transform duration-200 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`w-5 h-[2px] bg-white block transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-[2px] bg-white block transition-transform duration-200 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Мобильное меню ── */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${
          open ? 'max-h-[480px] border-t border-white/8' : 'max-h-0'
        } bg-[#111]`}
      >
        <div className="px-4 py-6 flex flex-col gap-5">
          <nav className="flex flex-col gap-4" aria-label="Мобильная навигация">
            {nav.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display text-2xl text-white tracking-wider hover:text-[#FF6B00] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/10 pt-5 flex flex-col gap-3">
            <a href={`tel:${business.phone}`} className="font-mono text-sm text-white/60">
              {business.phoneDisplay}
            </a>
            <a href={business.whatsapp} target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white text-center font-semibold px-4 py-3 rounded-xl">
              WhatsApp
            </a>
            <a href={business.telegram} target="_blank" rel="noopener noreferrer"
              className="bg-[#2AABEE] text-white text-center font-semibold px-4 py-3 rounded-xl">
              Telegram
            </a>
            <a href={business.max} target="_blank" rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#2B7FFF] to-[#9B3FE8] text-white text-center font-semibold px-4 py-3 rounded-xl">
              MAX
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
