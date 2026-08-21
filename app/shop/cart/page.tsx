import type { Metadata } from 'next'
import { CartClient } from './CartClient'

export const metadata: Metadata = {
  title:       'Корзина',
  description: 'Товары, выбранные к заказу в магазине Центра лазерной резки.',
  // Служебная страница: в индексе ей делать нечего.
  robots:      { index: false, follow: true },
}

export default function CartPage() {
  return <CartClient />
}
