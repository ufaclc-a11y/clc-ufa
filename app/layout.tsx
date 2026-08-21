import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CookieConsent } from '@/components/CookieConsent'
import { MetrikaRouteTracker } from '@/components/MetrikaRouteTracker'
import { CartProvider } from '@/lib/cart'
import { business } from '@/data/contacts'
import {
  sameAs,
  aggregateRating,
  reviewLd,
  offerCatalog,
  openingHoursSpecification,
  contactPointLd,
  serviceOutputFacts,
} from '@/lib/seo'
import { fontVariables } from '@/lib/fonts'

export const metadata: Metadata = {
  metadataBase: new URL('https://clc-ufa.ru'),
  title: {
    default:  'Центр лазерной резки — Лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ в Уфе',
    template: '%s | Центр лазерной резки',
  },
  description:
    'Изготавливаем изделия и детали по вашему макету: лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ в Уфе. Фанера, акрил, ПВХ, дерево, МДФ, композит. Ежедневно с 10:00 до 19:00.',
  keywords: [
    'лазерная резка уфа', 'уф печать уфа', 'гравировка уфа',
    'фрезеровка чпу уфа', 'изготовление медалей уфа',
    'таблички на заказ уфа', 'детали из фанеры уфа',
    'акрил на заказ уфа', 'clc ufa', 'центр лазерной резки уфа',
  ],
  openGraph: {
    type:      'website',
    locale:    'ru_RU',
    url:       'https://clc-ufa.ru',
    siteName:  'Центр лазерной резки',
    title:     'Центр лазерной резки — Лазерная резка, УФ-печать и фрезеровка в Уфе',
    description: 'Воплощаем идеи: изготавливаем изделия из фанеры, акрила, ПВХ, МДФ и других материалов. Медали, таблички, вывески, детали для производств.',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Центр лазерной резки Уфа' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Центр лазерной резки — Уфа',
    description: 'Лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ в Уфе. От одной штуки до партии.',
    images:      ['/images/og-image.jpg'],
  },
  robots:     { index: true, follow: true },
  alternates: {
    canonical: 'https://clc-ufa.ru',
    types: { 'application/rss+xml': 'https://clc-ufa.ru/blog/rss.xml' },
  },
}

export const viewport: Viewport = {
  themeColor: '#FF6B00',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type':    'LocalBusiness',
  '@id':            'https://clc-ufa.ru/#business',
  name:             business.name,
  alternateName:    business.brand,
  slogan:           business.slogan,
  description:      'Изготовление изделий на заказ: лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ в Уфе.',
  url:              'https://clc-ufa.ru',
  telephone:        business.phone,
  email:            business.email,
  address: {
    '@type':            'PostalAddress',
    streetAddress:      'ул. Менделеева, 177, 5 этаж, цех 509',
    addressLocality:    'Уфа',
    addressRegion:      'Республика Башкортостан',
    postalCode:         '450000',
    addressCountry:     'RU',
  },
  geo: {
    '@type':    'GeoCoordinates',
    latitude:   business.coords.lat,
    longitude:  business.coords.lng,
  },
  areaServed:   { '@type': 'City', name: 'Уфа' },
  openingHours: 'Mo-Su 10:00-19:00',
  openingHoursSpecification,
  priceRange:   '₽₽',
  image:        'https://clc-ufa.ru/images/og-image.jpg',
  sameAs,
  contactPoint: contactPointLd,
  knowsAbout:   serviceOutputFacts,
  aggregateRating,
  review:           reviewLd,
  hasOfferCatalog:  offerCatalog,
}

const webSiteLd = {
  '@context': 'https://schema.org',
  '@type':    'WebSite',
  '@id':       'https://clc-ufa.ru/#website',
  name:        business.name,
  url:         'https://clc-ufa.ru',
  inLanguage:  'ru-RU',
  publisher:   { '@id': 'https://clc-ufa.ru/#business' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={fontVariables}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Перейти к содержимому</a>
        <CookieConsent />
        {/* Корзина нужна и шапке (счётчик), и страницам — провайдер оборачивает обе. */}
        <CartProvider>
          <Header />
          <main id="main-content">{children}</main>
        </CartProvider>
        <Footer />

        <Suspense fallback={null}>
          <MetrikaRouteTracker />
        </Suspense>
      </body>
    </html>
  )
}
