// Простой in-memory лимитер (фиксированное окно). Достаточно для standalone-деплоя
// (один Node-процесс). Для горизонтального масштабирования заменить на Redis/Upstash.

type Hit = { count: number; resetAt: number }

const store = new Map<string, Hit>()

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfter: number // секунды до сброса окна
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()

  // Изредка чистим протухшие записи, чтобы Map не рос бесконечно.
  if (store.size > 5000) {
    store.forEach((v, k) => { if (v.resetAt < now) store.delete(k) })
  }

  const hit = store.get(key)
  if (!hit || hit.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  hit.count++
  if (hit.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((hit.resetAt - now) / 1000) }
  }
  return { ok: true, remaining: limit - hit.count, retryAfter: 0 }
}

/** Достаёт IP клиента из заголовков прокси (nginx ставит X-Forwarded-For). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
