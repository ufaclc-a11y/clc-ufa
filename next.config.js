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
    ]
  },
}

module.exports = nextConfig
