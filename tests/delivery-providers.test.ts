import { test } from 'node:test'
import assert from 'node:assert/strict'
import { providers, getProvider, isProviderId } from '../lib/delivery/providers'

test('в реестре есть обе службы, идентификатор совпадает с ключом', () => {
  for (const [key, provider] of Object.entries(providers)) {
    assert.equal(provider.id, key, `ключ «${key}» не совпадает с id провайдера`)
  }
  assert.ok(providers.cdek)
  assert.ok(providers.ozon)
})

test('неизвестная служба не подменяется службой по умолчанию', () => {
  // Иначе для «Почты России» показались бы тарифы СДЭК под видом верных.
  for (const bad of ['russian', 'pickup', '', null, undefined, 'CDEK', 'constructor']) {
    assert.equal(getProvider(bad), null, `«${String(bad)}» не должен возвращать провайдера`)
  }
})

test('известные службы находятся', () => {
  assert.equal(getProvider('cdek')?.id, 'cdek')
  assert.equal(getProvider('ozon')?.id, 'ozon')
  assert.equal(isProviderId('cdek'), true)
  assert.equal(isProviderId('russian'), false)
})

test('Ozon без refresh-токена остаётся ненастроенным', async () => {
  const saved = {
    OZON_CLIENT_ID: process.env.OZON_CLIENT_ID,
    OZON_CLIENT_SECRET: process.env.OZON_CLIENT_SECRET,
    OZON_SELLER_ID: process.env.OZON_SELLER_ID,
    OZON_TOKEN_FILE: process.env.OZON_TOKEN_FILE,
  }
  process.env.OZON_CLIENT_ID = 'test-client'
  process.env.OZON_CLIENT_SECRET = 'test-secret'
  process.env.OZON_SELLER_ID = 'test-seller'
  process.env.OZON_TOKEN_FILE = `${process.cwd()}/definitely-missing-ozon-tokens.json`
  try {
    assert.equal(providers.ozon.isConfigured(), false)
    await assert.rejects(
      () => providers.ozon.quotes('Москва', { weightGrams: 1000, lengthCm: 10, widthCm: 10, heightCm: 10 }),
      /не настроена/,
    )
    await assert.rejects(() => providers.ozon.points('Москва'), /не настроена/)
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})

test('СДЭК без ключей считается ненастроенным', () => {
  const saved = { a: process.env.CDEK_ACCOUNT, s: process.env.CDEK_SECRET }
  delete process.env.CDEK_ACCOUNT
  delete process.env.CDEK_SECRET
  try {
    assert.equal(providers.cdek.isConfigured(), false)
  } finally {
    if (saved.a !== undefined) process.env.CDEK_ACCOUNT = saved.a
    if (saved.s !== undefined) process.env.CDEK_SECRET = saved.s
  }
})
