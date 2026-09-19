import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CTASection } from '@/components/CTASection'
import { JsonLd } from '@/components/JsonLd'
import { getPublicCase, publicCases } from '@/lib/public-cases'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return publicCases.map(item => ({ slug: item.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = getPublicCase(slug)
  if (!item) return {}

  const description = item.task.length > 155 ? `${item.task.slice(0, 152).trimEnd()}…` : item.task

  return {
    title: item.title,
    description,
    alternates: { canonical: `https://clc-ufa.ru/cases/${item.id}` },
    openGraph: {
      title: item.title,
      description,
      images: [{ url: item.image, alt: item.imageAlt }],
      type: 'article',
    },
  }
}

export default async function CasePage({ params }: Props) {
  const { slug } = await params
  const item = getPublicCase(slug)
  if (!item) notFound()

  const caseLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `https://clc-ufa.ru/cases/${item.id}#case`,
    url: `https://clc-ufa.ru/cases/${item.id}`,
    name: item.title,
    description: item.task,
    image: `https://clc-ufa.ru${item.image}`,
    inLanguage: 'ru-RU',
    creator: {
      '@type': 'Organization',
      name: 'Центр лазерной резки',
      url: 'https://clc-ufa.ru',
    },
  }

  const facts = [
    { label: 'Количество', value: item.qty },
    { label: 'Срок', value: item.deadline },
    { label: 'Цена', value: item.price },
  ]

  return (
    <>
      <JsonLd data={caseLd} />

      <main className="bg-[#F5F4F0]">
        <section className="border-b border-[#DDDAD3] bg-[#1A1A1A] pt-24 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,1.1fr)] lg:items-center lg:gap-16 lg:py-18">
            <div className="min-w-0">
              <Breadcrumbs
                visual
                darkMode
                items={[{ label: 'Кейсы', href: '/cases' }, { label: item.title }]}
              />
              <h1 className="max-w-2xl text-balance font-display text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                {item.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-[#FF6B00] px-3 py-1 font-bold text-white">{item.category}</span>
                <span className="text-white/65">{item.client}</span>
              </div>
              <Link
                href="/cases"
                className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-white/75 underline decoration-white/30 underline-offset-4 transition-colors duration-200 hover:text-white hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M11 18l-6-6 6-6" />
                </svg>
                Все кейсы
              </Link>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#D4D5D5] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1024px) calc(100vw - 2rem), 640px"
              />
            </div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-18">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <dl className="grid grid-cols-1 divide-y divide-[#E8E6E0] border-y border-[#E8E6E0] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {facts.map(fact => (
                <div key={fact.label} className="min-w-0 px-0 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#77736C]">{fact.label}</dt>
                  <dd className="mt-1 break-words text-lg font-bold leading-snug text-[#1A1A1A]">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <article className="mt-12 space-y-9 lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-x-14 lg:gap-y-12 lg:space-y-0">
              {[
                { heading: 'Задача', text: item.task },
                { heading: 'Решение', text: item.solution },
                { heading: 'Результат', text: item.result },
              ].map(section => (
                <section key={section.heading} className="grid gap-3 lg:contents">
                  <h2 className="font-display text-3xl leading-tight text-[#1A1A1A]">{section.heading}</h2>
                  <p className="max-w-[70ch] break-words text-base leading-[1.8] text-[#4F4B45] sm:text-lg">
                    {section.text}
                  </p>
                </section>
              ))}
            </article>

            {item.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2 border-t border-[#E8E6E0] pt-6" aria-label="Темы кейса">
                {item.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-[#F5F4F0] px-3 py-1.5 text-sm font-semibold text-[#5F5B55]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <CTASection
        dark
        title="Нужен похожий результат?"
        subtitle="Расскажите задачу — уточним детали и подготовим расчёт стоимости и срока."
      />
    </>
  )
}
