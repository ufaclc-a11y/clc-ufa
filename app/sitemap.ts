import { MetadataRoute } from 'next'
import { services }           from '@/data/services'
import { seoPages }           from '@/data/seo-pages'
import { blogPosts }          from '@/data/blog'
import { products }           from '@/data/products'
import { shopItems }          from '@/data/shop'
import { portfolioCategories } from '@/data/portfolio'

// lastModified указываем только там, где знаем реальную дату (посты блога).
// «Дата билда» у всех URL сразу обесценивает lastmod для поисковиков.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://clc-ufa.ru'

  const statics: MetadataRoute.Sitemap = [
    { url: base,                   priority: 1.0, changeFrequency: 'weekly'  as const },
    { url: `${base}/services`,     priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${base}/b2b`,          priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${base}/portfolio`,    priority: 0.8, changeFrequency: 'weekly'  as const },
    { url: `${base}/products`,     priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${base}/shop`,         priority: 0.7, changeFrequency: 'weekly'  as const },
    // Правовые страницы магазина: покупатель должен их находить, поэтому в карте.
    { url: `${base}/oferta`,            priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${base}/dostavka-i-oplata`, priority: 0.5, changeFrequency: 'yearly' as const },
    { url: `${base}/vozvrat`,           priority: 0.4, changeFrequency: 'yearly' as const },
    { url: `${base}/about`,        priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${base}/calculator`,   priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${base}/fonts`,        priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${base}/faq`,          priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${base}/materials`,    priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${base}/blog`,         priority: 0.8, changeFrequency: 'weekly'  as const },
    { url: `${base}/cases`,        priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${base}/promo`,        priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${base}/partners`,     priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${base}/contacts`,     priority: 0.7, changeFrequency: 'yearly'  as const },
    { url: `${base}/privacy`,      priority: 0.2, changeFrequency: 'yearly'  as const },
  ]

  const servicePages: MetadataRoute.Sitemap = services.map(s => ({
    url:             `${base}/services/${s.slug}`,
    changeFrequency: 'monthly',
    priority:        0.85,
  }))

  const seoLandings: MetadataRoute.Sitemap = seoPages.map(p => ({
    url:             `${base}/${p.slug}`,
    changeFrequency: 'monthly',
    priority:        0.75,
  }))

  const blogPages: MetadataRoute.Sitemap = blogPosts.map(p => ({
    url:             `${base}/blog/${p.slug}`,
    lastModified:    new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority:        0.65,
  }))

  const productPages: MetadataRoute.Sitemap = products.map(p => ({
    url:             `${base}/products/${p.id}`,
    changeFrequency: 'monthly' as const,
    priority:        0.7,
  }))

  const portfolioCatPages: MetadataRoute.Sitemap = portfolioCategories
    .filter(c => c.id !== 'all')
    .map(c => ({
      url:             `${base}/portfolio/${c.id}`,
      changeFrequency: 'monthly' as const,
      priority:        0.75,
    }))

  const shopPages: MetadataRoute.Sitemap = shopItems.map(i => ({
    url:             `${base}/shop/${i.slug}`,
    changeFrequency: 'weekly' as const,
    priority:        0.7,
  }))

  return [...statics, ...servicePages, ...seoLandings, ...blogPages, ...productPages, ...portfolioCatPages, ...shopPages]
}
