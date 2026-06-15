// Валидация URL картинок Wildberries для прокси /api/wb-img.
// Разрешён только CDN WB (basket-NN.wbbasket.ru) — защита от open-proxy/SSRF.

const WB_HOST = /^basket-\d+\.wbbasket\.ru$/

/** Возвращает безопасный URL картинки WB или null, если он недопустим. */
export function parseWbImageUrl(raw: string | null | undefined): URL | null {
  if (!raw) return null
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  if (u.protocol !== 'https:') return null
  if (!WB_HOST.test(u.hostname)) return null
  return u
}
