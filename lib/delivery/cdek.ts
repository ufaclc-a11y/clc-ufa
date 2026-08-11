import type {
  DeliveryDestination, DeliveryProvider, DeliveryQuote, Parcel, PickupPoint,
} from './types'

/**
 * Клиент СДЭК API v2 (серверный).
 *
 * Из браузера сюда не ходим: CSP запрещает сторонние запросы, да и ключи
 * нельзя отдавать клиенту. Все обращения — через наши роуты /api/delivery/*.
 *
 * Контур переключается CDEK_TEST: тестовый api.edu.cdek.ru работает на
 * отдельных учётных данных, которые СДЭК выдаёт по заявке (доступы от личного
 * кабинета не подходят).
 *
 * Проверено вживую: эндпоинт авторизации и формат запроса (form-urlencoded,
 * grant_type=client_credentials). Разбор ответов тарифов и ПВЗ написан по
 * официальной схеме и намеренно устойчив к лишним/недостающим полям — но до
 * первого запуска с боевыми ключами считать его подтверждённым нельзя.
 */

const TEST_BASE = 'https://api.edu.cdek.ru/v2'
const PROD_BASE = 'https://api.cdek.ru/v2'

const TIMEOUT_MS = 15_000

const account = () => process.env.CDEK_ACCOUNT?.trim() ?? ''
const secret  = () => process.env.CDEK_SECRET?.trim() ?? ''
const isTest  = () => (process.env.CDEK_TEST ?? 'true').toLowerCase() !== 'false'
const baseUrl = () => (isTest() ? TEST_BASE : PROD_BASE)
/** Город отправления. Меняется без правки кода. */
const fromCity = () => process.env.CDEK_FROM_CITY?.trim() || 'Уфа'

/* ── Токен ──────────────────────────────────────────────────────────────── */

let token: { value: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt) return token.value

  const res = await fetch(`${baseUrl()}/oauth/token?parameters`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     account(),
      client_secret: secret(),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })

  if (!res.ok) {
    throw new Error(`СДЭК: авторизация не прошла (${res.status})`)
  }
  const data = await res.json()
  if (!data?.access_token) throw new Error('СДЭК: в ответе нет токена')

  // Обновляем на минуту раньше срока, чтобы не поймать протухший токен в полёте.
  const ttl = Number(data.expires_in ?? 3600)
  token = { value: data.access_token, expiresAt: Date.now() + (ttl - 60) * 1000 }
  return token.value
}

async function api(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization:  `Bearer ${await getToken()}`,
      'Content-Type': 'application/json',
      Accept:         'application/json',
      ...(init?.headers ?? {}),
    },
    /*
     * Next.js подменяет глобальный fetch и по умолчанию кэширует GET в роутах.
     * Тарифы и пункты выдачи должны быть свежими, а кэш ещё и переживает
     * рестарт службы (лежит в .next/cache), пряча ошибки конфигурации.
     */
    cache:  'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`СДЭК: ${path} вернул ${res.status}`)
  return res.json()
}

/* ── Города ─────────────────────────────────────────────────────────────── */

const cityCache = new Map<string, number | null>()

/** Код города СДЭК по названию. null — если город не найден. */
async function cityCode(city: string): Promise<number | null> {
  const key = city.trim().toLowerCase()
  if (!key) return null
  if (cityCache.has(key)) return cityCache.get(key)!

  const url = `/location/cities?country_codes=RU&size=1&city=${encodeURIComponent(city.trim())}`
  const data = await api(url)
  const code = Array.isArray(data) && typeof data[0]?.code === 'number' ? data[0].code : null

  if (code === null) {
    // Не молчим: без этого «город не найден» неотличим от ошибки конфигурации.
    console.error('СДЭК: город «%s» не разобран, ответ справочника: %s',
      city, JSON.stringify(data)?.slice(0, 300))
  }
  // null не кэшируем: иначе разовый сбой запомнится до перезапуска службы.
  if (code !== null) cityCache.set(key, code)
  return code
}

/* ── Разбор ответов ─────────────────────────────────────────────────────── */

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

/*
 * delivery_mode кодирует направление «откуда-куда». Значения сверены с живым
 * ответом API, а не взяты из памяти:
 *   1 дверь-дверь      2 дверь-склад     3 склад-дверь     4 склад-склад
 *   6 дверь-постамат   7 склад-постамат  8 постамат-дверь  9 постамат-склад
 *   10 постамат-постамат
 *
 * Отбираем по тому, КУДА приезжает заказ. Режимы с отправкой из постамата
 * (8–10) не берём: мы отправляем из мастерской, а не закладываем в постамат.
 */
export const pickupModes = new Set([2, 4, 6, 7])   // в ПВЗ или постамат
export const doorModes   = new Set([1, 3])         // курьером до двери

/** Подходит ли тариф под выбранное покупателем направление. */
export function matchesDestination(mode: number | null, destination?: DeliveryDestination): boolean {
  if (!destination) return true
  if (mode === null) return false
  return destination === 'pickup' ? pickupModes.has(mode) : doorModes.has(mode)
}

function toQuote(raw: unknown, destination?: DeliveryDestination): DeliveryQuote | null {
  if (typeof raw !== 'object' || raw === null) return null
  const t = raw as Record<string, unknown>
  const code  = num(t.tariff_code)
  const price = num(t.delivery_sum)
  if (code === null || price === null) return null
  if (!matchesDestination(num(t.delivery_mode), destination)) return null
  return {
    code,
    name:     typeof t.tariff_name === 'string' ? t.tariff_name : `Тариф ${code}`,
    priceRub: Math.ceil(price),
    daysMin:  num(t.period_min),
    daysMax:  num(t.period_max),
  }
}

function toPoint(raw: unknown): PickupPoint | null {
  if (typeof raw !== 'object' || raw === null) return null
  const p = raw as Record<string, unknown>
  const loc = (p.location ?? {}) as Record<string, unknown>
  const address = typeof loc.address_full === 'string' ? loc.address_full
                : typeof loc.address === 'string'      ? loc.address
                : null
  if (typeof p.code !== 'string' || !address) return null
  return {
    code:     p.code,
    name:     typeof p.name === 'string' ? p.name : p.code,
    address,
    workTime: typeof p.work_time === 'string' ? p.work_time : null,
  }
}

/* ── Провайдер ──────────────────────────────────────────────────────────── */

export const cdek: DeliveryProvider = {
  id: 'cdek',

  isConfigured() {
    return Boolean(account() && secret())
  },

  async quotes(city: string, parcel: Parcel, destination?: DeliveryDestination): Promise<DeliveryQuote[]> {
    const [from, to] = await Promise.all([cityCode(fromCity()), cityCode(city)])
    if (from === null) throw new Error(`СДЭК: не найден город отправления «${fromCity()}»`)
    if (to === null)   throw new Error('Город не найден в справочнике СДЭК')

    const data = await api('/calculator/tarifflist', {
      method: 'POST',
      body: JSON.stringify({
        // 1 — интернет-магазин: тарифы для продажи товаров.
        type: 1,
        from_location: { code: from },
        to_location:   { code: to },
        packages: [{
          weight: parcel.weightGrams,
          length: parcel.lengthCm,
          width:  parcel.widthCm,
          height: parcel.heightCm,
        }],
      }),
    })

    const list = (data as { tariff_codes?: unknown[] })?.tariff_codes ?? []
    return list
      .map(t => toQuote(t, destination))
      .filter((q): q is DeliveryQuote => q !== null)
      .sort((a, b) => a.priceRub - b.priceRub)
  },

  async points(city: string): Promise<PickupPoint[]> {
    const code = await cityCode(city)
    if (code === null) throw new Error('Город не найден в справочнике СДЭК')

    const data = await api(`/deliverypoints?type=PVZ&country_code=RU&city_code=${code}`)
    const list = Array.isArray(data) ? data : []
    return list
      .map(toPoint)
      .filter((p): p is PickupPoint => p !== null)
  },
}

/** Сброс кэшей — для тестов и на случай смены ключей без рестарта. */
export function resetCdekCaches() {
  token = null
  cityCache.clear()
}
