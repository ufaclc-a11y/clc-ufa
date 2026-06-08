import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { blogPosts }   from '@/data/blog'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CTASection }  from '@/components/CTASection'

export const metadata: Metadata = {
  title:       'Блог — советы по лазерной резке, материалам и гравировке | Центр лазерной резки',
  description: 'Статьи и советы: как подготовить макет, какой материал выбрать, в чём разница между УФ-печатью и гравировкой. Центр лазерной резки — Уфа.',
  keywords:    ['блог лазерная резка', 'советы по лазерной резке', 'статьи гравировка уфа', 'материалы для резки статья'],
  alternates:  { canonical: 'https://clc-ufa.ru/blog' },
}

function PostCard({ post }: { post: (typeof blogPosts)[number] }) {
  const date = new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative aspect-[16/10] rounded-2xl overflow-hidden block bg-[#2D2D2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
    >
      {/* Photo */}
      <Image
        src={post.image}
        alt={post.imageAlt}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Top: category + read time */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="text-xs font-semibold bg-[#FF6B00] text-white px-3 py-1 rounded-full">
          {post.category}
        </span>
        <span className="text-[10px] text-white/60 font-mono">{post.readTime} мин</span>
      </div>

      {/* Bottom: text */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[10px] text-white/45 mb-2 font-mono">{date}</p>
        <h2 className="font-display text-lg text-white tracking-wide leading-snug mb-1 group-hover:text-[#FF6B00] transition-colors duration-200">
          {post.title}
        </h2>
        <p className="text-xs text-white/55 leading-relaxed line-clamp-2">{post.description}</p>
        <div className="mt-3 text-xs font-semibold text-[#FF6B00] flex items-center gap-1">
          Читать
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform duration-200">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </Link>
  )
}

export default function BlogPage() {
  return (
    <>
      <div className="relative min-h-[360px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        <div className="absolute inset-0">
          <Image
            src="/images/portfolio/tablitchki-001.jpg"
            alt="Блог Центра лазерной резки — советы и статьи"
            fill priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/95 via-[#1A1A1A]/70 to-[#1A1A1A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-14 w-full">
          <Breadcrumbs items={[{ label: 'Блог' }]} darkMode />
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Блог</span>
          <h1 className="font-display text-5xl sm:text-6xl text-white tracking-wider mt-2 mb-4 leading-[1]">
            Советы и статьи
          </h1>
          <p className="text-white/55 text-lg max-w-xl leading-relaxed">
            О материалах, технологиях и том, как правильно подготовить заказ.
          </p>
        </div>
      </div>

      <section className="py-16 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogPosts.map(post => <PostCard key={post.slug} post={post} />)}
          </div>
        </div>
      </section>

      <CTASection dark />
    </>
  )
}
