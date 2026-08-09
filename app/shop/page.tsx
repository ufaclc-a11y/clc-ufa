import type { Metadata } from 'next'
import { ShopClient } from './ShopClient'

export const metadata: Metadata = {
  title: 'Магазин — изделия из дерева и акрила | Центр лазерной резки Уфа',
  description: 'Купить изделия из дерева и акрила своего производства: декор, руны, кормушки, органайзеры, ключницы. Доставка по России, самовывоз в Уфе.',
  keywords: ['магазин изделий из дерева', 'купить декор из дерева', 'изделия лазерной резки', 'декор из фанеры уфа', 'купить кормушку для птиц', 'настенный декор на заказ'],
  alternates: { canonical: 'https://clc-ufa.ru/shop' },
}

export default function ShopPage() {
  return <ShopClient />
}
