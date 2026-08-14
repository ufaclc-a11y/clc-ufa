import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import {
  resetRussianPostCachesForTests,
  russianPost,
  toRussianPostPoint,
  toRussianPostQuote,
} from '../lib/delivery/russian-post'

const originalFetch = globalThis.fetch
const savedEnv = {
  POCHTA_ACCESS_TOKEN: process.env.POCHTA_ACCESS_TOKEN,
  POCHTA_USER_AUTH: process.env.POCHTA_USER_AUTH,
  POCHTA_FROM_INDEX: process.env.POCHTA_FROM_INDEX,
}

afterEach(() => {
  globalThis.fetch = originalFetch
  resetRussianPostCachesForTests()
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

test('тариф Почты переводит копейки в рубли и сохраняет сроки', () => {
  assert.deepEqual(toRussianPostQuote({
    'total-rate': 12_345,
    'delivery-time': { 'min-days': 3, 'max-days': 5 },
  }), {
    code: 1,
    name: 'Посылка онлайн, до отделения',
    priceRub: 124,
    daysMin: 3,
    daysMax: 5,
  })
  assert.equal(toRussianPostQuote({ 'total-rate': '12345' }), null)
})

test('карточка ОПС преобразуется в пункт выдачи, закрытые отделения отсекаются', () => {
  const raw = {
    'postal-code': '450000',
    'address-source': 'Республика Башкортостан, г Уфа, ул Ленина, 28',
    'type-code': 'ГОПС',
    'working-hours': [{
      'weekday-name': 'Пн',
      'begin-worktime': '09:00',
      'end-worktime': '20:00',
    }],
  }
  assert.deepEqual(toRussianPostPoint(raw), {
    code: '450000',
    name: 'Отделение Почты России 450000',
    address: raw['address-source'],
    workTime: 'Пн: 09:00–20:00',
  })
  assert.equal(toRussianPostPoint({ ...raw, 'is-temporary-closed': true }), null)
})

test('без обоих ключей Почта остаётся ненастроенной', async () => {
  delete process.env.POCHTA_ACCESS_TOKEN
  delete process.env.POCHTA_USER_AUTH
  assert.equal(russianPost.isConfigured(), false)
  await assert.rejects(
    () => russianPost.quotes('Уфа', { weightGrams: 500, lengthCm: 10, widthCm: 8, heightCm: 4 }),
    /не настроена/,
  )
})

test('запросы используют официальные заголовки, тариф и список отделений', async () => {
  process.env.POCHTA_ACCESS_TOKEN = 'application-token'
  process.env.POCHTA_USER_AUTH = 'Basic dXNlcjpwYXNz'
  process.env.POCHTA_FROM_INDEX = '450001'

  const calls: Array<{ url: string; init?: RequestInit }> = []
  globalThis.fetch = async (input, init) => {
    const url = String(input)
    calls.push({ url, init })
    if (url.includes('settlement.offices.codes')) {
      return Response.json(['456803', '450000', '450002'])
    }
    if (url.endsWith('/1.0/tariff')) {
      return Response.json({
        'total-rate': 18_450,
        'delivery-time': { 'min-days': 2, 'max-days': 4 },
      })
    }
    const code = url.match(/\/(\d{6})\?/)?.[1]
    return Response.json({
      'postal-code': code,
      settlement: code === '456803' ? 'Пригородный' : 'Уфа',
      'address-source': `г Уфа, отделение ${code}`,
      'type-code': 'ГОПС',
    })
  }

  const parcel = { weightGrams: 750, lengthCm: 20, widthCm: 12, heightCm: 6 }
  const quotes = await russianPost.quotes('Уфа', parcel, 'pickup')
  const points = await russianPost.points('Уфа')

  assert.equal(quotes[0]?.priceRub, 185)
  assert.deepEqual(points.map(point => point.code), ['450000', '450002'])

  const tariffCall = calls.find(call => call.url.endsWith('/1.0/tariff'))
  assert.ok(tariffCall)
  const headers = tariffCall.init?.headers as Record<string, string>
  assert.equal(headers.Authorization, 'AccessToken application-token')
  assert.equal(headers['X-User-Authorization'], 'Basic dXNlcjpwYXNz')
  assert.deepEqual(JSON.parse(String(tariffCall.init?.body)), {
    'index-to': '450000',
    'delivery-point-index': '450000',
    'mail-category': 'ORDINARY',
    'mail-type': 'ONLINE_PARCEL',
    mass: 750,
    dimension: { length: 20, width: 12, height: 6 },
    'payment-method': 'CASHLESS',
    'index-from': '450001',
  })
})

test('для доставки до двери почтовый тариф до отделения не возвращается', async () => {
  process.env.POCHTA_ACCESS_TOKEN = 'application-token'
  process.env.POCHTA_USER_AUTH = 'dXNlcjpwYXNz'
  const quotes = await russianPost.quotes(
    'Уфа',
    { weightGrams: 500, lengthCm: 10, widthCm: 8, heightCm: 4 },
    'door',
  )
  assert.deepEqual(quotes, [])
})
