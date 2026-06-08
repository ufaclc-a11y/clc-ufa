/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  async redirects() {
    return [
      { source: '/laser-rez',           destination: '/services/lazernaya-rezka', permanent: true },
      { source: '/lazer-rez-fanera',    destination: '/services/lazernaya-rezka', permanent: true },
      { source: '/lazer-rez-acril',     destination: '/services/lazernaya-rezka', permanent: true },
      { source: '/lazer-rez-trafaret',  destination: '/services/lazernaya-rezka', permanent: true },
      { source: '/uv-print-medali',     destination: '/services/uf-pechat',       permanent: true },
      { source: '/uv-print-acrill',     destination: '/services/uf-pechat',       permanent: true },
      { source: '/contact',             destination: '/contacts',                  permanent: true },
    ]
  },
}

module.exports = nextConfig
