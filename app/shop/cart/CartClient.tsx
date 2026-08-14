'use client'

import Image from 'next/image'
import Link  from 'next/link'
import { useEffect, useRef } from 'react'
import { useCart } from '@/lib/cart'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { trackGoal } from '@/lib/analytics'

const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

export function CartClient() {
  const { entries, total, count, ready, setQty, remove } = useCart()
  const tracked = useRef(false)

  useEffect(() => {
    if (!ready || tracked.current) return
    tracked.current = true
    trackGoal('view_cart', { count, total })
  }, [count, ready, total])

  return (
    <div className="min-h-screen bg-[#F5F6F9]">
      <div className="mx-auto max-w-[1180px] px-4 py-7 pb-24 sm:px-6 sm:py-10 lg:pb-10">
        <Breadcrumbs items={[
          { label: 'Магазин', href: '/shop' },
          { label: 'Корзина' },
        ]} />

        <ol className="mb-5 flex items-center gap-2 overflow-x-auto text-sm font-semibold text-[#777984]" aria-label="Этапы оформления заказа">
          <li aria-current="step" className="inline-flex min-h-10 items-center rounded-lg bg-white px-3 text-[#17181B] shadow-[0_5px_16px_rgba(37,31,49,0.06)]">Корзина</li>
          <li aria-hidden="true" className="text-[#B6B8C0]">→</li>
          <li className="inline-flex min-h-10 items-center whitespace-nowrap px-2">Доставка</li>
          <li aria-hidden="true" className="text-[#B6B8C0]">→</li>
          <li className="inline-flex min-h-10 items-center px-2">Подтверждение</li>
        </ol>

        <h1 className="mb-7 text-3xl font-extrabold tracking-[-0.035em] text-[#17181B] sm:text-[40px]">
          Корзина
        </h1>

        {/* До гидратации содержимое корзины неизвестно — не мигаем «пусто». */}
        {!ready ? (
          <div className="h-40 animate-pulse rounded-2xl bg-white shadow-[0_10px_28px_rgba(37,31,49,0.07)]" />
        ) : entries.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-[0_10px_28px_rgba(37,31,49,0.07)]">
            <p className="text-[#6E6A64] mb-6">В корзине пока пусто.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A00] px-7 py-3 font-semibold text-white
                transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#E95000] active:translate-y-0 active:bg-[#D84B00]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            >
              Перейти в магазин
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_340px]">
            {/* ── Позиции ── */}
            <ul className="divide-y divide-[#E6E7EC] rounded-2xl bg-white shadow-[0_10px_28px_rgba(37,31,49,0.07)]">
              {entries.map(({ item, qty, sum }) => (
                <li key={item.id} className="flex gap-4 p-4">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl bg-[#F8F8FA] sm:w-24
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                  >
                    <Image src={item.image} alt={item.title} fill className="object-contain" sizes="96px" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.slug}`}
                      className="text-sm text-[#1A1A1A] leading-snug hover:text-[#FF6B00] transition-colors line-clamp-2
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded"
                    >
                      {item.title}
                    </Link>
                    <p className="font-mono text-xs text-[#6E6A64] mt-1">{item.sku}</p>
                    <p className="text-sm text-[#6E6A64] mt-1">{rub(item.price)} за шт.</p>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-[#E8E6E0] rounded-full overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, qty - 1)}
                          aria-label={`Уменьшить количество: ${item.title}`}
                          className="w-9 h-9 text-lg text-[#6E6A64] hover:text-[#1A1A1A] hover:bg-[#F5F4F0] active:bg-[#E8E6E0]
                            transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-inset"
                        >
                          −
                        </button>
                        <span className="w-9 text-center text-sm font-semibold tabular-nums">{qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, qty + 1)}
                          aria-label={`Увеличить количество: ${item.title}`}
                          className="w-9 h-9 text-lg text-[#6E6A64] hover:text-[#1A1A1A] hover:bg-[#F5F4F0] active:bg-[#E8E6E0]
                            transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-inset"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          remove(item.id)
                          trackGoal('remove_from_cart', { product: item.id, qty })
                        }}
                        className="text-xs text-[#6E6A64] hover:text-[#C4341C] transition-colors underline underline-offset-4
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4341C] rounded"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-display text-lg text-[#1A1A1A] tracking-wide tabular-nums">{rub(sum)}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* ── Итог ── */}
              <aside className="rounded-2xl bg-white p-6 shadow-[0_10px_28px_rgba(37,31,49,0.07)] lg:sticky lg:top-[174px]">
              <div className="flex justify-between text-sm text-[#6E6A64] mb-2">
                <span>Товаров</span>
                <span className="tabular-nums">{count} шт.</span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-[#E8E6E0]">
                <span className="text-[#1A1A1A] font-semibold">Итого</span>
                <span className="font-display text-3xl text-[#1A1A1A] tracking-wider tabular-nums">
                  {rub(total)}
                </span>
              </div>

              <p className="text-xs text-[#6E6A64] mt-3 leading-relaxed">
                Доставка рассчитывается отдельно — сообщим при подтверждении заказа.
              </p>

              <Link
                href="/shop/checkout"
                className="mt-5 hidden w-full items-center justify-center rounded-xl bg-[#FF5A00] px-6 py-3 font-semibold text-white
                  shadow-[0_7px_18px_rgba(255,90,0,0.24)] transition-[background-color,transform,box-shadow]
                  hover:-translate-y-0.5 hover:bg-[#E95000] hover:shadow-[0_10px_22px_rgba(255,90,0,0.28)] active:translate-y-0 active:bg-[#D84B00]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 lg:inline-flex"
              >
                Оформить заказ
              </Link>

              <Link
                href="/shop"
                className="mt-3 w-full inline-flex items-center justify-center text-sm text-[#6E6A64]
                  hover:text-[#1A1A1A] transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded"
              >
                Продолжить покупки
              </Link>
            </aside>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E1E2E8] bg-white/95 px-4 py-3 shadow-[0_-10px_28px_rgba(37,31,49,0.1)] backdrop-blur-md lg:hidden">
              <div className="mx-auto flex max-w-[560px] items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#777984]">{count} шт. в корзине</p>
                  <p className="text-xl font-extrabold tabular-nums text-[#17181B]">{rub(total)}</p>
                </div>
                <Link
                  href="/shop/checkout"
                  onClick={() => trackGoal('cart_checkout_click', { count, total })}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FF5A00] px-5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(255,90,0,0.24)] transition-[background-color,transform] hover:bg-[#E95000] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
                >
                  Оформить
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
