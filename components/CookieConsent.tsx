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
    const timer = window.setTimeout(() => setShow(true), 0)
    return () => window.clearTimeout(timer)
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
      className="fixed inset-x-0 bottom-0 z-[9998] animate-fade-up p-2 sm:p-4"
    >
      <div className="mx-auto flex max-w-[920px] items-end gap-3 rounded-2xl border border-[#E2E3E9] bg-white p-3 text-[#25262B] shadow-[0_14px_42px_rgba(39,32,56,0.16)] sm:items-center sm:px-5">
        <p className="min-w-0 flex-1 text-xs leading-5 text-[#62646D] sm:text-sm sm:leading-relaxed">
          Мы используем cookie и Яндекс.Метрику, чтобы сайт работал лучше и удобнее.
          Оставаясь на сайте, вы соглашаетесь с{' '}
          <Link href="/privacy" className="rounded text-[#C64700] underline decoration-[#FFC29E] underline-offset-2 hover:text-[#9D3900] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">
            политикой конфиденциальности
          </Link>.
        </p>
        <div className="flex shrink-0 gap-2.5">
          <button
            onClick={acknowledge}
            className="min-h-11 cursor-pointer rounded-xl bg-[#FF5A00] px-4 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(255,90,0,0.22)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#E95000] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 sm:px-5 sm:text-sm"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  )
}
