import type { ShopItem } from '@/data/shop'

export const SHOP_SORTS = {
  recommended: 'Сначала рекомендуемые',
  'price-asc': 'Сначала дешевле',
  'price-desc': 'Сначала дороже',
  name: 'По названию',
} as const

export type ShopSort = keyof typeof SHOP_SORTS

export function isShopSort(value: unknown): value is ShopSort {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(SHOP_SORTS, value)
}

export function filterAndSortShopItems(
  items: ShopItem[],
  options: {
    category: string
    query: string
    inStockOnly: boolean
    sort: ShopSort
  },
): ShopItem[] {
  const query = options.query.trim().toLocaleLowerCase('ru-RU')
  const result = items.filter(item => {
    const inCategory = options.category === 'all' || item.category === options.category
    const inSearch = !query || `${item.title} ${item.categoryName} ${item.desc}`
      .toLocaleLowerCase('ru-RU')
      .includes(query)
    return inCategory && inSearch && (!options.inStockOnly || item.inStock)
  })

  if (options.sort === 'recommended') return result

  return [...result].sort((left, right) => {
    if (options.sort === 'price-asc') return left.price - right.price
    if (options.sort === 'price-desc') return right.price - left.price
    return left.title.localeCompare(right.title, 'ru')
  })
}
