import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { chmod, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { shopItems } from '@/data/shop'
import type {
  DeliveryDestination,
  DeliveryProvider,
  DeliveryQuote,
  Parcel,
  PickupPoint,
} from './types'

const API_BASE = 'https://api-seller.ozon.ru'
const TOKEN_URL = 'https://xapi.ozon.ru/oauth/token'
const GEOCODER_URL = 'https://nominatim.openstreetmap.org/search'
const DEFAULT_TOKEN_FILE = '/var/lib/clc-ufa/ozon-tokens.json'
const TIMEOUT_MS = 15_000
const TOKEN_EARLY_REFRESH_MS = 60_000
const DAY_MS = 86_400_000
const POINT_CACHE_MS = 30 * 60_000
const GEOCODE_CACHE_MS = 24 * 60 * 60_000
const POINT_INFO_BATCH = 100
const MAX_INTERNAL_POINTS = 250

type JsonObject = Record<string, unknown>

type TokenState = JsonObject & {
  access_token?: string
  refresh_token?: string
  expires_in?: string | number
}

type Bounds = {
  south: number
  north: number
  west: number
  east: number
}

type PointSeed = {
  mapPointId: string
  lat: number
  lon: number
}

type OzonPoint = PickupPoint & {
  mapPointId: number
}

type CacheEntry<T> = {
  expiresAt: number
  value: Promise<T>
}

const clientId = () => process.env.OZON_CLIENT_ID?.trim() ?? ''
const clientSecret = () => process.env.OZON_CLIENT_SECRET?.trim() ?? ''
const sellerId = () => process.env.OZON_SELLER_ID?.trim() ?? ''
const tokenFile = () => process.env.OZON_TOKEN_FILE?.trim() || DEFAULT_TOKEN_FILE

let cachedToken: TokenState | null = null
let cachedTokenPath = ''
let refreshInFlight: Promise<string> | null = null
let pointListCache: CacheEntry<PointSeed[]> | null = null
const boundsCache = new Map<string, CacheEntry<Bounds>>()
const cityPointsCache = new Map<string, CacheEntry<OzonPoint[]>>()

function object(value: unknown): JsonObject | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonObject
    : null
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function string(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function number(value: unknown): number | null {
  const result = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(result) ? result : null
}

function normalizeCity(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('ru-RU')
    .replace(/\u0451/g, '\u0435')
    .replace(/^\s*(?:\u0433\.?|\u0433\u043e\u0440\u043e\u0434)\s+/u, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function readTokenSync(path: string): TokenState | null {
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'))
    return object(parsed) as TokenState | null
  } catch {
    return null
  }
}

async function readTokenState(): Promise<TokenState> {
  const path = tokenFile()
  if (cachedToken && cachedTokenPath === path) return cachedToken

  const parsed = JSON.parse(await readFile(path, 'utf8'))
  const state = object(parsed) as TokenState | null
  if (!state || !string(state.refresh_token)) {
    throw new Error('\u0424\u0430\u0439\u043b \u0442\u043e\u043a\u0435\u043d\u043e\u0432 Ozon \u043d\u0435 \u0441\u043e\u0434\u0435\u0440\u0436\u0438\u0442 refresh-token')
  }

  cachedToken = state
  cachedTokenPath = path
  return state
}

/** Ozon returns an absolute Unix timestamp here, not a duration. */
export function ozonTokenExpiresAt(expiresIn: unknown): number {
  const seconds = number(expiresIn)
  return seconds !== null && seconds > 0 ? Math.trunc(seconds * 1000) : 0
}

function tokenIsFresh(state: TokenState, now = Date.now()): boolean {
  return Boolean(
    string(state.access_token) &&
    ozonTokenExpiresAt(state.expires_in) - TOKEN_EARLY_REFRESH_MS > now,
  )
}

async function writeTokenAtomic(path: string, state: TokenState): Promise<void> {
  const temporary = join(dirname(path), `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`)
  try {
    await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', mode: 0o600, flag: 'wx' })
    await chmod(temporary, 0o600)
    await rename(temporary, path)
  } finally {
    await unlink(temporary).catch(() => undefined)
  }
}

async function refreshAccessToken(state: TokenState): Promise<string> {
  const refreshToken = string(state.refresh_token)
  if (!refreshToken) throw new Error('Refresh-token Ozon \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId(),
        client_secret: clientSecret(),
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      cache: 'no-store',
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  const raw = await response.text()
  let payload: JsonObject | null = null
  try {
    payload = object(JSON.parse(raw))
  } catch {
    // The status and a safe generic message below are enough; never log token responses.
  }

  if (!response.ok || !payload) {
    const message = string(payload?.message) || `HTTP ${response.status}`
    throw new Error(`Ozon \u043d\u0435 \u043e\u0431\u043d\u043e\u0432\u0438\u043b \u0442\u043e\u043a\u0435\u043d: ${message}`)
  }

  const accessToken = string(payload.access_token)
  if (!accessToken || !ozonTokenExpiresAt(payload.expires_in)) {
    throw new Error('Ozon \u0432\u0435\u0440\u043d\u0443\u043b \u043d\u0435\u043f\u043e\u043b\u043d\u044b\u0439 \u043e\u0442\u0432\u0435\u0442 \u043f\u0440\u0438 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0438 \u0442\u043e\u043a\u0435\u043d\u0430')
  }

  const next: TokenState = {
    ...state,
    ...payload,
    // Some OAuth servers omit the refresh token when it is not rotated.
    refresh_token: string(payload.refresh_token) || refreshToken,
  }
  await writeTokenAtomic(tokenFile(), next)
  cachedToken = next
  cachedTokenPath = tokenFile()
  return accessToken
}

async function accessToken(): Promise<string> {
  const state = await readTokenState()
  if (tokenIsFresh(state)) return string(state.access_token)

  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken(state).finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

function errorMessage(payload: unknown, status: number): string {
  const data = object(payload)
  return string(data?.message) || string(data?.error) || `HTTP ${status}`
}

async function ozonApi(path: string, body: JsonObject, retryUnauthorized = true): Promise<unknown> {
  const token = await accessToken()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Seller-Id': sellerId(),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  if (response.status === 401 && retryUnauthorized) {
    if (cachedToken) cachedToken.expires_in = 0
    return ozonApi(path, body, false)
  }

  const raw = await response.text()
  let payload: unknown = null
  try {
    payload = raw ? JSON.parse(raw) : null
  } catch {
    // Handled by the status check below.
  }

  if (!response.ok) {
    throw new Error(`Ozon API: ${errorMessage(payload, response.status)}`)
  }
  return payload
}

async function geocode(city: string): Promise<Bounds> {
  const key = normalizeCity(city)
  const cached = boundsCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const value = (async () => {
    const url = new URL(GEOCODER_URL)
    url.searchParams.set('city', city.trim())
    url.searchParams.set('countrycodes', 'ru')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '1')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    let response: Response
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': 'clc-ufa-delivery/1.0 (https://clc-ufa.ru)' },
        cache: 'no-store',
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }

    if (!response.ok) throw new Error(`\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043d\u0430\u0439\u0442\u0438 \u0433\u043e\u0440\u043e\u0434 \u00ab${city.trim()}\u00bb`)
    const first = object(array(await response.json())[0])
    const bbox = array(first?.boundingbox).map(number)
    if (bbox.length !== 4 || bbox.some(value => value === null)) {
      throw new Error(`\u0413\u043e\u0440\u043e\u0434 \u00ab${city.trim()}\u00bb \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d`)
    }
    return { south: bbox[0]!, north: bbox[1]!, west: bbox[2]!, east: bbox[3]! }
  })()

  boundsCache.set(key, { expiresAt: Date.now() + GEOCODE_CACHE_MS, value })
  value.catch(() => boundsCache.delete(key))
  return value
}

async function allPointSeeds(): Promise<PointSeed[]> {
  if (pointListCache && pointListCache.expiresAt > Date.now()) return pointListCache.value

  const value = (async () => {
    const payload = object(await ozonApi('/v1/delivery/point/list', {}))
    return array(payload?.points).flatMap((entry): PointSeed[] => {
      const point = object(entry)
      const coordinate = object(point?.coordinate)
      const mapPointId = string(point?.map_point_id) || String(number(point?.map_point_id) ?? '')
      const lat = number(coordinate?.lat)
      const lon = number(coordinate?.long)
      return mapPointId && lat !== null && lon !== null ? [{ mapPointId, lat, lon }] : []
    })
  })()

  pointListCache = { expiresAt: Date.now() + POINT_CACHE_MS, value }
  value.catch(() => { pointListCache = null })
  return value
}

function timePart(value: unknown): string | null {
  const time = object(value)
  const hours = number(time?.hours)
  const minutes = number(time?.minutes)
  if (hours === null || minutes === null) return null
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function workTime(value: unknown): string | null {
  for (const day of array(value)) {
    for (const period of array(object(day)?.periods)) {
      const range = object(period)
      const from = timePart(range?.min)
      const to = timePart(range?.max)
      if (from && to) return `${from}\u2013${to}`
    }
  }
  return null
}

export function toOzonPoint(value: unknown): OzonPoint | null {
  const point = object(value)
  if (!point || point.enabled === false) return null
  const method = object(point.delivery_method)
  const mapPointId = number(method?.map_point_id)
  const address = string(method?.address)
  if (mapPointId === null || !address) return null

  return {
    code: String(Math.trunc(mapPointId)),
    mapPointId: Math.trunc(mapPointId),
    name: string(method?.name) || '\u041f\u0443\u043d\u043a\u0442 Ozon',
    address,
    workTime: workTime(method?.working_hours),
  }
}

function methodCity(value: unknown): string {
  const method = object(object(value)?.delivery_method)
  return string(object(method?.address_details)?.city)
}

function methodAddress(value: unknown): string {
  return string(object(object(value)?.delivery_method)?.address)
}

function pointBelongsToCity(value: unknown, city: string): boolean {
  const expected = normalizeCity(city)
  const actual = normalizeCity(methodCity(value))
  if (actual) return actual === expected
  return normalizeCity(methodAddress(value)).includes(expected)
}

async function cityPoints(city: string): Promise<OzonPoint[]> {
  const key = normalizeCity(city)
  const cached = cityPointsCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const value = (async () => {
    const [bounds, seeds] = await Promise.all([geocode(city), allPointSeeds()])
    const ids = seeds
      .filter(point =>
        point.lat >= bounds.south && point.lat <= bounds.north &&
        point.lon >= bounds.west && point.lon <= bounds.east)
      .map(point => point.mapPointId)

    const result: OzonPoint[] = []
    for (let index = 0; index < ids.length && result.length < MAX_INTERNAL_POINTS; index += POINT_INFO_BATCH) {
      const payload = object(await ozonApi('/v1/delivery/point/info', {
        map_point_ids: ids.slice(index, index + POINT_INFO_BATCH),
      }))
      for (const entry of array(payload?.points)) {
        if (!pointBelongsToCity(entry, city)) continue
        const point = toOzonPoint(entry)
        if (point) result.push(point)
      }
    }

    return result
      .sort((left, right) => left.address.localeCompare(right.address, 'ru'))
      .slice(0, MAX_INTERNAL_POINTS)
  })()

  cityPointsCache.set(key, { expiresAt: Date.now() + POINT_CACHE_MS, value })
  value.catch(() => cityPointsCache.delete(key))
  return value
}

function dimensions(item: (typeof shopItems)[number]) {
  const packaging = item.packaging
  if (
    !packaging ||
    typeof packaging.weightGrams !== 'number' ||
    typeof packaging.packLengthCm !== 'number' ||
    typeof packaging.packWidthCm !== 'number' ||
    typeof packaging.packHeightCm !== 'number'
  ) return null
  return {
    weight: packaging.weightGrams,
    length: packaging.packLengthCm,
    width: packaging.packWidthCm,
    height: packaging.packHeightCm,
  }
}

function sameParcel(parcel: Parcel, lines: Array<{ item: (typeof shopItems)[number]; quantity: number }>): boolean {
  let weight = 0
  let length = 0
  let width = 0
  let height = 0
  for (const line of lines) {
    const size = dimensions(line.item)
    if (!size) return false
    weight += size.weight * line.quantity
    length = Math.max(length, size.length)
    width = Math.max(width, size.width)
    height += size.height * line.quantity
  }
  return (
    Math.round(weight) === parcel.weightGrams &&
    Math.ceil(length) === parcel.lengthCm &&
    Math.ceil(width) === parcel.widthCm &&
    Math.ceil(height) === parcel.heightCm
  )
}

function checkoutItems(parcel: Parcel): Array<{ offer_id: string; quantity: number }> {
  const candidates = shopItems.filter(item => item.inStock && dimensions(item))

  // The shared provider interface deliberately exposes only the assembled parcel.
  // Reconstruct the common one-product/repeated-product carts exactly; never use an
  // unrelated Ozon SKU as an approximate calculator because that can underquote.
  for (const item of candidates) {
    const size = dimensions(item)!
    const maxQuantity = Math.min(1000, Math.max(1, Math.ceil(parcel.weightGrams / size.weight) + 1))
    for (let quantity = 1; quantity <= maxQuantity; quantity += 1) {
      if (sameParcel(parcel, [{ item, quantity }])) return [{ offer_id: item.sku, quantity }]
    }
  }

  // Two distinct products cover the usual mixed cart without changing the existing
  // route contract. Larger ambiguous carts fall back to the manager instead of
  // showing a price calculated for the wrong goods.
  for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
    const left = candidates[leftIndex]
    const leftSize = dimensions(left)!
    const maxLeft = Math.min(100, Math.max(1, Math.ceil(parcel.weightGrams / leftSize.weight)))
    for (let leftQuantity = 1; leftQuantity <= maxLeft; leftQuantity += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
        const right = candidates[rightIndex]
        const rightSize = dimensions(right)!
        const estimate = Math.max(1, Math.round((parcel.weightGrams - leftSize.weight * leftQuantity) / rightSize.weight))
        for (const rightQuantity of [estimate - 1, estimate, estimate + 1]) {
          if (rightQuantity < 1 || rightQuantity > 1000) continue
          const lines = [{ item: left, quantity: leftQuantity }, { item: right, quantity: rightQuantity }]
          if (sameParcel(parcel, lines)) {
            return lines.map(line => ({ offer_id: line.item.sku, quantity: line.quantity }))
          }
        }
      }
    }
  }

  throw new Error('\u0414\u043b\u044f \u044d\u0442\u043e\u0439 \u043a\u043e\u0440\u0437\u0438\u043d\u044b Ozon \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0442\u043e\u0447\u043d\u043e \u0441\u043e\u043f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0442\u043e\u0432\u0430\u0440\u044b \u2014 \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c \u0441\u043e\u043e\u0431\u0449\u0438\u0442 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440')
}

export function matchesOzonDestination(value: unknown, destination?: DeliveryDestination): boolean {
  if (!destination) return true
  const type = string(value).toUpperCase().replace(/[^A-Z0-9]+/g, '_')
  const pickup = type === 'PVZ' || type === 'PICKUP' || type === 'PICK_UP' || type === 'POSTAMAT'
  const door = type === 'COURIER' || type === 'DOOR' || type === 'COURIER_DELIVERY'
  return destination === 'pickup' ? pickup : door
}

function deliveryDays(value: unknown, now: number): { min: number | null; max: number | null } {
  const method = object(value)
  for (const slot of array(method?.timeslots)) {
    const timeslot = object(slot)
    const range = object(timeslot?.client_date_range) || object(timeslot?.logistic_date_range)
    const from = Date.parse(string(range?.from))
    const to = Date.parse(string(range?.to))
    if (!Number.isFinite(from) || !Number.isFinite(to)) continue
    return {
      min: Math.max(0, Math.ceil((from - now) / DAY_MS)),
      max: Math.max(0, Math.ceil((to - now) / DAY_MS)),
    }
  }
  return { min: null, max: null }
}

export function parseOzonQuotes(
  value: unknown,
  destination?: DeliveryDestination,
  now = Date.now(),
): DeliveryQuote[] {
  const payload = object(value)
  const grouped = new Map<string, DeliveryQuote>()

  for (const entry of array(payload?.splits)) {
    const split = object(entry)
    if (!split || string(split.unavailable_reason) !== 'UNSPECIFIED') continue
    const method = object(split.delivery_method)
    if (!method || !matchesOzonDestination(method.delivery_type, destination)) continue
    const total = object(object(split.commissions)?.total)
    const price = number(total?.amount)
    const code = number(method.id)
    if (price === null || price < 0 || code === null) continue

    const key = `${string(method.delivery_type)}:${code}`
    const days = deliveryDays(method, now)
    const previous = grouped.get(key)
    if (previous) {
      previous.priceRub += price
      if (days.min !== null) previous.daysMin = previous.daysMin === null ? days.min : Math.min(previous.daysMin, days.min)
      if (days.max !== null) previous.daysMax = previous.daysMax === null ? days.max : Math.max(previous.daysMax, days.max)
    } else {
      grouped.set(key, {
        code: Math.trunc(code),
        name: string(method.name) || '\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430 Ozon',
        priceRub: price,
        daysMin: days.min,
        daysMax: days.max,
      })
    }
  }

  return [...grouped.values()].sort((left, right) => left.priceRub - right.priceRub)
}

function credentialsReady(): boolean {
  return Boolean(clientId() && clientSecret() && sellerId())
}

export const ozon: DeliveryProvider = {
  id: 'ozon',

  isConfigured(): boolean {
    if (!credentialsReady()) return false
    const path = tokenFile()
    if (!existsSync(path)) return false
    return Boolean(string(readTokenSync(path)?.refresh_token))
  },

  hasCredentials(): boolean {
    return credentialsReady()
  },

  async quotes(city, parcel, destination): Promise<DeliveryQuote[]> {
    if (!this.isConfigured()) throw new Error('\u0418\u043d\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u044f \u0441 Ozon \u0414\u043e\u0441\u0442\u0430\u0432\u043a\u043e\u0439 \u043d\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0430')
    const points = await cityPoints(city)
    if (!points.length) throw new Error(`\u0412 \u0433\u043e\u0440\u043e\u0434\u0435 \u00ab${city.trim()}\u00bb \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b \u043f\u0443\u043d\u043a\u0442\u044b Ozon`)

    const selectedDestination = destination || 'pickup'
    if (selectedDestination !== 'pickup') {
      throw new Error('\u041a\u0443\u0440\u044c\u0435\u0440\u0441\u043a\u0430\u044f Ozon \u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430 \u043d\u0435 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0430')
    }

    const items = checkoutItems(parcel)
    const candidates = [...points]
      .sort((left, right) => Number(/\u043f\u043e\u0441\u0442\u0430\u043c\u0430\u0442/i.test(left.name)) - Number(/\u043f\u043e\u0441\u0442\u0430\u043c\u0430\u0442/i.test(right.name)))
      .slice(0, 8)

    // A specific point can be temporarily unavailable for an otherwise valid
    // basket. Try a small bounded set of ordinary PVZs before giving up.
    for (const point of candidates) {
      const payload = await ozonApi('/v2/delivery/checkout', {
        delivery_schema: 'MIX',
        delivery_type: { pick_up: { map_point_id: point.mapPointId } },
        items,
      })
      const quotes = parseOzonQuotes(payload, selectedDestination)
      if (quotes.length) return quotes
    }
    return []
  },

  async points(city): Promise<PickupPoint[]> {
    if (!this.isConfigured()) throw new Error('\u0418\u043d\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u044f \u0441 Ozon \u0414\u043e\u0441\u0442\u0430\u0432\u043a\u043e\u0439 \u043d\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0430')
    return cityPoints(city)
  },
}

export function resetOzonStateForTests(): void {
  cachedToken = null
  cachedTokenPath = ''
  refreshInFlight = null
  pointListCache = null
  boundsCache.clear()
  cityPointsCache.clear()
}
