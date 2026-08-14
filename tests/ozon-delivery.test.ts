import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { shopItems } from '../data/shop'
import { buildParcel } from '../lib/delivery/packaging'
import {
  matchesOzonDestination,
  ozon,
  ozonTokenExpiresAt,
  parseOzonQuotes,
  resetOzonStateForTests,
  toOzonPoint,
} from '../lib/delivery/ozon'

const originalFetch = globalThis.fetch

type OzonEnv = {
  OZON_CLIENT_ID?: string
  OZON_CLIENT_SECRET?: string
  OZON_SELLER_ID?: string
  OZON_TOKEN_FILE?: string
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function geocoderResponse(): Response {
  return json([{ boundingbox: ['54.5', '55.0', '55.5', '56.5'] }])
}

function pointListResponse(): Response {
  return json({
    points: [{ map_point_id: 1288733, coordinate: { lat: 54.787503, long: 56.135445 } }],
  })
}

function pointInfoValue() {
  return {
    enabled: true,
    delivery_method: {
      address: 'Россия, Башкортостан, Уфа, Сельская Богородская улица, 35/2',
      address_details: { city: 'Уфа' },
      delivery_type: { id: 1002, name: 'Самовывоз' },
      map_point_id: 1288733,
      name: 'Пункт Ozon',
      working_hours: [{
        date: '2026-08-14T00:00:00Z',
        periods: [{ min: { hours: 9, minutes: 0 }, max: { hours: 21, minutes: 0 } }],
      }],
    },
  }
}

function pointInfoResponse(): Response {
  return json({ points: [pointInfoValue()] })
}

async function withOzonEnvironment(
  token: Record<string, unknown>,
  run: (context: { tokenPath: string; directory: string }) => Promise<void>,
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'clc-ozon-test-'))
  const tokenPath = join(directory, 'tokens.json')
  await writeFile(tokenPath, JSON.stringify(token), 'utf8')

  const saved: OzonEnv = {
    OZON_CLIENT_ID: process.env.OZON_CLIENT_ID,
    OZON_CLIENT_SECRET: process.env.OZON_CLIENT_SECRET,
    OZON_SELLER_ID: process.env.OZON_SELLER_ID,
    OZON_TOKEN_FILE: process.env.OZON_TOKEN_FILE,
  }
  process.env.OZON_CLIENT_ID = 'client-id'
  process.env.OZON_CLIENT_SECRET = 'client-secret'
  process.env.OZON_SELLER_ID = '104023818'
  process.env.OZON_TOKEN_FILE = tokenPath
  resetOzonStateForTests()

  try {
    await run({ tokenPath, directory })
  } finally {
    globalThis.fetch = originalFetch
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    resetOzonStateForTests()
    await rm(directory, { recursive: true, force: true })
  }
}

test('expires_in Ozon преобразуется как абсолютная Unix-метка', () => {
  assert.equal(ozonTokenExpiresAt(1_786_703_183), 1_786_703_183_000)
  assert.equal(ozonTokenExpiresAt('1786703183'), 1_786_703_183_000)
  assert.equal(ozonTokenExpiresAt('bad'), 0)
})

test('Ozon строго разделяет ПВЗ и курьерскую доставку', () => {
  for (const type of ['PVZ', 'PICKUP', 'PICK_UP', 'POSTAMAT']) {
    assert.equal(matchesOzonDestination(type, 'pickup'), true)
    assert.equal(matchesOzonDestination(type, 'door'), false)
  }
  for (const type of ['COURIER', 'DOOR', 'COURIER_DELIVERY']) {
    assert.equal(matchesOzonDestination(type, 'pickup'), false)
    assert.equal(matchesOzonDestination(type, 'door'), true)
  }
  assert.equal(matchesOzonDestination('UNSPECIFIED', 'pickup'), false)
})

test('разбор тарифов отбрасывает курьера при выборе ПВЗ', () => {
  const response = {
    splits: [
      {
        delivery_method: {
          id: 1288733,
          name: 'Пункт Ozon',
          delivery_type: 'PVZ',
          timeslots: [{
            client_date_range: { from: '2026-08-16T00:00:00Z', to: '2026-08-17T00:00:00Z' },
          }],
        },
        unavailable_reason: 'UNSPECIFIED',
        commissions: { total: { amount: '110', currency: 'RUB' } },
      },
      {
        delivery_method: { id: 99, name: 'Курьер Ozon', delivery_type: 'COURIER' },
        unavailable_reason: 'UNSPECIFIED',
        commissions: { total: { amount: '50', currency: 'RUB' } },
      },
    ],
  }

  assert.deepEqual(parseOzonQuotes(response, 'pickup', Date.parse('2026-08-14T00:00:00Z')), [{
    code: 1288733,
    name: 'Пункт Ozon',
    priceRub: 110,
    daysMin: 2,
    daysMax: 3,
  }])
})

test('точка Ozon устойчиво разбирается из point/info', () => {
  assert.deepEqual(toOzonPoint(pointInfoValue()), {
    code: '1288733',
    mapPointId: 1288733,
    name: 'Пункт Ozon',
    address: 'Россия, Башкортостан, Уфа, Сельская Богородская улица, 35/2',
    workTime: '09:00–21:00',
  })
})

test('просроченный токен обновляется один раз, а refresh-token сохраняется атомарно', async () => {
  await withOzonEnvironment({
    access_token: 'expired-access',
    refresh_token: 'irreplaceable-refresh',
    expires_in: Math.floor(Date.now() / 1000) - 10,
  }, async ({ tokenPath, directory }) => {
    const refreshExpiry = Math.floor(Date.now() / 1000) + 3600
    const calls: string[] = []
    globalThis.fetch = (async (input) => {
      const url = String(input)
      calls.push(url)
      if (url.startsWith('https://nominatim.openstreetmap.org/search')) return geocoderResponse()
      if (url === 'https://xapi.ozon.ru/oauth/token') {
        // Intentionally omit refresh_token: the old one must survive.
        return json({ access_token: 'fresh-access', expires_in: refreshExpiry, token_type: 'Bearer' })
      }
      if (url.endsWith('/v1/delivery/point/list')) return pointListResponse()
      if (url.endsWith('/v1/delivery/point/info')) return pointInfoResponse()
      throw new Error(`unexpected URL ${url}`)
    }) as typeof fetch

    assert.equal(ozon.isConfigured(), true)
    const points = await Promise.all([ozon.points('Уфа'), ozon.points('Уфа')])
    assert.equal(points[0].length, 1)
    assert.deepEqual(points[0], points[1])
    assert.equal(calls.filter(url => url === 'https://xapi.ozon.ru/oauth/token').length, 1)

    const saved = JSON.parse(await readFile(tokenPath, 'utf8')) as Record<string, unknown>
    assert.equal(saved.access_token, 'fresh-access')
    assert.equal(saved.refresh_token, 'irreplaceable-refresh')
    assert.equal(saved.expires_in, refreshExpiry)
    assert.deepEqual(await readdir(directory), ['tokens.json'])
  })
})

test('quotes отправляет реальный offer_id магазина и возвращает только тариф ПВЗ', async () => {
  await withOzonEnvironment({
    access_token: 'valid-access',
    refresh_token: 'refresh',
    expires_in: Math.floor(Date.now() / 1000) + 3600,
  }, async () => {
    const captured: { checkoutBody?: Record<string, unknown> } = {}
    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      if (url.startsWith('https://nominatim.openstreetmap.org/search')) return geocoderResponse()
      if (url.endsWith('/v1/delivery/point/list')) return pointListResponse()
      if (url.endsWith('/v1/delivery/point/info')) return pointInfoResponse()
      if (url.endsWith('/v2/delivery/checkout')) {
        captured.checkoutBody = JSON.parse(String(init?.body)) as Record<string, unknown>
        return json({
          splits: [
            {
              delivery_method: { id: 1288733, name: 'Пункт Ozon', delivery_type: 'PVZ' },
              unavailable_reason: 'UNSPECIFIED',
              commissions: { total: { amount: '110', currency: 'RUB' } },
            },
            {
              delivery_method: { id: 77, name: 'Курьер', delivery_type: 'COURIER' },
              unavailable_reason: 'UNSPECIFIED',
              commissions: { total: { amount: '1', currency: 'RUB' } },
            },
          ],
        })
      }
      throw new Error(`unexpected URL ${url}`)
    }) as typeof fetch

    const item = shopItems.find(entry => entry.inStock && entry.packaging)
    assert.ok(item)
    const parcel = buildParcel([{ id: item.id, qty: 1 }])
    assert.equal(parcel.ok, true)
    if (!parcel.ok) return

    const quotes = await ozon.quotes('Уфа', parcel.parcel, 'pickup')
    assert.deepEqual(quotes.map(quote => quote.name), ['Пункт Ozon'])
    assert.equal(quotes[0].priceRub, 110)

    const items = captured.checkoutBody?.items as Array<{ offer_id?: string; quantity?: number }>
    assert.equal(items.length, 1)
    assert.ok(shopItems.some(entry => entry.sku === items[0].offer_id))
    assert.equal(items[0].quantity, 1)
    assert.deepEqual(captured.checkoutBody?.delivery_type, { pick_up: { map_point_id: 1288733 } })
  })
})
