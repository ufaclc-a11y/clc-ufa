import { blogPosts } from '@/data/blog'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-static'

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function GET() {
  const items = [...blogPosts]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map(
      p => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>
      <description>${esc(p.description)}</description>
      <category>${esc(p.category)}</category>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`
    )
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Блог — Центр лазерной резки</title>
    <link>${SITE}/blog</link>
    <description>Советы и статьи о лазерной резке, гравировке, УФ-печати и материалах в Уфе</description>
    <language>ru-RU</language>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
