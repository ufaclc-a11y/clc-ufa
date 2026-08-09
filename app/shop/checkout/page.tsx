import type { Metadata } from 'next'
import { CheckoutClient } from './CheckoutClient'

export const metadata: Metadata = {
  title:       'Оформление заказа | Центр лазерной резки Уфа',
  description: 'Оформление заказа в магазине Центра лазерной резки.',
  // Служебная страница: в индексе ей делать нечего.
  robots:      { index: false, follow: true },
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
