import { portfolioCategories, portfolioItems } from '@/data/portfolio'
import { products } from '@/data/products'
import { shopItems } from '@/data/shop'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-static'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const MAX_IMAGES_PER_PAGE = 50 // Google рекомендует ≤ 1000; 50 — разумная репрезентация

export function GET() {
  const urls: string[] = []

  // Страница каждой категории портфолио → её фотографии.
  for (const c of portfolioCategories) {
    if (c.id === 'all') continue
    const imgs = portfolioItems
      .filter(i => i.category === c.id)
      .slice(0, MAX_IMAGES_PER_PAGE)
    if (!imgs.length) continue
    const images = imgs
      .map(i => `    <image:image><image:loc>${esc(SITE + i.image)}</image:loc></image:image>`)
      .join('\n')
    urls.push(`  <url>\n    <loc>${SITE}/portfolio/${c.id}</loc>\n${images}\n  </url>`)
  }

  // Страница каждого товара → его фото.
  for (const p of products) {
    if (!p.image) continue
    urls.push(
      `  <url>\n    <loc>${SITE}/products/${p.id}</loc>\n    <image:image><image:loc>${esc(SITE + p.image)}</image:loc></image:image>\n  </url>`
    )
  }

  // Страница каждого товара магазина → вся его галерея.
  for (const item of shopItems) {
    if (!item.images.length) continue
    const images = item.images
      .slice(0, MAX_IMAGES_PER_PAGE)
      .map(src => `    <image:image><image:loc>${esc(SITE + src)}</image:loc></image:image>`)
      .join('\n')
    urls.push(`  <url>\n    <loc>${SITE}/shop/${item.slug}</loc>\n${images}\n  </url>`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
