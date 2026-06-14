import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images', 'og-image.jpg')

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="12%" cy="88%" r="70%">
      <stop offset="0%" stop-color="#FF6B00" stop-opacity="0.20"/>
      <stop offset="60%" stop-color="#FF6B00" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="90%" cy="8%" r="55%">
      <stop offset="0%" stop-color="#FF6B00" stop-opacity="0.10"/>
      <stop offset="55%" stop-color="#FF6B00" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#1A1A1A"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <rect x="80" y="120" width="64" height="4" fill="#FF6B00"/>
    <text x="160" y="130" fill="#FF6B00" font-size="22" font-weight="700" letter-spacing="6">УФА · ВОПЛОЩАЕМ ИДЕИ</text>
    <text x="80" y="270" fill="#FFFFFF" font-size="92" font-weight="800" letter-spacing="-2">Центр лазерной</text>
    <text x="80" y="372" fill="#FFFFFF" font-size="92" font-weight="800" letter-spacing="-2">резки</text>
    <text x="80" y="470" fill="#FFFFFF" fill-opacity="0.62" font-size="34" font-weight="500">Лазерная резка · УФ-печать · гравировка · фрезеровка ЧПУ</text>
    <text x="80" y="540" fill="#FF6B00" font-size="30" font-weight="700">clc-ufa.ru</text>
  </g>
</svg>`

await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(out)
console.log('OG image written to', out)
