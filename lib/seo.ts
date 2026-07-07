import { reviews } from '@/data/reviews'
import { business } from '@/data/contacts'
import { services } from '@/data/services'

export const SITE = 'https://clc-ufa.ru'

/** Профили компании во внешних сервисах — сигнал идентичности для ИИ и поисковиков. */
export const sameAs = [
  business.telegram,
  business.telegramChannel,
  business.vk,
  business.yandexMaps,
]

/** Сводный рейтинг из реальных отзывов (data/reviews.ts). */
export const aggregateRating = {
  '@type': 'AggregateRating',
  ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
  reviewCount: reviews.length,
  bestRating: 5,
  worstRating: 1,
}

/** Отзывы как schema.org/Review. */
export const reviewLd = reviews.map(r => ({
  '@type': 'Review',
  author: { '@type': 'Person', name: r.name },
  datePublished: r.date,
  reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
  reviewBody: r.text,
}))

/** Каталог услуг для hasOfferCatalog. */
export const offerCatalog = {
  '@type': 'OfferCatalog',
  name: 'Услуги',
  itemListElement: services.map(s => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: s.title,
      url: `${SITE}/services/${s.slug}`,
    },
  })),
}

export const openingHoursSpecification = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: '10:00',
  closes: '19:00',
}

/** Ядро LocalBusiness — переиспользуется как provider в Service-схемах. */
export const localBusinessRef = {
  '@type': 'LocalBusiness',
  '@id': `${SITE}/#business`,
  name: business.name,
  url: SITE,
  telephone: '+79374838003',
  image: `${SITE}/images/og-image.jpg`,
}

export const organizationRef = {
  '@type': 'Organization',
  '@id': `${SITE}/#organization`,
  name: business.name,
  alternateName: business.brand,
  url: SITE,
  telephone: business.phone,
  email: business.email,
  logo: `${SITE}/logo.svg`,
  image: `${SITE}/images/og-image.jpg`,
  sameAs,
}

export const contactPointLd = [
  {
    '@type': 'ContactPoint',
    telephone: business.phone,
    contactType: 'customer service',
    areaServed: 'RU',
    availableLanguage: ['ru'],
  },
  {
    '@type': 'ContactPoint',
    url: business.whatsapp,
    contactType: 'sales',
    areaServed: 'RU',
    availableLanguage: ['ru'],
  },
  {
    '@type': 'ContactPoint',
    url: business.telegram,
    contactType: 'sales',
    areaServed: 'RU',
    availableLanguage: ['ru'],
  },
]

export const serviceOutputFacts = [
  'laser cutting',
  'UV printing',
  'laser engraving',
  'CNC routing',
  'custom awards',
  'signage',
  'nameplates',
  'souvenirs',
]

/** Хлебные крошки. Передавай элементы в порядке от корня; url — без домена. */
export function breadcrumbLd(items: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.url ? { item: `${SITE}${it.url}` } : {}),
    })),
  }
}

/**
 * FAQPage schema. Передавай ТЕ ЖЕ вопросы, что рендерятся на странице
 * (через selectFaqItems из data/faq.ts) — разметка должна совпадать с видимым
 * FAQ-блоком. Ответы — это plain-текст из data/faq.ts (RichText лишь линкует
 * названия мессенджеров, текст не меняется), поэтому подходят как есть.
 */
export function faqPageLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(it => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  }
}

/** Удобный рендер: <JsonLd data={...} /> */
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data) }
}
