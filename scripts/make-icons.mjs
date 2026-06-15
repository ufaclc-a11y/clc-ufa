import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pub = path.join(root, 'public')
const appDir = path.join(root, 'app')

// Брендовая иконка: тёмный фон, оранжевое кольцо, монограмма «ЦЛР».
const icon = (size, maskable = false) => {
  const pad = maskable ? size * 0.1 : size * 0.06 // safe-zone для maskable
  const r = (size - pad * 2) / 2
  const cx = size / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#1A1A1A"/>
  <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="#FF6B00" stroke-width="${size * 0.05}"/>
  <text x="${cx}" y="${cx}" text-anchor="middle" dominant-baseline="central"
    font-family="'Arial Black','Helvetica Neue',Arial,sans-serif" font-weight="900"
    font-size="${size * 0.34}" fill="#FFFFFF" letter-spacing="${-size * 0.01}">ЦЛР</text>
</svg>`
}

const jobs = [
  { svg: icon(192), out: path.join(pub, 'icon-192.png') },
  { svg: icon(512), out: path.join(pub, 'icon-512.png') },
  { svg: icon(512, true), out: path.join(pub, 'icon-512-maskable.png') },
  { svg: icon(180), out: path.join(appDir, 'apple-icon.png') },
]

for (const j of jobs) {
  await sharp(Buffer.from(j.svg)).png().toFile(j.out)
  console.log('wrote', path.relative(root, j.out))
}
