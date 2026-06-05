import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import { notFound }      from 'next/navigation'
import { seoPages }      from '@/data/seo-pages'
import { products }      from '@/data/products'
import { services }      from '@/data/services'
import { Breadcrumbs }   from '@/components/Breadcrumbs'
import { ContactButtons } from '@/components/ContactButtons'
import { RichText }       from '@/components/RichText'
import { OrderForm }     from '@/components/OrderForm'
import { CTASection }    from '@/components/CTASection'
import { FAQAccordion }  from '@/components/FAQAccordion'
import { IconCheck, IconBolt, IconTarget, IconArrowUpRight, SymbolIcon } from '@/components/Icons'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return seoPages.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = seoPages.find(p => p.slug === params.slug)
  if (!page) return {}
  return {
    title:       page.title,
    description: page.description,
    alternates:  { canonical: `https://clc-ufa.ru/${page.slug}` },
  }
}

const PROCESS_STEPS = [
  { icon: '✉', text: 'Отправьте файл или опишите задачу в WhatsApp, Telegram или Макс' },
  { icon: '⚡', text: 'Получите расчёт стоимости в течение нескольких минут' },
  { icon: '✓', text: 'Подтвердите заказ и оплатите предоплату' },
  { icon: '◎', text: 'Забирайте готовое изделие в срок' },
]

export default function SeoLandingPage({ params }: Props) {
  const page = seoPages.find(p => p.slug === params.slug)
  if (!page) notFound()

  // Related products: match by material keyword in tags
  const relatedProducts = products
    .filter(p =>
      p.tags.some(t => t.toLowerCase().includes(page.material.toLowerCase().slice(0, 4))) ||
      p.tags.some(t => page.material.toLowerCase().includes(t.toLowerCase().slice(0, 4)))
    )
    .slice(0, 6)

  // Related service
  const relatedService = services.find(s => s.slug === page.service)

  const jsonLd = {
    '@context':  'https://schema.org',
    '@type':     'Service',
    name:         page.h1,
    description:  page.description,
    provider: {
      '@type':     'LocalBusiness',
      name:        'Центр лазерной резки',
      address: {
        '@type':          'PostalAddress',
        addressLocality:  'Уфа',
        addressCountry:   'RU',
      },
    },
    areaServed: { '@type': 'City', name: 'Уфа' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-24 pb-16 bg-[#F5F4F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumbs items={[
            { label: 'Услуги', href: '/services' },
            { label: page.h1 },
          ]} />

          <h1 className="font-display text-5xl sm:text-6xl text-[#1A1A1A] tracking-wider mb-6 leading-tight">
            {page.h1}
          </h1>
          <p className="text-lg text-[#8A8680] leading-relaxed mb-8 max-w-2xl">
            {page.description}
          </p>
          <ContactButtons size="lg" className="mb-12" />

          {/* Body text card */}
          <div className="bg-white rounded-2xl p-8 border border-[#E8E6E0] mb-10">
            <p className="text-[#1A1A1A] leading-[1.85] text-base">{page.bodyText}</p>
          </div>

          {/* Trust signals row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
            {[
              { Icon: IconCheck,        text: 'От 1 штуки' },
              { Icon: IconBolt,         text: 'Срок от 1 дня' },
              { Icon: IconTarget,       text: 'По вашему макету' },
              { Icon: IconArrowUpRight, text: 'Уфа, самовывоз' },
            ].map(s => (
              <div key={s.text} className="bg-white rounded-xl p-4 text-center border border-[#E8E6E0]">
                <div className="flex justify-center mb-1.5">
                  <s.Icon size={20} className="text-[#FF6B00]" />
                </div>
                <div className="text-xs text-[#8A8680] leading-tight font-medium">{s.text}</div>
              </div>
            ))}
          </div>

          {/* Process */}
          <div className="mb-12">
            <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">Как это работает</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROCESS_STEPS.map((s, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#E8E6E0]">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center text-sm font-mono font-semibold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#2D2D2D] leading-snug mt-0.5"><RichText text={s.text} /></p>
                </div>
              ))}
            </div>
          </div>

          {/* Related service */}
          {relatedService && (
            <div className="bg-white rounded-2xl p-6 border border-[#E8E6E0] mb-12 flex items-start gap-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
                <SymbolIcon symbol={relatedService.icon} size={20} className="text-[#FF6B00]" />
              </div>
              <div>
                <h2 className="font-display text-xl text-[#1A1A1A] tracking-wide mb-1">
                  {relatedService.title}
                </h2>
                <p className="text-sm text-[#8A8680] leading-relaxed mb-3">{relatedService.shortDescription}</p>
                <Link
                  href={`/services/${relatedService.slug}`}
                  className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4"
                >
                  Подробнее об услуге →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">
              Что мы изготавливаем из этого материала
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedProducts.map(p => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group relative aspect-square rounded-xl overflow-hidden block bg-[#2D2D2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                >
                  <Image
                    src={p.image}
                    alt={p.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <p className="text-[11px] font-semibold text-white group-hover:text-[#FF6B00] transition-colors leading-snug">
                      {p.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Order form */}
      <section className="py-16 bg-[#F5F4F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl text-[#1A1A1A] tracking-wider mb-2">Оформить заказ</h2>
          <p className="text-[#8A8680] mb-8">Опишите задачу — ответим с расчётом стоимости.</p>
          <OrderForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide">Частые вопросы</h2>
            <Link href="/faq" className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4">
              Все вопросы →
            </Link>
          </div>
          <FAQAccordion limit={5} categories={['order', 'files', 'materials']} />
        </div>
      </section>

      <CTASection dark />
    </>
  )
}
