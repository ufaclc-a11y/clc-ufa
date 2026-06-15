import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Центр лазерной резки — Уфа',
    short_name: 'ЦЛР Уфа',
    description: 'Лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ в Уфе.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1A1A1A',
    theme_color: '#FF6B00',
    lang: 'ru-RU',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
