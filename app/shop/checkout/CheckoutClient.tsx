'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { trackGoal } from '@/lib/analytics'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DELIVERY_METHODS, type DeliveryMethod } from '@/lib/shop-order'
import type { DeliveryQuote, PickupPoint } from '@/lib/delivery/types'

const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

const field =
  'w-full px-4 py-3 rounded-xl border-2 border-[#E8E6E0] bg-white text-[#1A1A1A] ' +
  'placeholder:text-[#A8A39B] focus:outline-none focus-visible:border-[#FF6B00] ' +
  'focus-visible:ring-2 focus-visible:ring-[#FF6B00]/30 transition-[border-color,box-shadow]'

const label = 'block font-mono text-xs tracking-widest uppercase text-[#6E6A64] mb-2'

export function CheckoutClient() {
  const { entries, total, count, ready, clear } = useCart()

  const [delivery, setDelivery] = useState<DeliveryMethod>('pickup')
  const [sending, setSending]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [done, setDone]         = useState<{ number: string; total: number } | null>(null)

  // Расчёт доставки. Пока ключи СДЭК не заданы, сервер отвечает configured:false,
  // и блок просто не показывается — оформление продолжает работать.
  const [city, setCity]           = useState('')
  const [calcState, setCalcState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [quotes, setQuotes]       = useState<DeliveryQuote[]>([])
  const [points, setPoints]       = useState<PickupPoint[]>([])
  const [notice, setNotice]       = useState<string | null>(null)
  const [quote, setQuote]         = useState<DeliveryQuote | null>(null)
  const [point, setPoint]         = useState<string>('')

  const needsCity = delivery !== 'pickup'
  // Расчёт возможен только у служб с интеграцией. Для Почты России её нет —
  // кнопки быть не должно, иначе покажем чужие тарифы.
  const canCalculate = delivery === 'cdek' || delivery === 'ozon'

  function resetCalc() {
    setCalcState('idle'); setQuotes([]); setPoints([])
    setNotice(null); setQuote(null); setPoint('')
  }

  async function calcDelivery() {
    if (!city.trim()) return
    setCalcState('loading'); setNotice(null)
    // Служба доставки совпадает с выбранным способом получения: cdek | ozon.
    const provider = delivery === 'ozon' ? 'ozon' : 'cdek'
    try {
      const [calcRes, pointsRes] = await Promise.all([
        fetch('/api/delivery/calculate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            city,
            provider,
            lines: entries.map(e => ({ id: e.item.id, qty: e.qty })),
          }),
        }).then(r => r.json()),
        fetch(`/api/delivery/points?city=${encodeURIComponent(city)}&provider=${provider}`)
          .then(r => r.json()),
      ])

      if (calcRes.configured === false) {
        setNotice('Автоматический расчёт пока не подключён — стоимость доставки сообщит менеджер.')
      } else {
        setQuotes(calcRes.quotes ?? [])
        setQuote((calcRes.quotes ?? [])[0] ?? null)
        if (calcRes.notice) setNotice(calcRes.notice)
      }
      setPoints(pointsRes.points ?? [])
    } catch {
      setNotice('Не удалось рассчитать доставку — стоимость сообщит менеджер.')
    } finally {
      setCalcState('done')
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSending(true)
    trackGoal('begin_checkout', { count, total })

    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     fd.get('name'),
          contact:  fd.get('contact'),
          city:     needsCity ? city : '',
          address:  fd.get('address'),
          comment:  fd.get('comment'),
          company:  fd.get('company'),   // honeypot
          delivery,
          lines:    entries.map(e => ({ id: e.item.id, qty: e.qty })),
          // Выбор покупателя: менеджер сверяет его при подтверждении заказа.
          quoteName:  quote?.name ?? '',
          quotePrice: quote?.priceRub ?? null,
          pointCode:  point,
          pointAddress: points.find(p => p.code === point)?.address ?? '',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Не удалось оформить заказ')
        return
      }
      trackGoal('order_submit', { order: data.order, total: data.total })
      setDone({ number: data.order, total: data.total })
      clear()
    } catch {
      setError('Сеть недоступна. Попробуйте ещё раз или напишите в мессенджер.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="pt-24 bg-[#F5F4F0] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs items={[
          { label: 'Магазин', href: '/shop' },
          { label: 'Корзина', href: '/shop/cart' },
          { label: 'Оформление' },
        ]} />

        {done ? (
          <div className="bg-white rounded-2xl border border-[#E8E6E0] p-10 text-center max-w-xl mx-auto">
            <h1 className="font-display text-3xl text-[#1A1A1A] tracking-wider mb-3">Заказ принят</h1>
            <p className="text-[#2D2D2D] mb-2">
              Номер заказа <span className="font-mono font-semibold">{done.number}</span>,
              сумма {rub(done.total)}.
            </p>
            <p className="text-[#6E6A64] leading-relaxed mb-8">
              Мы свяжемся с вами, уточним доставку и пришлём ссылку на оплату.
              Оплата на сайте не проводилась.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-[#FF6B00] text-white font-semibold px-7 py-3 rounded-full
                hover:bg-[#e65f00] active:bg-[#cc5500] transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            >
              Вернуться в магазин
            </Link>
          </div>
        ) : !ready ? (
          <div className="h-64 rounded-2xl bg-white border border-[#E8E6E0] animate-pulse" />
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E6E0] p-10 text-center">
            <p className="text-[#6E6A64] mb-6">Корзина пуста — оформлять нечего.</p>
            <Link href="/shop" className="text-[#FF6B00] font-semibold hover:underline underline-offset-4">
              Перейти в магазин →
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mb-8">
              Оформление заказа
            </h1>

            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
              <div className="bg-white rounded-2xl border border-[#E8E6E0] p-6 space-y-5">
                <div>
                  <label htmlFor="name" className={label}>Ваше имя</label>
                  <input id="name" name="name" className={field} placeholder="Как к вам обращаться" />
                </div>

                <div>
                  <label htmlFor="contact" className={label}>Телефон, e-mail или ник *</label>
                  <input id="contact" name="contact" required className={field}
                    placeholder="+7 999 123-45-67 или @nickname" />
                </div>

                <fieldset>
                  <legend className={label}>Способ получения *</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.entries(DELIVERY_METHODS) as [DeliveryMethod, string][]).map(([key, title]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors ${
                          delivery === key
                            ? 'border-[#FF6B00] bg-[#FF6B00]/5'
                            : 'border-[#E8E6E0] hover:border-[#FF6B00]/40'
                        }`}
                      >
                        <input
                          type="radio" name="delivery" value={key}
                          checked={delivery === key}
                          onChange={() => setDelivery(key)}
                          className="accent-[#FF6B00]"
                        />
                        <span className="text-sm text-[#1A1A1A]">{title}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {needsCity && (
                  <>
                    <div>
                      <label htmlFor="city" className={label}>Город *</label>
                      <div className="flex gap-2">
                        <input
                          id="city" name="city" required className={field}
                          placeholder="Уфа"
                          value={city}
                          onChange={e => { setCity(e.target.value); resetCalc() }}
                        />
                        {canCalculate && (
                          <button
                            type="button"
                            onClick={calcDelivery}
                            disabled={!city.trim() || calcState === 'loading'}
                            className="shrink-0 px-5 rounded-xl border-2 border-[#E8E6E0] text-sm font-semibold text-[#1A1A1A]
                              hover:border-[#FF6B00] hover:text-[#FF6B00] active:bg-[#F5F4F0]
                              disabled:opacity-40 disabled:hover:border-[#E8E6E0] disabled:hover:text-[#1A1A1A]
                              transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                          >
                            {calcState === 'loading' ? '…' : 'Рассчитать'}
                          </button>
                        )}
                      </div>
                    </div>

                    {notice && (
                      <p className="text-sm text-[#6E6A64] bg-[#F5F4F0] border border-[#E8E6E0] rounded-xl px-4 py-3">
                        {notice}
                      </p>
                    )}

                    {quotes.length > 0 && (
                      <fieldset>
                        <legend className={label}>Тариф доставки</legend>
                        <div className="space-y-2">
                          {quotes.slice(0, 6).map(q => (
                            <label
                              key={q.code}
                              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors ${
                                quote?.code === q.code
                                  ? 'border-[#FF6B00] bg-[#FF6B00]/5'
                                  : 'border-[#E8E6E0] hover:border-[#FF6B00]/40'
                              }`}
                            >
                              <span className="flex items-center gap-3 min-w-0">
                                <input
                                  type="radio" name="quote" className="accent-[#FF6B00] shrink-0"
                                  checked={quote?.code === q.code}
                                  onChange={() => setQuote(q)}
                                />
                                <span className="text-sm text-[#1A1A1A] truncate">
                                  {q.name}
                                  {q.daysMin !== null && (
                                    <span className="text-[#6E6A64]">
                                      {' '}· {q.daysMin}{q.daysMax && q.daysMax !== q.daysMin ? `–${q.daysMax}` : ''} дн.
                                    </span>
                                  )}
                                </span>
                              </span>
                              <span className="text-sm font-semibold text-[#1A1A1A] tabular-nums whitespace-nowrap">
                                {rub(q.priceRub)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    )}

                    {points.length > 0 ? (
                      <div>
                        <label htmlFor="point" className={label}>Пункт выдачи</label>
                        <select
                          id="point" className={field}
                          value={point}
                          onChange={e => setPoint(e.target.value)}
                        >
                          <option value="">Выберите пункт выдачи</option>
                          {points.map(p => (
                            <option key={p.code} value={p.code}>{p.address}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="address" className={label}>Адрес или пункт выдачи</label>
                        <input id="address" name="address" className={field}
                          placeholder="Улица, дом или код ПВЗ" />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label htmlFor="comment" className={label}>Комментарий</label>
                  <textarea id="comment" name="comment" rows={3} className={field}
                    placeholder="Пожелания к заказу" />
                </div>

                {/* Honeypot: скрыт от людей, заполняется ботами */}
                <input
                  type="text" name="company" tabIndex={-1} autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] w-px h-px opacity-0 pointer-events-none"
                />

                <p className="text-xs text-[#6E6A64] leading-relaxed">
                  Нажимая «Оформить заказ», вы соглашаетесь с{' '}
                  <Link href="/privacy" className="text-[#FF6B00] hover:underline underline-offset-4">
                    политикой обработки персональных данных
                  </Link>.
                </p>
              </div>

              {/* ── Состав заказа ── */}
              <aside className="bg-white rounded-2xl border border-[#E8E6E0] p-6 lg:sticky lg:top-24">
                <h2 className="font-display text-lg text-[#1A1A1A] tracking-wide mb-4">Ваш заказ</h2>
                <ul className="space-y-2 mb-4">
                  {entries.map(({ item, qty, sum }) => (
                    <li key={item.id} className="flex justify-between gap-3 text-sm">
                      {/* Количество вне обрезаемого текста — иначе длинное название его съедает. */}
                      <span className="text-[#2D2D2D] min-w-0">
                        <span className="line-clamp-2">{item.title}</span>
                        <span className="text-[#6E6A64] tabular-nums">× {qty}</span>
                      </span>
                      <span className="text-[#1A1A1A] tabular-nums whitespace-nowrap">{rub(sum)}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3 border-t border-[#E8E6E0] space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6E6A64]">Товары</span>
                    <span className="text-[#1A1A1A] tabular-nums">{rub(total)}</span>
                  </div>
                  {quote && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6E6A64]">Доставка</span>
                      <span className="text-[#1A1A1A] tabular-nums">{rub(quote.priceRub)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-[#1A1A1A] font-semibold">Итого</span>
                    <span className="font-display text-2xl text-[#1A1A1A] tracking-wider tabular-nums">
                      {rub(total + (quote?.priceRub ?? 0))}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#6E6A64] mt-3 leading-relaxed">
                  {quote
                    ? 'Стоимость доставки предварительная — менеджер подтвердит её вместе с заказом. Оплата по ссылке, которую он пришлёт.'
                    : 'Доставку рассчитаем после выбора города, либо стоимость сообщит менеджер. Оплата — по ссылке от менеджера.'}
                </p>

                {error && (
                  <p role="alert" className="mt-4 text-sm text-[#C4341C] bg-[#C4341C]/5 border border-[#C4341C]/20 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-5 w-full inline-flex items-center justify-center bg-[#FF6B00] text-white font-semibold px-6 py-3 rounded-full
                    hover:bg-[#e65f00] active:bg-[#cc5500] disabled:opacity-60 disabled:cursor-not-allowed
                    transition-colors shadow-[0_2px_12px_rgba(255,107,0,0.3)]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
                >
                  {sending ? 'Отправляем…' : 'Оформить заказ'}
                </button>

                <Link
                  href="/shop/cart"
                  className="mt-3 w-full inline-flex items-center justify-center text-sm text-[#6E6A64] hover:text-[#1A1A1A] transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded"
                >
                  Вернуться в корзину
                </Link>
              </aside>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
