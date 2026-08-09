'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'

/** Иконка корзины со счётчиком. Пока корзина пуста — ведёт в магазин. */
export function CartButton({ className = '' }: { className?: string }) {
  const { count, ready } = useCart()

  return (
    <Link
      href={count > 0 ? '/shop/cart' : '/shop'}
      aria-label={count > 0 ? `Корзина, товаров: ${count}` : 'Корзина пуста, перейти в магазин'}
      className={`relative w-9 h-9 flex items-center justify-center rounded-full
        bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF6B00]/40
        transition-colors shrink-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]
        focus-visible:ring-offset-2 focus-visible:ring-offset-[#111] ${className}`}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.5a1 1 0 0 0 1-.78L19.5 8H6"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
          className="text-white/70"
        />
        <circle cx="9.5" cy="19" r="1.4" fill="currentColor" className="text-white/70" />
        <circle cx="16.5" cy="19" r="1.4" fill="currentColor" className="text-white/70" />
      </svg>

      {/* До гидратации счётчик не рисуем: на сервере корзина неизвестна и число бы мигало. */}
      {ready && count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
            flex items-center justify-center rounded-full bg-[#FF6B00]
            text-white text-[10px] font-bold tabular-nums leading-none"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
