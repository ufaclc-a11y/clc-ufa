import Link from 'next/link'
import type { Case } from '@/data/cases'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ProductCaseGallery } from '@/components/ProductCaseGallery'
import { ProductCaseContact, ProductCaseContactTrigger } from '@/components/ProductCaseContact'
import { caseSections } from '@/lib/case-presentation'

export function ProductFocusedCase({ item, related = [] }: { item: Case; related?: { href: string; title: string }[] }) {
  const images = item.images?.length ? item.images : [{ src: item.image, alt: item.imageAlt }]
  return <ProductCaseContact item={item}><div data-case-layout="product-first" className="bg-[#F5F4F0] text-[#1A1A1A]">
    <section data-product-first-hero className="bg-[#1A1A1A] pt-16 text-white sm:pt-20" aria-labelledby="product-case-title">
      <div className="mx-auto grid max-w-7xl gap-x-14 gap-y-4 px-4 pb-7 sm:px-6 sm:pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="lg:col-start-1 lg:row-start-1">
          <h1 id="product-case-title" className="max-w-2xl text-balance font-display text-[1.8rem] leading-[1.06] sm:text-5xl lg:text-6xl">{item.title}</h1>
          {item.summary && <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-white/80 sm:text-lg">{item.summary}</p>}
        </div>
        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1"><ProductCaseGallery images={images} /></div>
        <div className="lg:col-start-1 lg:row-start-2 lg:self-start"><ProductCaseContactTrigger position="hero" /></div>
      </div>
    </section>
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: 'Кейсы', href: '/cases' }, { label: item.title }]} />
      <article className="divide-y divide-[#DDDAD3]">
        {caseSections(item).map((section, i) => <section key={section.heading} className="grid gap-3 py-6 first:pt-0 sm:grid-cols-[180px_1fr] sm:gap-10 sm:py-8">
          <h2 className="font-display text-3xl"><span aria-hidden="true" className="mr-3 font-sans text-xs text-[#9D3900]">0{i + 1}</span>{section.heading}</h2>
          <p className="max-w-[65ch] text-base leading-[1.8] text-[#4F4B45] sm:text-lg">{section.text}</p>
        </section>)}
      </article>
      <ProductCaseContactTrigger position="final" />
      {related.length > 0 && <nav aria-label="По технологии и типу изделия" className="mt-6 border-t border-[#DDDAD3] pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6E6A64]">По технологии и типу изделия</p>
        <ul className="mt-2 flex flex-wrap gap-x-6">{related.map(link => <li key={link.href}><Link href={link.href} className="inline-flex min-h-11 items-center rounded text-[#9D3900] underline underline-offset-4 hover:text-[#7D2E00] active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">{link.title}</Link></li>)}</ul>
      </nav>}
    </div>
  </div></ProductCaseContact>
}
