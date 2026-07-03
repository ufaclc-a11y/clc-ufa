'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const KEY = 'clc-cookie-consent'
const YM_ID = 53776969

declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & { a?: unknown[]; l?: number }
    __ymLoaded?: boolean
  }
}

/** Загружает Яндекс.Метрику через очередь команд + внешний скрипт (без inline — дружит с CSP). */
function loadMetrika() {
  if (typeof window === 'undefined' || window.__ymLoaded) return
  window.__ymLoaded = true

  const stub = function (...args: unknown[]) {
    (stub.a = stub.a || []).push(args)
  } as NonNullable<Window['ym']>
  stub.l = Date.now()
  window.ym = window.ym || stub

  const s = document.createElement('script')
  s.async = true
  s.src = 'https://mc.yandex.ru/metrika/tag.js'
  document.head.appendChild(s)

  window.ym(YM_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    defer: true,
  })
}

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    loadMetrika()
    let v: string | null = null
    try { v = localStorage.getItem(KEY) } catch { /* приватный режим */ }
    if (v === 'accepted' || v === 'declined') return
    setShow(true)
  }, [])

  const acknowledge = () => {
    try { localStorage.setItem(KEY, 'accepted') } catch { /* приватный режим */ }
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      role="status"
      aria-label="Уведомление об использовании cookie"
      className="fixed inset-x-0 bottom-0 z-[9998] p-3 sm:p-4 animate-fade-up"
    >
      <div className="max-w-3xl mx-auto bg-[#1A1A1A] text-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.35)] border border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-white/70 leading-relaxed flex-1">
          Мы используем cookie и Яндекс.Метрику, чтобы сайт работал лучше и удобнее.
          Оставаясь на сайте, вы соглашаетесь с{' '}
          <Link href="/privacy" className="text-[#FF6B00] hover:underline underline-offset-2">
            политикой конфиденциальности
          </Link>.
        </p>
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={acknowledge}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#FF6B00] text-white hover:bg-[#e85f00] transition-colors shadow-[0_2px_12px_rgba(255,107,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  )
}
