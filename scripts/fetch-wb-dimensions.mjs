/*
 * Выгружает габариты упаковки и вес товаров Wildberries
 * в data/wb-dimensions.generated.ts.
 *
 * Два источника, в порядке доверия:
 *
 * 1. Content API продавца (нужен WB_API_TOKEN в .env.local) — берём его, когда
 *    токен задан. Отдаёт габариты из карточки кабинета: length/width/height в
 *    сантиметрах и weightBrutto в килограммах, причём для ВСЕХ товаров.
 * 2. Публичный CDN карточек (basket-*.wbbasket.ru/.../info/ru/card.json) —
 *    запасной путь без токена. Отдаёт габариты только там, где продавец завёл
 *    их как характеристики товара: у категорий вроде «Рун и алтарей» их нет,
 *    и по ним выгрузка окажется неполной. Именно поэтому основной источник —
 *    API продавца.
 *
 * Запуск: npm run gen:wb-dimensions
 */

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseImageUrl, createBasketResolver } from './lib/wb-basket.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const RAW  = path.join(ROOT, 'data', 'wb-products-raw.json')
const OUT  = path.join(ROOT, 'data', 'wb-dimensions.generated.ts')
const ENV  = path.join(ROOT, '.env.local')

const CONCURRENCY = 4
const HOST_MAX    = 60   // WB со временем добавляет basket-хосты

const CONTENT_API = 'https://content-api.wildberries.ru/content/v2/get/cards/list'
const PAGE_SIZE   = 100

const resolver = createBasketResolver({ hostMax: HOST_MAX })

/** Токен лежит в .env.local — это скрипт разработчика, не серверный код. */
function readToken() {
  if (process.env.WB_API_TOKEN) return process.env.WB_API_TOKEN.trim()
  if (!fs.existsSync(ENV)) return ''
  for (const line of fs.readFileSync(ENV, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^WB_API_TOKEN=(.*)$/)
    if (m) return m[1].trim()
  }
  return ''
}

/**
 * Все карточки продавца через Content API. Возвращает Map по nmID.
 * null — если токена нет или запрос не удался: тогда работаем по CDN.
 */
async function fetchFromContentApi(token) {
  if (!token) return null

  const byId = new Map()
  let cursor = { limit: PAGE_SIZE }

  for (let page = 1; page <= 50; page++) {
    let res
    try {
      res = await fetch(CONTENT_API, {
        method:  'POST',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ settings: { cursor, filter: { withPhoto: -1 } } }),
        signal:  AbortSignal.timeout(30_000),
      })
    } catch (e) {
      console.log(`Content API недоступен (${e.message}) — переключаюсь на публичный CDN`)
      return null
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.log(`Content API вернул ${res.status} ${body.slice(0, 120)} — переключаюсь на публичный CDN`)
      return null
    }

    const data  = await res.json()
    const cards = data?.cards ?? []
    for (const c of cards) if (typeof c.nmID === 'number') byId.set(c.nmID, c)

    if (cards.length < PAGE_SIZE) break
    cursor = { limit: PAGE_SIZE, updatedAt: data.cursor?.updatedAt, nmID: data.cursor?.nmID }
  }

  console.log(`Content API: получено карточек ${byId.size}`)
  return byId
}

/** Габариты из карточки Content API. Сантиметры и граммы — как ждёт остальной код. */
function fromContentCard(card) {
  const d = card?.dimensions
  if (!d) return null
  const cm = v => (typeof v === 'number' && v > 0 ? v : null)
  return {
    packLengthCm: cm(d.length),
    packWidthCm:  cm(d.width),
    packHeightCm: cm(d.height),
    weightGrams:  typeof d.weightBrutto === 'number' && d.weightBrutto > 0
      ? Math.round(d.weightBrutto * 1000)
      : null,
    photoCount:   Array.isArray(card.photos) ? card.photos.length : null,
    slug:         null,          // Content API слаг не отдаёт; он уже зафиксирован в data/shop.ts
    dimsInvalid:  d.isValid === false,
  }
}

/** «77 см» → 77; «0.5 кг» / «0,5 кг» → 0.5. Возвращает null, если числа нет. */
function num(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const m = String(value).replace(',', '.').match(/-?\d+(\.\d+)?/)
  return m ? parseFloat(m[0]) : null
}

/** Достаёт габариты упаковки и вес из options карточки. */
function extract(card) {
  const opts = [
    ...(card.options ?? []),
    ...(card.grouped_options ?? []).flatMap(g => g.options ?? []),
  ]
  const find = re => opts.find(o => re.test(o.name ?? ''))

  const len = num(find(/длина\s+упаковки/i)?.value)
  const wid = num(find(/ширина\s+упаковки/i)?.value)
  const hei = num(find(/высота\s+упаковки/i)?.value)

  const weightOpt = find(/вес.*упаковк/i)
  let grams = null
  if (weightOpt) {
    const v = num(weightOpt.value)
    if (v !== null) {
      // Единица бывает и в названии («Вес с упаковкой (кг)»), и в значении («0.5 кг»).
      const unitSrc = `${weightOpt.name} ${weightOpt.value}`
      grams = /\bкг\b|\(кг\)/i.test(unitSrc) ? Math.round(v * 1000) : Math.round(v)
    }
  }

  return {
    packLengthCm: len,
    packWidthCm:  wid,
    packHeightCm: hei,
    weightGrams:  grams,
    slug:         typeof card.slug === 'string' ? card.slug : null,
    photoCount:   Number.isInteger(card.media?.photo_count) ? card.media.photo_count : null,
  }
}

/** Простой пул: не больше CONCURRENCY запросов одновременно. */
async function mapPool(items, limit, fn) {
  const out = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        out[i] = await fn(items[i], i)
      }
    }),
  )
  return out
}

const products = JSON.parse(fs.readFileSync(RAW, 'utf8'))
console.log(`Карточек к выгрузке: ${products.length}`)

const token    = readToken()
const fromApi  = await fetchFromContentApi(token)
const source   = fromApi ? 'Content API продавца' : 'публичный CDN карточек'
console.log(`Источник: ${source}${fromApi ? '' : ' (токен WB_API_TOKEN не задан)'}\n`)

let done = 0
const results = await mapPool(products, CONCURRENCY, async p => {
  // Приоритет — данные кабинета: публичная карточка отдаёт габариты не всегда.
  const card = fromApi?.get(p.id)
  if (card) {
    const d = fromContentCard(card)
    const missing = ['packLengthCm', 'packWidthCm', 'packHeightCm', 'weightGrams'].filter(k => d[k] === null)
    process.stdout.write(`\r  обработано ${++done}/${products.length}`)
    return { id: p.id, title: p.title, data: d, missing, invalid: d.dimsInvalid }
  }

  const loc = parseImageUrl(p.image)
  if (!loc) return { id: p.id, title: p.title, problem: 'не удалось разобрать URL картинки' }

  const found = await resolver.resolve(loc)
  process.stdout.write(`\r  обработано ${++done}/${products.length}`)
  if (!found) {
    return { id: p.id, title: p.title, problem: `карточка не найдена ни на одном из ${HOST_MAX} хостов` }
  }

  const d = extract(found.card)
  const missing = ['packLengthCm', 'packWidthCm', 'packHeightCm', 'weightGrams'].filter(k => d[k] === null)
  return { id: p.id, title: p.title, data: d, missing }
})

const ok       = results.filter(r => r.data && r.missing.length === 0)
const partial  = results.filter(r => r.data && r.missing.length > 0)
const failed   = results.filter(r => r.problem)

const rows = [...ok, ...partial]
  .sort((a, b) => a.id - b.id)
  .map(r => {
    const d = r.data
    const f = []
    if (d.packLengthCm !== null) f.push(`packLengthCm: ${d.packLengthCm}`)
    if (d.packWidthCm  !== null) f.push(`packWidthCm: ${d.packWidthCm}`)
    if (d.packHeightCm !== null) f.push(`packHeightCm: ${d.packHeightCm}`)
    if (d.weightGrams  !== null) f.push(`weightGrams: ${d.weightGrams}`)
    if (d.photoCount   !== null) f.push(`photoCount: ${d.photoCount}`)
    if (d.slug)                  f.push(`wbSlug: ${JSON.stringify(d.slug)}`)
    return `  ${r.id}: { ${f.join(', ')} },`
  })

const header = `/* АВТОГЕНЕРАЦИЯ — не редактировать вручную.
 * Источник: ${source}.
 * Обновить: npm run gen:wb-dimensions
 * Выгружено: ${new Date().toISOString().slice(0, 10)}
 *
 * Габариты — это размеры УПАКОВКИ (не изделия), они и нужны для расчёта доставки.
 * Вес приведён к граммам.
 */

/** Габариты упаковки и вес товара, как заведены в карточке Wildberries. */
export type WbPackaging = {
  packLengthCm?: number
  packWidthCm?:  number
  packHeightCm?: number
  weightGrams?:  number
  /** Сколько фото у карточки на WB — сколько можно выгрузить в галерею. */
  photoCount?:   number
  wbSlug?:       string
}

export const wbPackaging: Record<number, WbPackaging> = {
${rows.join('\n')}
}
`

fs.writeFileSync(OUT, header)

console.log(`\nПолные габариты + вес: ${ok.length}`)
if (partial.length) {
  console.log(`Неполные данные: ${partial.length}`)
  partial.forEach(r => console.log(`  · ${r.id} ${r.title} — нет: ${r.missing.join(', ')}`))
}

// WB сам помечает габариты, которые считает недостоверными.
const invalid = results.filter(r => r.invalid)
if (invalid.length) {
  console.log(`\nWB пометил габариты как непроверенные: ${invalid.length}`)
  invalid.forEach(r => console.log(`  ? ${r.id} ${r.title}`))
  console.log('  Стоит перепроверить их в карточке — расчёт доставки опирается на эти числа.')
}
if (failed.length) {
  console.log(`Не получено: ${failed.length}`)
  failed.forEach(r => console.log(`  ✖ ${r.id} ${r.title} — ${r.problem}`))
}
console.log(`\nЗаписано: data/wb-dimensions.generated.ts (${rows.length} товаров)`)
