import { blogPosts } from '@/data/blog'
import { products } from '@/data/products'
import { services } from '@/data/services'
import { shopItems } from '@/data/shop'

export type SiteSearchResult = {
  href: string
  title: string
  subtitle: string
  type: 'service' | 'product' | 'shop' | 'blog' | 'page'
}

const staticPages: SiteSearchResult[] = [
  { href: '/faq', title: 'Частые вопросы', subtitle: 'Ответы на популярные вопросы', type: 'page' },
  { href: '/about', title: 'О нас', subtitle: 'Производство в Уфе с 2018 года', type: 'page' },
  { href: '/materials', title: 'Материалы', subtitle: 'С чем мы работаем', type: 'page' },
  { href: '/cases', title: 'Кейсы с ценами', subtitle: 'Реальные заказы и стоимость', type: 'page' },
  { href: '/promo', title: 'Акции и специальные условия', subtitle: 'Скидки от тиража, срочные заказы', type: 'page' },
  { href: '/portfolio', title: 'Наши работы', subtitle: 'Галерея выполненных заказов', type: 'page' },
  { href: '/contacts', title: 'Контакты', subtitle: 'Адрес, телефон, мессенджеры', type: 'page' },
  { href: '/b2b', title: 'Для бизнеса и производств', subtitle: 'B2B-условия и регулярные поставки', type: 'page' },
  { href: '/partners', title: 'Партнёрская программа', subtitle: 'Вознаграждение за рефералов', type: 'page' },
]

const index: SiteSearchResult[] = [
  ...services.map(service => ({
    href: `/services/${service.slug}`,
    title: service.title,
    subtitle: service.shortDescription,
    type: 'service' as const,
  })),
  ...products.map(product => ({
    href: `/products/${product.id}`,
    title: product.title,
    subtitle: product.description.slice(0, 100),
    type: 'product' as const,
  })),
  ...shopItems.map(item => ({
    href: `/shop/${item.slug}`,
    title: item.title,
    subtitle: `${item.categoryName} · ${item.price.toLocaleString('ru-RU')} ₽`,
    type: 'shop' as const,
  })),
  ...blogPosts.map(post => ({
    href: `/blog/${post.slug}`,
    title: post.title,
    subtitle: post.description.slice(0, 100),
    type: 'blog' as const,
  })),
  ...staticPages,
]

function normalize(value: string) {
  return value.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е')
}

export function searchSite(query: string, limit = 8): SiteSearchResult[] {
  const normalizedQuery = normalize(query.trim()).slice(0, 100)
  if (!normalizedQuery) return []

  return index
    .map(item => {
      const title = normalize(item.title)
      const text = `${title} ${normalize(item.subtitle)}`
      const score = title.startsWith(normalizedQuery)
        ? 3
        : title.includes(normalizedQuery)
          ? 2
          : text.includes(normalizedQuery)
            ? 1
            : 0
      return { item, score }
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'ru'))
    .slice(0, Math.max(1, Math.min(limit, 20)))
    .map(result => result.item)
}
