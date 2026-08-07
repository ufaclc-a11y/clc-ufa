/*
 * Скачивает ВСЕ фото товаров магазина с CDN Wildberries в public/shop-images
 * и пишет data/shop-gallery.generated.ts со списком путей по каждому товару.
 *
 * Первое фото уже лежит как <id>.webp (его качал scripts/download-wb-images.mjs),
 * остальные сохраняем как <id>-2.webp, <id>-3.webp и т.д. Так существующие
 * ссылки в data/shop.ts остаются рабочими.
 *
 * Сколько фото у товара — берём из photoCount в data/wb-dimensions.generated.ts
 * (npm run gen:wb-dimensions). Уже скачанные файлы пропускаем, так что запуск
 * можно повторять.
 *
 * Запуск: npm run gen:shop-gallery
 */

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseImageUrl, photoUrlOn, createBasketResolver } from './lib/wb-basket.mjs'

const ROOT    = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const RAW     = path.join(ROOT, 'data', 'wb-products-raw.json')
const DIMS    = path.join(ROOT, 'data', 'wb-dimensions.generated.ts')
const OUT_DIR = path.join(ROOT, 'public', 'shop-images')
const OUT_TS  = path.join(ROOT, 'data', 'shop-gallery.generated.ts')

const TIMEOUT_MS  = 20_000
const PAUSE_MS    = 150      // не флудим CDN
const MIN_BYTES   = 1_000    // меньше — значит заглушка, а не фото

const resolver = createBasketResolver()

/** photoCount из сгенерированного файла: формат машинный, разбор надёжен. */
function readPhotoCounts() {
  const src = fs.readFileSync(DIMS, 'utf8')
  const map = new Map()
  for (const m of src.matchAll(/^\s+(\d+):\s*\{([^}]*)\}/gm)) {
    const c = m[2].match(/photoCount:\s*(\d+)/)
    if (c) map.set(Number(m[1]), Number(c[1]))
  }
  return map
}

const localName = (id, index) => (index === 1 ? `${id}.webp` : `${id}-${index}.webp`)
const publicPath = name => `/shop-images/${name}`

async function download(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length >= MIN_BYTES ? buf : null
  } catch {
    return null
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const products    = JSON.parse(fs.readFileSync(RAW, 'utf8'))
const photoCounts = readPhotoCounts()

console.log(`Товаров: ${products.length}. Фото к выгрузке: ${
  products.reduce((a, p) => a + (photoCounts.get(p.id) ?? 1), 0)
}\n`)

const gallery  = new Map()
let downloaded = 0, skipped = 0, failed = 0, bytes = 0
const problems = []

for (const p of products) {
  const count = photoCounts.get(p.id) ?? 1
  const loc   = parseImageUrl(p.image)
  const paths = []

  if (!loc) {
    problems.push(`${p.id} «${p.title}» — не удалось разобрать URL картинки`)
    continue
  }

  let host = null   // хост ищем лениво: если всё уже скачано, сеть не нужна

  for (let i = 1; i <= count; i++) {
    const name = localName(p.id, i)
    const file = path.join(OUT_DIR, name)

    if (fs.existsSync(file) && fs.statSync(file).size >= MIN_BYTES) {
      paths.push(publicPath(name))
      skipped++
      continue
    }

    if (host === null) {
      const found = await resolver.resolve(loc)
      if (!found) {
        problems.push(`${p.id} «${p.title}» — карточка не найдена на CDN`)
        break
      }
      host = found.host
    }

    const buf = await download(photoUrlOn(host, loc.vol, loc.part, loc.nm, i))
    if (!buf) {
      failed++
      problems.push(`${p.id} «${p.title}» — фото ${i} из ${count} не скачалось`)
      continue
    }

    fs.writeFileSync(file, buf)
    paths.push(publicPath(name))
    downloaded++
    bytes += buf.length
    process.stdout.write(`\r  скачано ${downloaded}, пропущено ${skipped}`)
    await new Promise(r => setTimeout(r, PAUSE_MS))
  }

  if (paths.length) gallery.set(p.id, paths)
}

const rows = [...gallery.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([id, paths]) => `  ${id}: [${paths.map(p => JSON.stringify(p)).join(', ')}],`)

fs.writeFileSync(OUT_TS, `/* АВТОГЕНЕРАЦИЯ — не редактировать вручную.
 * Источник: фото карточек Wildberries, скачаны в public/shop-images.
 * Обновить: npm run gen:shop-gallery
 * Собрано: ${new Date().toISOString().slice(0, 10)}
 *
 * Первый путь — главное фото товара (оно же ShopItem.image).
 */

/** Галерея товара: пути к локальным фото, по id. */
export const shopGallery: Record<number, string[]> = {
${rows.join('\n')}
}
`)

console.log(`\n\nСкачано: ${downloaded} (${(bytes / 1024 / 1024).toFixed(1)} МБ)`)
console.log(`Уже было: ${skipped}`)
console.log(`Не скачалось: ${failed}`)
if (problems.length) {
  console.log('\nПроблемы:')
  problems.forEach(x => console.log(`  · ${x}`))
}
const sizes = [...gallery.values()].map(v => v.length)
console.log(`\nТоваров с галереей: ${gallery.size} | всего фото: ${sizes.reduce((a, b) => a + b, 0)}`)
console.log('→ data/shop-gallery.generated.ts')
