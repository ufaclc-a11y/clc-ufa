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
  const [details, setDetails] = useState(false)

  useEffect(() => {
    let v: string | null = null
    try { v = localStorage.getItem(KEY) } catch { /* приватный режим */ }
    if (v === 'accepted') {
      loadMetrika()
      return
    }
    if (v === 'declined') return
    const timer = window.setTimeout(() => setShow(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const accept = () => {
    try { localStorage.setItem(KEY, 'accepted') } catch { /* приватный режим */ }
    loadMetrika()
    setShow(false)
  }

  const decline = () => {
    try { localStorage.setItem(KEY, 'declined') } catch { /* приватный режим */ }
    setShow(false)
  }

  if (!show) return null

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Уведомление об использовании cookie"
      className="fixed inset-x-0 bottom-0 z-[9998] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-5xl rounded-2xl border border-[#E2E3E9] bg-[#FFF9F5] px-4 py-3 text-[#25262B] shadow-[0_14px_38px_rgba(53,35,24,0.18),0_3px_10px_rgba(53,35,24,0.08)] sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Настройка cookie</p>
            <p className="mt-0.5 text-xs leading-5 text-[#62646D] sm:text-sm">
              Необходимые cookie поддерживают работу сайта. Яндекс.Метрику включим только с вашего согласия.{' '}
              <Link href="/privacy" className="rounded text-[#9D3900] underline decoration-[#D8A684] underline-offset-2 hover:text-[#7D2E00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">
                Политика конфиденциальности
              </Link>
            </p>
            {details && (
              <p className="mt-2 max-w-3xl text-xs leading-5 text-[#62646D]">
                Аналитика помогает понять, какие страницы полезны посетителям. Без согласия внешний счётчик не загружается; корзина и оформление заказа продолжают работать.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setDetails(value => !value)}
              aria-expanded={details}
              className="min-h-11 cursor-pointer rounded-xl px-3 text-sm font-semibold text-[#555760] underline decoration-[#BABCC5] underline-offset-4 hover:text-[#25262B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
            >
              {details ? 'Скрыть детали' : 'Подробнее'}
            </button>
            <button
              type="button"
              onClick={decline}
              className="min-h-11 cursor-pointer rounded-xl border border-[#C9CBD3] bg-white px-4 text-sm font-semibold text-[#34353B] transition-[background-color,border-color] hover:border-[#A8AAB4] hover:bg-[#F7F7FA] active:bg-[#EEEFF3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            >
              Только необходимые
            </button>
            <button
              type="button"
              onClick={accept}
              className="min-h-11 cursor-pointer rounded-xl bg-[#C94700] px-5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(141,50,0,0.18)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#B13E00] active:translate-y-0 active:bg-[#9D3700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            >
              Принять
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
