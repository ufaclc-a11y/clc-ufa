'use client'

import { useState } from 'react'
import type { DeliveryProviderId, DeliveryQuote } from '@/lib/delivery/types'
import { trackGoal } from '@/lib/analytics'

type Props = {
  itemId: number
}

const providers: { id: DeliveryProviderId; name: string }[] = [
  { id: 'cdek', name: 'СДЭК' },
  { id: 'ozon', name: 'Ozon' },
  { id: 'russian', name: 'Почта России' },
]

const rub = (value: number) => `${value.toLocaleString('ru-RU')} ₽`

export function ProductDeliveryPreview({ itemId }: Props) {
  const [provider, setProvider] = useState<DeliveryProviderId>('cdek')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<DeliveryQuote | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function resetResult() {
    setQuote(null)
    setNotice(null)
  }

  async function calculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!city.trim()) return
    setLoading(true)
    resetResult()

    try {
      const response = await fetch('/api/delivery/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, provider, lines: [{ id: itemId, qty: 1 }] }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Не удалось рассчитать доставку')

      if (data.configured === false) {
        setNotice('Автоматический расчёт пока не подключён — стоимость сообщит менеджер.')
        trackGoal('product_delivery_preview', { product: itemId, provider, result: 'not_configured' })
        return
      }

      const cheapest = (data.quotes as DeliveryQuote[] | undefined)?.[0] ?? null
      setQuote(cheapest)
      setNotice(cheapest ? null : (data.notice ?? 'Тариф для этого города не найден — стоимость уточнит менеджер.'))
      trackGoal('product_delivery_preview', {
        product: itemId,
        provider,
        result: cheapest ? 'quote' : 'no_quote',
        price: cheapest?.priceRub,
      })
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Не удалось рассчитать доставку — стоимость уточнит менеджер.')
      trackGoal('product_delivery_preview', { product: itemId, provider, result: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <details className="group mb-2 border-y border-[#E1E2E8] bg-white" aria-labelledby="delivery-preview-title">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-1 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] [&::-webkit-details-marker]:hidden">
        <span>
          <span id="delivery-preview-title" className="block text-base font-extrabold tracking-[-0.015em] text-[#25262B]">Доставка по России</span>
          <span className="mt-0.5 block text-xs text-[#62646D]">Рассчитать предварительную стоимость</span>
        </span>
        <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-[#62646D] transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </summary>
      <form onSubmit={calculate} className="grid gap-2 pb-4 pt-2 sm:grid-cols-[130px_minmax(0,1fr)_auto]">
        <label className="sr-only" htmlFor="product-delivery-provider">Служба доставки</label>
        <select
          id="product-delivery-provider"
          value={provider}
          onChange={event => { setProvider(event.target.value as DeliveryProviderId); resetResult() }}
          className="min-h-11 cursor-pointer rounded-xl border border-[#DCDDE5] bg-[#F8F8FB] px-3 text-sm font-semibold text-[#34353B] outline-none focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/15"
        >
          {providers.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <label className="sr-only" htmlFor="product-delivery-city">Город доставки</label>
        <input
          id="product-delivery-city"
          value={city}
          onChange={event => { setCity(event.target.value); resetResult() }}
          placeholder="Введите город"
          autoComplete="address-level2"
          className="min-h-11 rounded-xl border border-[#DCDDE5] bg-[#F8F8FB] px-3 text-sm text-[#25262B] outline-none placeholder:text-[#62646D] focus:border-[#FF5A00] focus:bg-white focus:ring-2 focus:ring-[#FF5A00]/15"
        />
        <button
          type="submit"
          disabled={!city.trim() || loading}
          className="min-h-11 cursor-pointer rounded-xl border border-[#FF5A00] px-4 text-sm font-bold text-[#D94D00] transition-[background-color,color] hover:bg-[#FFF2EA] active:bg-[#FFE7D8] disabled:cursor-not-allowed disabled:border-[#DCDDE5] disabled:text-[#9A9CA5] disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] focus-visible:ring-offset-2"
        >
          {loading ? 'Считаем…' : 'Рассчитать'}
        </button>
      </form>
      <div className="min-h-5 pb-4 text-sm" aria-live="polite" aria-busy={loading}>
        {quote && (
          <p className="font-semibold text-[#25262B]">
            От {rub(quote.priceRub)}
            {quote.daysMin !== null && (
              <span className="font-normal text-[#6A6C75]"> · {quote.daysMin}{quote.daysMax && quote.daysMax !== quote.daysMin ? `–${quote.daysMax}` : ''} дн.</span>
            )}
          </p>
        )}
        {notice && <p className="leading-5 text-[#5B3A86]">{notice}</p>}
      </div>
    </details>
  )
}
