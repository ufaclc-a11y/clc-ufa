/*
 * Поиск актуального basket-хоста Wildberries.
 *
 * Хост, записанный в сохранённом экспорте, устаревает: WB со временем переносит
 * товары между basket-N. Поэтому хост ищем перебором и кэшируем — соседние vol
 * обычно лежат на одном хосте, так что перебор случается редко.
 *
 * Используется scripts/fetch-wb-dimensions.mjs и scripts/download-shop-gallery.mjs.
 */

/** Только CDN WB — та же защита от подмены хоста, что в lib/wb-cdn.ts. */
export const WB_HOST = /^basket-\d+\.wbbasket\.ru$/

export const basketHost = n => `basket-${String(n).padStart(2, '0')}.wbbasket.ru`

export const cardUrlOn  = (n, vol, part, nm) =>
  `https://${basketHost(n)}/vol${vol}/part${part}/${nm}/info/ru/card.json`

export const photoUrlOn = (n, vol, part, nm, index) =>
  `https://${basketHost(n)}/vol${vol}/part${part}/${nm}/images/big/${index}.webp`

/** Из URL картинки достаём vol / part / nmId и номер записанного хоста. */
export function parseImageUrl(imageUrl) {
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

export function createBasketResolver({
  hostMax    = 60,
  probeBatch = 8,
  timeoutMs  = 8_000,
  retries    = 3,
} = {}) {
  const hostByVol = new Map()
  let lastGoodHost = null

  async function getCard(n, vol, part, nm, attempts = 1) {
    for (let i = 1; i <= attempts; i++) {
      try {
        const res = await fetch(cardUrlOn(n, vol, part, nm), {
          signal:  AbortSignal.timeout(timeoutMs),
          headers: { accept: 'application/json' },
        })
        if (res.ok) return await res.json()
        if (res.status === 404) return null
      } catch {
        if (i === attempts) return null
        await new Promise(r => setTimeout(r, 400 * i))
      }
    }
    return null
  }

  /**
   * Возвращает { host, card } или null, если карточки нет ни на одном хосте.
   * Сперва пробуем вероятные хосты (с ретраями, чтобы сетевой сбой не выглядел
   * как «товара нет»), затем полный перебор.
   */
  async function resolve({ vol, part, nm, host: recordedHost }) {
    const hints = [hostByVol.get(vol), lastGoodHost, recordedHost].filter(Number.isInteger)

    for (const h of [...new Set(hints)]) {
      const card = await getCard(h, vol, part, nm, retries)
      if (card) { hostByVol.set(vol, h); lastGoodHost = h; return { host: h, card } }
    }

    const skip = new Set(hints)
    for (let start = 1; start <= hostMax; start += probeBatch) {
      const batch = []
      for (let n = start; n < start + probeBatch && n <= hostMax; n++) {
        if (!skip.has(n)) batch.push(n)
      }
      const found = (await Promise.all(
        batch.map(async n => ({ n, card: await getCard(n, vol, part, nm) })),
      )).find(r => r.card)

      if (found) {
        hostByVol.set(vol, found.n); lastGoodHost = found.n
        return { host: found.n, card: found.card }
      }
    }
    return null
  }

  return { resolve }
}
