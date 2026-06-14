/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control',  value: 'on' },
]

const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,          // убирает X-Powered-By: Next.js
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  async redirects() {
    return [
      { source: '/laser-rez',           destination: '/services/lazernaya-rezka', permanent: true },
      { source: '/lazer-rez-fanera',    destination: '/services/lazernaya-rezka', permanent: true },
      { source: '/lazer-rez-acril',     destination: '/services/lazernaya-rezka', permanent: true },
      { source: '/lazer-rez-trafaret',  destination: '/services/lazernaya-rezka', permanent: true },
      { source: '/uv-print-medali',     destination: '/services/uf-pechat',       permanent: true },
      { source: '/uv-print-acrill',     destination: '/services/uf-pechat',       permanent: true },
      { source: '/contact',                      destination: '/contacts',                  permanent: true },
      { source: '/services/izgotovlenie-izdelij', destination: '/products',                   permanent: true },
      { source: '/products/detali-b2b',           destination: '/b2b',                        permanent: true },

      // ── Старый сайт: каталог и изготовление изделий ──
      { source: '/store',                          destination: '/products',                   permanent: true },
      { source: '/izgotovlenie-izdelii',           destination: '/products',                   permanent: true },
      { source: '/izgotovlenie-izdelii-organajzery',              destination: '/products/organajzery', permanent: true },
      { source: '/izgotovlenie-izdelii-kormushki',               destination: '/products/kormushki',   permanent: true },
      { source: '/izgotovlenie-izdelii-kopilki',                 destination: '/products/kopilki',     permanent: true },
      { source: '/izgotovlenie-izdelii-medalnica',               destination: '/products/medalnitsy',  permanent: true },
      { source: '/izgotovlenie-izdelii-zagotovkidlyatvorchestva', destination: '/products/zagotovki',   permanent: true },
      { source: '/izgotovlenie-izdelii-chasy',                   destination: '/products/chasy',       permanent: true },
      { source: '/izgotovlenie-izdelii-vyveski',                 destination: '/products/vyveski',     permanent: true },
      { source: '/izgotovlenie-izdelii-klyuchnica',              destination: '/products/klyuchnitsy', permanent: true },
      { source: '/acril-klishe',                   destination: '/products/akril-klishe',      permanent: true },
      { source: '/signposts',                      destination: '/products/tablichki',         permanent: true },
      { source: '/shildiki',                       destination: '/products/shildiki-abs',      permanent: true },

      // ── Старый сайт: лазерная резка ──
      { source: '/lazer-rez-karton',     destination: '/services/lazernaya-rezka', permanent: true },
      { source: '/lazer-rez-nomerki',    destination: '/products/nomera',          permanent: true },
      { source: '/lazer-rez-menuholder', destination: '/products/tejbl-tenty',     permanent: true },
      { source: '/lazer-rez-breloki',    destination: '/products/breloki',         permanent: true },
      { source: '/lazer-rez-beidjiki',   destination: '/products/bejdzhi',         permanent: true },
      { source: '/lazer-rez-shkatulki',  destination: '/products/shkatulki',       permanent: true },
      { source: '/lazer-rez-statuetki',  destination: '/products/nagrady',         permanent: true },
      { source: '/lazer-rez-heshtegi',   destination: '/products',                 permanent: true },

      // ── Старый сайт: УФ-печать ──
      { source: '/uv-print',          destination: '/services/uf-pechat', permanent: true },
      { source: '/uv-print-fanera',   destination: '/services/uf-pechat', permanent: true },
      { source: '/uv-print-koja',     destination: '/services/uf-pechat', permanent: true },
      { source: '/uv-print-plastick', destination: '/services/uf-pechat', permanent: true },
      { source: '/uvdtf',             destination: '/products/uv-dtf',    permanent: true },

      // ── Старый сайт: фрезеровка ──
      { source: '/frezer-rez',          destination: '/services/frezernaya-rezka-chpu', permanent: true },
      { source: '/frezer-rez-fanery',   destination: '/services/frezernaya-rezka-chpu', permanent: true },
      { source: '/frezer-rez-mdf',      destination: '/services/frezernaya-rezka-chpu', permanent: true },
      { source: '/frezer-rez-akrila',   destination: '/services/frezernaya-rezka-chpu', permanent: true },
      { source: '/frezer-rez-dereva',   destination: '/services/frezernaya-rezka-chpu', permanent: true },
      { source: '/frezer-rez-pvh',      destination: '/services/frezernaya-rezka-chpu', permanent: true },
      { source: '/frezer-rez-menazhnic', destination: '/products/menazhnitsy',          permanent: true },

      // ── Старый сайт: гравировка на металле ──
      { source: '/gravirovka-na-metalle',           destination: '/services/gravirovka-na-metalle', permanent: true },
      { source: '/gravirovka-na-metalle-zhetony',   destination: '/products/zhetony',        permanent: true },
      { source: '/gravirovka-na-metalle-nozh',      destination: '/products/nozhi-gravir',   permanent: true },
      { source: '/gravirovka-na-metalle-medallyah', destination: '/products/medali',         permanent: true },
      { source: '/gravirovka-na-metalle-termosah',  destination: '/products/termosy-gravir', permanent: true },
      { source: '/gravirovka-na-metalle-kruzhkah',  destination: '/products/kruzhki-gravir', permanent: true },
      { source: '/gravirovka-na-metalle-adresniki', destination: '/products/adresniki',      permanent: true },
      { source: '/gravirovka-na-metalle-kulon',     destination: '/products/kulony',         permanent: true },

      // ── Старый сайт: гравировка на дереве/пластике/коже ──
      { source: '/graver-wood',             destination: '/services/gravirovka-na-nemetalah', permanent: true },
      { source: '/graver-wood-fanera',      destination: '/services/gravirovka-na-nemetalah', permanent: true },
      { source: '/graver-wood-kozhi',       destination: '/services/gravirovka-na-nemetalah', permanent: true },
      { source: '/graver-wood-ekokozhi',    destination: '/services/gravirovka-na-nemetalah', permanent: true },
      { source: '/graver-wood-dereve',      destination: '/services/gravirovka-na-nemetalah', permanent: true },
      { source: '/graver-wood-plastike',    destination: '/services/gravirovka-na-nemetalah', permanent: true },
      { source: '/graver-wood-brelokah',    destination: '/products/breloki',                 permanent: true },
      { source: '/graver-wood-organajzerah', destination: '/products/organajzery',            permanent: true },
      { source: '/graver-wood-menazhnicah', destination: '/products/menazhnitsy',             permanent: true },
    ]
  },
}

module.exports = nextConfig
