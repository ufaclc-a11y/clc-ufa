import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { ShopItem } from '../data/shop'
import { filterAndSortShopItems, isShopSort } from '../lib/shop-catalog'

const item = (id: number, title: string, price: number, inStock = true, category = 'dekor'): ShopItem => ({
  id,
  slug: `item-${id}`,
  sku: `sku-${id}`,
  inStock,
  title,
  category,
  categoryName: category === 'dekor' ? 'Декорации' : 'Органайзеры',
  price,
  image: `/shop-images/${id}.webp`,
  images: [`/shop-images/${id}.webp`],
  wbUrl: 'https://example.com',
  desc: `Описание ${title}`,
})

const items = [
  item(1, 'Яркий сёрф', 1790),
  item(2, 'Органайзер', 890, false, 'organajzery'),
  item(3, 'Белый сёрф', 1490),
]

test('фильтрует каталог по категории, поиску и наличию', () => {
  assert.deepEqual(
    filterAndSortShopItems(items, { category: 'dekor', query: 'сёрф', inStockOnly: true, sort: 'recommended' })
      .map(entry => entry.id),
    [1, 3],
  )
  assert.deepEqual(
    filterAndSortShopItems(items, { category: 'all', query: 'органайзер', inStockOnly: true, sort: 'recommended' }),
    [],
  )
})

test('сортирует каталог, не меняя исходный массив', () => {
  const sorted = filterAndSortShopItems(items, { category: 'all', query: '', inStockOnly: false, sort: 'price-asc' })
  assert.deepEqual(sorted.map(entry => entry.id), [2, 3, 1])
  assert.deepEqual(items.map(entry => entry.id), [1, 2, 3])
})

test('принимает только известные варианты сортировки', () => {
  assert.equal(isShopSort('price-desc'), true)
  assert.equal(isShopSort('popular'), false)
})
