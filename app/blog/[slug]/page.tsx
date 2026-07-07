import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/data/blog'
import { CTASection } from '@/components/CTASection'
import { SITE, organizationRef } from '@/lib/seo'

type Props = { params: { slug: string } }

export async function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts.find(p => p.slug === params.slug)
  if (!post) return {}
  return {
    title:       post.title,
    description: post.description,
    alternates:  { canonical: `https://clc-ufa.ru/blog/${post.slug}` },
    openGraph: {
      title:       post.title,
      description: post.description,
      images:      [{ url: post.image, alt: post.imageAlt }],
      type:        'article',
    },
  }
}

// Simple markdown-ish renderer: handles ## headings, **bold**, bullet/numbered lists, tables, blank lines → paragraphs
function renderContent(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="font-display text-2xl text-[#1A1A1A] tracking-wide mt-8 mb-4">
          {line.replace('## ', '')}
        </h2>
      )
      i++; continue
    }

    // Table (| ... |)
    if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      const rows = tableLines
        .filter(l => !l.match(/^\|[-| ]+\|$/))
        .map(l => l.split('|').filter(c => c.trim()).map(c => c.trim()))
      elements.push(
        <div key={i} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#F5F4F0]">
                {rows[0]?.map((cell, ci) => (
                  <th key={ci} className="text-left px-4 py-2 border border-[#E8E6E0] font-semibold text-[#1A1A1A]">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri} className="hover:bg-[#F5F4F0]/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 border border-[#E8E6E0] text-[#2D2D2D]">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // Bullet list
    if (line.startsWith('- ') || line.match(/^- \*\*/)) {
      const listItems: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].match(/^- \*\*/))) {
        listItems.push(lines[i].replace(/^- /, ''))
        i++
      }
      elements.push(
        <ul key={i} className="my-4 space-y-2">
          {listItems.map((item, li) => (
            <li key={li} className="flex items-start gap-2 text-[#2D2D2D] text-[15px] leading-relaxed">
              <span className="text-[#FF6B00] mt-1 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: boldify(item) }} />
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered list
    if (line.match(/^\d+\./)) {
      const listItems: string[] = []
      while (i < lines.length && lines[i].match(/^\d+\./)) {
        listItems.push(lines[i].replace(/^\d+\.\s*/, ''))
        i++
      }
      elements.push(
        <ol key={i} className="my-4 space-y-2">
          {listItems.map((item, li) => (
            <li key={li} className="flex items-start gap-2 text-[#2D2D2D] text-[15px] leading-relaxed">
              <span className="font-mono text-[#FF6B00] shrink-0 mt-0.5">{li + 1}.</span>
              <span dangerouslySetInnerHTML={{ __html: boldify(item) }} />
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Empty line
    if (line.trim() === '') { i++; continue }

    // Paragraph
    elements.push(
      <p key={i} className="text-[15px] text-[#2D2D2D] leading-[1.8] my-3"
        dangerouslySetInnerHTML={{ __html: boldify(line) }}
      />
    )
    i++
  }

  return <>{elements}</>
}

function boldify(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#1A1A1A]">$1</strong>')
    .replace(/WhatsApp/g, '<a href="https://wa.me/79374838003" target="_blank" rel="noopener noreferrer" class="text-[#25D366] underline decoration-[#25D366]/40 hover:decoration-[#25D366]">WhatsApp</a>')
    .replace(/Telegram/g, '<a href="https://t.me/clcufa" target="_blank" rel="noopener noreferrer" class="text-[#2AABEE] underline decoration-[#2AABEE]/40 hover:decoration-[#2AABEE]">Telegram</a>')
    .replace(/Макс/g, '<a href="https://max.ru/u/f9LHodD0cOJovKYdnmZPaYaDMUKsaiKLd4XDfHDJQDiV-nyK1Csp7gqlTFk" target="_blank" rel="noopener noreferrer" class="font-semibold underline underline-offset-2">Макс</a>')
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find(p => p.slug === params.slug)
  if (!post) notFound()

  const related = blogPosts.filter(p => p.slug !== post.slug).slice(0, 3)
  const date = new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

  const jsonLd = {
    '@context':       'https://schema.org',
    '@type':          'Article',
    '@id':            `${SITE}/blog/${post.slug}#article`,
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
    headline:         post.title,
    description:      post.description,
    image:            `${SITE}${post.image}`,
    datePublished:    post.date,
    dateModified:     post.date,
    articleSection:   post.category,
    inLanguage:       'ru-RU',
    timeRequired:     `PT${post.readTime}M`,
    sourceOrganization: organizationRef,
    author: {
      '@type': 'Organization',
      name:    'Центр лазерной резки',
      url:     'https://clc-ufa.ru',
    },
    publisher: {
      '@type': 'Organization',
      name:    'Центр лазерной резки',
      url:     'https://clc-ufa.ru',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero image */}
      <div className="relative h-[380px] sm:h-[480px] bg-[#1A1A1A] pt-16">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-4 sm:px-6 pb-10">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/blog" className="text-white/50 text-sm hover:text-white transition-colors">← Блог</Link>
            <span className="text-white/30 text-sm">/</span>
            <span className="text-xs font-semibold bg-[#FF6B00] text-white px-3 py-1 rounded-full">
              {post.category}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wider leading-[1.1]">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-white/40">
            <span>{date}</span>
            <span>·</span>
            <span>{post.readTime} мин чтения</span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <article className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-lg text-[#6E6A64] leading-relaxed mb-8 italic">{post.description}</p>
          <div className="prose-like">
            {renderContent(post.content)}
          </div>

          {/* CTA inside article */}
          <div className="mt-12 bg-[#F5F4F0] rounded-2xl p-6 sm:p-8 border border-[#E8E6E0]">
            <h3 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-2">Готовы сделать заказ?</h3>
            <p className="text-sm text-[#6E6A64] mb-5">Напишите нам — рассчитаем стоимость за несколько минут.</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/79374838003?text=Здравствуйте!%20Хочу%20рассчитать%20заказ."
                target="_blank" rel="noopener noreferrer"
                className="bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#1da857] transition-colors"
              >
                WhatsApp
              </a>
              <a
                href="https://t.me/clcufa"
                target="_blank" rel="noopener noreferrer"
                className="bg-[#2AABEE] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#1a9ad9] transition-colors"
              >
                Telegram
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-12 bg-[#F5F4F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-3xl text-[#1A1A1A] tracking-wider mb-8">Другие статьи</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map(p => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group relative aspect-[16/10] rounded-2xl overflow-hidden block bg-[#2D2D2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                >
                  <Image src={p.image} alt={p.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <span className="absolute top-3 left-3 text-xs font-semibold bg-[#FF6B00] text-white px-2.5 py-1 rounded-full">
                    {p.category}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-base text-white tracking-wide leading-snug group-hover:text-[#FF6B00] transition-colors duration-200">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection dark />
    </>
  )
}
