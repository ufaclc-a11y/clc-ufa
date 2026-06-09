import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { business } from '@/data/contacts'

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
  robots:     { index: true, follow: true },
  alternates: { canonical: 'https://clc-ufa.ru' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type':    'LocalBusiness',
  name:             business.name,
  alternateName:    business.brand,
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
  openingHours: 'Mo-Su 10:00-19:00',
  priceRange:   '₽₽',
  image:        'https://clc-ufa.ru/images/og-image.jpg',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Перейти к содержимому</a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />

        {/* Яндекс.Метрика */}
        <Script id="ym-init" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
          ym(53776969,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
        `}</Script>
        <noscript>
          <div><img src="https://mc.yandex.ru/watch/53776969" style={{position:'absolute',left:'-9999px'}} alt="" /></div>
        </noscript>
      </body>
    </html>
  )
}
