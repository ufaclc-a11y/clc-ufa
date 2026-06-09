import type { Metadata } from 'next'
import { ShopClient } from './ShopClient'

export const metadata: Metadata = {
  title: 'Магазин — изделия из дерева и акрила | Центр лазерной резки Уфа',
  description: 'Купить изделия из дерева ручной работы: декор, руны, кормушки, органайзеры, ключницы. Быстрая доставка по России через Wildberries.',
  keywords: ['магазин изделий из дерева', 'купить декор из дерева', 'изделия лазерной резки', 'купить на wildberries', 'декор из фанеры уфа'],
  alternates: { canonical: 'https://clc-ufa.ru/shop' },
}

export default function ShopPage() {
  return <ShopClient />
}
