import Link from 'next/link'
import type { Case } from '@/data/cases'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ProductCaseGallery } from '@/components/ProductCaseGallery'
import { ProductCaseContact, ProductCaseContactTrigger } from '@/components/ProductCaseContact'
import { caseSections } from '@/lib/case-presentation'

export function ProductFocusedCase({ item, related = [] }: { item: Case; related?: { href: string; title: string }[] }) {
  const images = item.images?.length ? item.images : [{ src: item.image, alt: item.imageAlt }]
  const adaptive = item.storyLevel === 'A' || item.storyLevel === 'B' || item.storyLevel === 'C'
  return <ProductCaseContact item={item}><div data-case-layout="product-first" className="bg-[#F5F4F0] text-[#1A1A1A]">
    <section data-product-first-hero className="bg-[#1A1A1A] pt-16 text-white sm:pt-20" aria-labelledby="product-case-title">
      <div className="mx-auto grid max-w-7xl gap-x-14 gap-y-4 px-4 pb-7 sm:px-6 sm:pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="lg:col-start-1 lg:row-start-1">
          <h1 id="product-case-title" className={adaptive ? 'max-w-2xl text-balance font-display text-2xl leading-[1.06] [overflow-wrap:anywhere] sm:text-5xl lg:text-6xl' : 'max-w-2xl text-balance font-display text-[1.8rem] leading-[1.06] sm:text-5xl lg:text-6xl'}>{item.title}</h1>
          {item.summary && <p className={adaptive ? 'mt-3 hidden max-w-[52ch] break-words text-base leading-relaxed text-white/80 lg:block lg:text-lg' : 'mt-3 max-w-[52ch] text-base leading-relaxed text-white/80 sm:text-lg'}>{item.summary}</p>}
        </div>
        <div className={adaptive ? 'min-w-0 max-[359px]:order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1' : 'min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1'}><ProductCaseGallery images={images} compact={adaptive} sequence={item.gallerySequence} /></div>
        <div className={adaptive ? 'max-[359px]:order-1 max-[359px]:[&_p]:hidden lg:col-start-1 lg:row-start-2 lg:self-start' : 'lg:col-start-1 lg:row-start-2 lg:self-start'}><ProductCaseContactTrigger position="hero" /></div>
        {adaptive && item.summary && <p className="max-w-[52ch] break-words text-base leading-relaxed text-white/80 max-[359px]:order-3 lg:hidden">{item.summary}</p>}
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
      {item.video && <section className="mt-12 border-t border-[#DDDAD3] pt-8" aria-label="Видео проекта">
        <h2 className="mb-6 font-display text-3xl">Видео проекта</h2>
        <video controls playsInline preload="metadata" poster={item.video.poster} aria-label={item.title} className="mx-auto max-h-[70vh] w-full max-w-xl rounded-2xl bg-[#1A1A1A] object-contain">
          <source src={item.video.src} type="video/mp4" />
          <a href={item.video.src}>Скачать видео</a>
        </video>
        {item.video.description ? <>
          <p className="mt-6 text-base leading-[1.8] text-[#4F4B45] sm:text-lg">{item.video.description}</p>
          <details className="mt-3 text-sm leading-relaxed text-[#4F4B45]">
            <summary className="min-h-11 cursor-pointer py-3 underline underline-offset-4">Музыка и лицензия</summary>
            <div className="space-y-2 pb-3">{item.video.attribution.split('\n').filter(Boolean).map((line, index) =>
              /^https:\/\//.test(line) ? <p key={index}><a href={line} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{line.startsWith('https://creativecommons.org/') ? 'Лицензия CC BY 4.0' : 'Источник музыки'}</a></p> : <p key={index}>{line}</p>
            )}</div>
          </details>
        </> : <>
          <p className="mt-8 text-base leading-[1.8] sm:text-lg"><Link href="/contacts" className="inline-flex min-h-11 items-center rounded text-[#9D3900] underline underline-offset-4 hover:text-[#7D2E00] active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">{item.video.contactText}</Link></p>
          <p className="mt-6 whitespace-pre-line break-words text-sm leading-relaxed text-[#4F4B45]">{item.video.attribution}</p>
        </>}
      </section>}
      <ProductCaseContactTrigger position="final" />
      {related.length > 0 && <nav aria-label="По технологии и типу изделия" className="mt-6 border-t border-[#DDDAD3] pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6E6A64]">По технологии и типу изделия</p>
        <ul className="mt-2 flex flex-wrap gap-x-6">{related.map(link => <li key={link.href}><Link href={link.href} className="inline-flex min-h-11 items-center rounded text-[#9D3900] underline underline-offset-4 hover:text-[#7D2E00] active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">{link.title}</Link></li>)}</ul>
      </nav>}
    </div>
  </div></ProductCaseContact>
}
