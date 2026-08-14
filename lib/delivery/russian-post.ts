import type {
  DeliveryDestination, DeliveryProvider, DeliveryQuote, Parcel, PickupPoint,
} from './types'

/**
 * API онлайн-сервиса «Отправка» Почты России.
 *
 * Накладные здесь не создаём: интеграция нужна только для расчёта стоимости и
 * выбора отделения. Пока ключей нет, провайдер остаётся ненастроенным и магазин
 * продолжает оформлять заказ со стоимостью доставки от менеджера.
 */

const API_BASE = 'https://otpravka-api.pochta.ru'
const TIMEOUT_MS = 15_000
const CACHE_TTL_MS = 30 * 60 * 1000
const POINT_CONCURRENCY = 8
const MAX_POINT_DETAILS = 200

const accessToken = () => process.env.POCHTA_ACCESS_TOKEN?.trim() ?? ''
const userAuth = () => process.env.POCHTA_USER_AUTH?.trim().replace(/^Basic\s+/i, '') ?? ''
const fromIndex = () => process.env.POCHTA_FROM_INDEX?.trim() ?? ''

type CacheEntry<T> = { expiresAt: number; value: T }

const indexCache = new Map<string, CacheEntry<string[]>>()
const indexRequests = new Map<string, Promise<string[]>>()
const pointCache = new Map<string, CacheEntry<PickupPoint[]>>()

function configured(): boolean {
  return Boolean(accessToken() && userAuth())
}

async function api(path: string, init?: RequestInit): Promise<unknown> {
  if (!configured()) throw new Error('Почта России: интеграция не настроена')

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `AccessToken ${accessToken()}`,
      'X-User-Authorization': `Basic ${userAuth()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })

  if (!res.ok) {
    throw new Error(`Почта России: ${path.split('?')[0]} вернул ${res.status}`)
  }
  return res.json()
}

function cityParams(city: string): URLSearchParams {
  const parts = city.split(',').map(p => p.trim()).filter(Boolean)
  const params = new URLSearchParams({ settlement: parts[0] ?? '' })
  if (parts[1]) params.set('region', parts[1])
  return params
}

async function loadIndices(city: string): Promise<string[]> {
  const key = city.trim().toLocaleLowerCase('ru-RU')
  if (!key) return []

  const cached = indexCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const active = indexRequests.get(key)
  if (active) return active

  const request = (async () => {
    const data = await api(`/postoffice/1.0/settlement.offices.codes?${cityParams(city)}`)
    const indices = Array.isArray(data)
      ? [...new Set(data.filter((v): v is string => typeof v === 'string' && /^\d{6}$/.test(v)))]
      : []
    if (!indices.length) throw new Error(`Почта России: в городе «${city.trim()}» не найдены отделения`)
    indexCache.set(key, { value: indices, expiresAt: Date.now() + CACHE_TTL_MS })
    return indices
  })()

  indexRequests.set(key, request)
  try {
    return await request
  } finally {
    indexRequests.delete(key)
  }
}

const finiteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

export function toRussianPostQuote(raw: unknown): DeliveryQuote | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const totalKopecks = finiteNumber(data['total-rate'])
  if (totalKopecks === null || totalKopecks < 0) return null

  const deliveryTime = data['delivery-time'] && typeof data['delivery-time'] === 'object'
    ? data['delivery-time'] as Record<string, unknown>
    : {}

  return {
    // Создание отправлений не подключено; код нужен только как стабильный id в форме.
    code: 1,
    name: 'Посылка онлайн, до отделения',
    priceRub: Math.ceil(totalKopecks / 100),
    daysMin: finiteNumber(deliveryTime['min-days']),
    daysMax: finiteNumber(deliveryTime['max-days']),
  }
}

function scheduleText(raw: Record<string, unknown>): string | null {
  const schedule = Array.isArray(raw['working-hours']) ? raw['working-hours'] : []
  const lines = schedule.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const day = item as Record<string, unknown>
    const name = typeof day['weekday-name'] === 'string' ? day['weekday-name'] : ''
    const from = typeof day['begin-worktime'] === 'string' ? day['begin-worktime'] : ''
    const to = typeof day['end-worktime'] === 'string' ? day['end-worktime'] : ''
    return name && from && to ? [`${name}: ${from}–${to}`] : []
  })
  return lines.length ? lines.join(', ') : null
}

export function toRussianPostPoint(raw: unknown): PickupPoint | null {
  if (!raw || typeof raw !== 'object') return null
  const point = raw as Record<string, unknown>
  if (point['is-closed'] === true || point['is-temporary-closed'] === true || point['is-private-category'] === true) {
    return null
  }

  const code = typeof point['postal-code'] === 'string' ? point['postal-code'] : ''
  const address = typeof point['address-source'] === 'string' ? point['address-source'].trim() : ''
  if (!/^\d{6}$/.test(code) || !address) return null

  const typeCode = typeof point['type-code'] === 'string' ? point['type-code'].toUpperCase() : ''
  const kind = typeCode.includes('ПОЧТОМАТ') || typeCode.includes('POSTAMAT')
    ? 'Почтомат Почты России'
    : 'Отделение Почты России'

  return {
    code,
    name: `${kind} ${code}`,
    address,
    workTime: scheduleText(point),
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const result = new Array<R>(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++
      result[index] = await fn(items[index])
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return result
}

async function loadPoints(city: string): Promise<PickupPoint[]> {
  const key = city.trim().toLocaleLowerCase('ru-RU')
  const cached = pointCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const indices = (await loadIndices(city)).slice(0, MAX_POINT_DETAILS)
  const rawPoints = await mapLimit(indices, POINT_CONCURRENCY, async index => {
    try {
      return await api(`/postoffice/1.0/${encodeURIComponent(index)}?filter-by-office-type=true`)
    } catch {
      // Одно временно недоступное ОПС не должно скрывать все остальные отделения города.
      return null
    }
  })

  const points = rawPoints
    .map(toRussianPostPoint)
    .filter((point): point is PickupPoint => point !== null)
    .sort((a, b) => a.address.localeCompare(b.address, 'ru'))

  if (!points.length) throw new Error(`Почта России: не удалось получить отделения города «${city.trim()}»`)
  pointCache.set(key, { value: points, expiresAt: Date.now() + CACHE_TTL_MS })
  return points
}

async function tariff(city: string, parcel: Parcel): Promise<DeliveryQuote> {
  const [indexTo] = await loadIndices(city)
  const body: Record<string, unknown> = {
    'index-to': indexTo,
    'delivery-point-index': indexTo,
    'mail-category': 'ORDINARY',
    'mail-type': 'ONLINE_PARCEL',
    mass: parcel.weightGrams,
    dimension: {
      length: parcel.lengthCm,
      width: parcel.widthCm,
      height: parcel.heightCm,
    },
    'payment-method': 'CASHLESS',
  }
  if (/^\d{6}$/.test(fromIndex())) body['index-from'] = fromIndex()

  const data = await api('/1.0/tariff', { method: 'POST', body: JSON.stringify(body) })
  const quote = toRussianPostQuote(data)
  if (!quote) throw new Error('Почта России: в ответе расчёта нет тарифа')
  return quote
}

export const russianPost: DeliveryProvider = {
  id: 'russian',

  isConfigured: configured,
  hasCredentials: configured,

  async quotes(city: string, parcel: Parcel, destination?: DeliveryDestination): Promise<DeliveryQuote[]> {
    if (destination === 'door') return []
    return [await tariff(city, parcel)]
  },

  points: loadPoints,
}

export function resetRussianPostCachesForTests(): void {
  indexCache.clear()
  indexRequests.clear()
  pointCache.clear()
}
