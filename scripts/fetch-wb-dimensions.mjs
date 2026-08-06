/*
 * Выгружает габариты упаковки и вес товаров из карточек Wildberries
 * и пишет data/wb-dimensions.generated.ts.
 *
 * Источник — публичный CDN карточек: тот же basket-хост, что и у картинки
 * товара, только путь .../info/ru/card.json. URL берём из data/wb-products-raw.json,
 * подменяя хвост /images/... на /info/ru/card.json.
 *
 * Запуск: npm run gen:wb-dimensions
 */

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const RAW  = path.join(ROOT, 'data', 'wb-products-raw.json')
const OUT  = path.join(ROOT, 'data', 'wb-dimensions.generated.ts')

const CONCURRENCY = 4
const RETRIES     = 3
const TIMEOUT_MS  = 20_000
const HOST_MAX    = 60   // WB со временем добавляет basket-хосты
const PROBE_BATCH = 8

/** Только CDN WB — та же защита, что в lib/wb-cdn.ts. */
const WB_HOST = /^basket-\d+\.wbbasket\.ru$/

/**
 * Хост в сохранённом экспорте устаревает: WB переносит товары между basket-N.
 * Поэтому храним найденные хосты — соседние vol обычно лежат на одном хосте,
 * и это резко сокращает перебор.
 */
const hostByVol = new Map()
let lastGoodHost = null

const host = n => `basket-${String(n).padStart(2, '0')}.wbbasket.ru`
const cardUrlOn = (n, vol, part, nm) =>
  `https://${host(n)}/vol${vol}/part${part}/${nm}/info/ru/card.json`

/** Из URL картинки достаём vol / part / nmId и номер записанного хоста. */
function parseImageUrl(imageUrl) {
  let u
  try { u = new URL(imageUrl) } catch { return null }
  if (u.protocol !== 'https:' || !WB_HOST.test(u.hostname)) return null
  const m = u.pathname.match(/^\/vol(\d+)\/part(\d+)\/(\d+)\//)
  if (!m) return null
  return {
    vol: m[1], part: m[2], nm: m[3],
    host: Number(u.hostname.match(/^basket-(\d+)\./)[1]),
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
  }
}

async function fetchCard(url) {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    const ctrl = AbortSignal.timeout(TIMEOUT_MS)
    try {
      const res = await fetch(url, { signal: ctrl, headers: { accept: 'application/json' } })
      if (res.status === 404) return { notFound: true }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return { card: await res.json() }
    } catch (e) {
      if (attempt === RETRIES) return { error: e.message }
      await new Promise(r => setTimeout(r, 400 * attempt))
    }
  }
}

/** Быстрая проверка одного хоста без ретраев — для перебора. */
async function tryHost(n, vol, part, nm) {
  try {
    const res = await fetch(cardUrlOn(n, vol, part, nm), {
      signal:  AbortSignal.timeout(8_000),
      headers: { accept: 'application/json' },
    })
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

/**
 * Ищет карточку: сперва подсказки (кэш по vol, последний удачный хост,
 * хост из экспорта), затем полный перебор basket-01..HOST_MAX.
 */
async function resolveCard({ vol, part, nm, host: recordedHost }) {
  const hints = [hostByVol.get(vol), lastGoodHost, recordedHost]
    .filter(h => Number.isInteger(h))

  // По вероятным хостам идём с ретраями, чтобы сетевой сбой не выглядел как «нет товара».
  for (const h of [...new Set(hints)]) {
    const r = await fetchCard(cardUrlOn(h, vol, part, nm))
    if (r.card) { hostByVol.set(vol, h); lastGoodHost = h; return { card: r.card, host: h } }
  }

  const skip = new Set(hints)
  for (let start = 1; start <= HOST_MAX; start += PROBE_BATCH) {
    const batch = []
    for (let n = start; n < start + PROBE_BATCH && n <= HOST_MAX; n++) {
      if (!skip.has(n)) batch.push(n)
    }
    const found = (await Promise.all(
      batch.map(async n => ({ n, card: await tryHost(n, vol, part, nm) })),
    )).find(r => r.card)

    if (found) {
      hostByVol.set(vol, found.n); lastGoodHost = found.n
      return { card: found.card, host: found.n }
    }
  }
  return null
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

let done = 0
const results = await mapPool(products, CONCURRENCY, async p => {
  const loc = parseImageUrl(p.image)
  if (!loc) return { id: p.id, title: p.title, problem: 'не удалось разобрать URL картинки' }

  const found = await resolveCard(loc)
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
    if (d.slug)                  f.push(`wbSlug: ${JSON.stringify(d.slug)}`)
    return `  ${r.id}: { ${f.join(', ')} },`
  })

const header = `/* АВТОГЕНЕРАЦИЯ — не редактировать вручную.
 * Источник: карточки Wildberries (basket-*.wbbasket.ru/.../info/ru/card.json).
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
if (failed.length) {
  console.log(`Не получено: ${failed.length}`)
  failed.forEach(r => console.log(`  ✖ ${r.id} ${r.title} — ${r.problem}`))
}
console.log(`\nЗаписано: data/wb-dimensions.generated.ts (${rows.length} товаров)`)
