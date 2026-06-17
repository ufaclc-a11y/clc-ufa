import { MetadataRoute } from 'next'
import { services }           from '@/data/services'
import { seoPages }           from '@/data/seo-pages'
import { blogPosts }          from '@/data/blog'
import { products }           from '@/data/products'
import { portfolioCategories } from '@/data/portfolio'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://clc-ufa.ru'
  const now  = new Date()

  const statics: MetadataRoute.Sitemap = [
    { url: base,                   priority: 1.0, changeFrequency: 'weekly'  as const },
    { url: `${base}/services`,     priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${base}/b2b`,          priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${base}/portfolio`,    priority: 0.8, changeFrequency: 'weekly'  as const },
    { url: `${base}/products`,     priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${base}/shop`,         priority: 0.7, changeFrequency: 'weekly'  as const },
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
  ].map(p => ({ ...p, lastModified: now }))

  const servicePages: MetadataRoute.Sitemap = services.map(s => ({
    url:             `${base}/services/${s.slug}`,
    lastModified:    now,
    changeFrequency: 'monthly',
    priority:        0.85,
  }))

  const seoLandings: MetadataRoute.Sitemap = seoPages.map(p => ({
    url:             `${base}/${p.slug}`,
    lastModified:    now,
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
    lastModified:    now,
    changeFrequency: 'monthly' as const,
    priority:        0.7,
  }))

  const portfolioCatPages: MetadataRoute.Sitemap = portfolioCategories
    .filter(c => c.id !== 'all')
    .map(c => ({
      url:             `${base}/portfolio/${c.id}`,
      lastModified:    now,
      changeFrequency: 'monthly' as const,
      priority:        0.75,
    }))

  return [...statics, ...servicePages, ...seoLandings, ...blogPages, ...productPages, ...portfolioCatPages]
}
