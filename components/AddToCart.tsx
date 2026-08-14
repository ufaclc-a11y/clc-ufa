'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/cart'

type Props = {
  id: number
  inStock: boolean
}

/** Счётчик количества + «В корзину». После добавления предлагает оформить заказ. */
export function AddToCart({ id, inStock }: Props) {
  const { add, entries } = useCart()
  const [qty, setQty] = useState(1)

  const inCart = entries.find(e => e.item.id === id)?.qty ?? 0

  if (!inStock) {
    return (
      <p className="rounded-xl bg-[#F4F2F7] px-4 py-3 text-sm text-[#62646D]">
        Товара сейчас нет в наличии — напишите нам, изготовим под заказ.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Количество */}
      <div className="flex items-center overflow-hidden rounded-xl border border-[#DCDDE5] bg-white">
        <button
          type="button"
          onClick={() => setQty(q => Math.max(1, q - 1))}
          disabled={qty <= 1}
          aria-label="Уменьшить количество"
          className="w-10 h-11 text-xl text-[#6E6A64] hover:text-[#1A1A1A] hover:bg-[#F5F4F0]
            active:bg-[#E8E6E0] disabled:opacity-30 disabled:hover:bg-transparent
            transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-inset"
        >
          −
        </button>
        <span className="w-10 text-center font-semibold text-[#1A1A1A] tabular-nums" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty(q => Math.min(99, q + 1))}
          disabled={qty >= 99}
          aria-label="Увеличить количество"
          className="w-10 h-11 text-xl text-[#6E6A64] hover:text-[#1A1A1A] hover:bg-[#F5F4F0]
            active:bg-[#E8E6E0] disabled:opacity-30 disabled:hover:bg-transparent
            transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-inset"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => add(id, qty)}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF5A00] px-7 font-semibold text-white
          shadow-[0_7px_18px_rgba(255,90,0,0.24)] transition-[background-color,transform,box-shadow]
          hover:-translate-y-0.5 hover:bg-[#E95000] hover:shadow-[0_10px_22px_rgba(255,90,0,0.28)] active:translate-y-0 active:bg-[#D84B00]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
      >
        В корзину
      </button>

      {inCart > 0 && (
        <Link
          href="/shop/cart"
          className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded"
        >
          В корзине {inCart} шт. — оформить →
        </Link>
      )}
    </div>
  )
}
