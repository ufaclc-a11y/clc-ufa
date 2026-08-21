'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart'

type Props = {
  id: number
  price: number
  inStock: boolean
}

export function ProductStickyCart({ id, price, inStock }: Props) {
  const { add, lines } = useCart()
  const [show, setShow] = useState(false)
  const inCart = lines.some(line => line.id === id)

  useEffect(() => {
    const target = document.getElementById('product-primary-buy')
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0.1 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DCDDE5] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(39,32,56,0.12)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <span className="shrink-0 text-xl font-extrabold tabular-nums text-[#17181B]">{price.toLocaleString('ru-RU')} ₽</span>
        {inCart ? (
          <Link href="/shop/cart" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#25262B] px-5 text-sm font-bold text-white hover:bg-[#3A3B42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2">
            Перейти в корзину
          </Link>
        ) : (
          <button
            type="button"
            disabled={!inStock}
            onClick={() => add(id, 1)}
            className="min-h-11 flex-1 cursor-pointer rounded-xl bg-[#C94700] px-5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(141,50,0,0.20)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#B13E00] active:translate-y-0 active:bg-[#9D3700] disabled:cursor-not-allowed disabled:bg-[#73757F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
          >
            {inStock ? 'В корзину' : 'Под заказ'}
          </button>
        )}
      </div>
    </div>
  )
}
