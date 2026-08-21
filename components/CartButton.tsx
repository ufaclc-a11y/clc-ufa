'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'

/** Иконка корзины со счётчиком. Пока корзина пуста — ведёт в магазин. */
export function CartButton({
  className = '',
  variant = 'dark',
  showLabel = false,
}: {
  className?: string
  variant?: 'dark' | 'light'
  showLabel?: boolean
}) {
  const { count, ready } = useCart()

  const light = variant === 'light'

  return (
    <Link
      href={count > 0 ? '/shop/cart' : '/shop'}
      aria-label={count > 0 ? `Корзина, товаров: ${count}` : 'Корзина пуста, перейти в магазин'}
      className={`relative flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-3
        ${light
          ? 'bg-white text-[#25262B] hover:bg-[#F7F4FB] border border-[#E1E2E8] hover:border-[#CFC8DE]'
          : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-[#FF6B00]/40'}
        transition-[background-color,border-color,color,transform] active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]
        focus-visible:ring-offset-2 ${light ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-[#111]'} ${className}`}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.5a1 1 0 0 0 1-.78L19.5 8H6"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
          className={light ? 'text-[#25262B]' : 'text-white/70'}
        />
        <circle cx="9.5" cy="19" r="1.4" fill="currentColor" className={light ? 'text-[#25262B]' : 'text-white/70'} />
        <circle cx="16.5" cy="19" r="1.4" fill="currentColor" className={light ? 'text-[#25262B]' : 'text-white/70'} />
      </svg>

      {showLabel && <span className="hidden text-sm font-semibold sm:inline">Корзина</span>}

      {/* До гидратации счётчик не рисуем: на сервере корзина неизвестна и число бы мигало. */}
      {ready && count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
            flex items-center justify-center rounded-full bg-[#FF6B00]
            text-white text-xs font-bold tabular-nums leading-none"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
