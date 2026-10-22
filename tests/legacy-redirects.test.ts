import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { shopItems } from '../data/shop'
import { products } from '../data/products'

const require = createRequire(import.meta.url)
const config = require('../next.config.js')

export const expectedLegacyRedirects = [
  ['/store/tproduct/952054505002-gerb-adigeya-nastennaya-dekoratsiya', '/shop/gerb-adygeya-nastennaya-dekoratsiya'],
  ['/store/tproduct/gravirovka-na-metalle-kulon', '/products/kulony'],
  ['/store/tproduct/841167501082-dekorativnii-serf-chanel-bel-75h235h06-s', '/shop/dekorativnyj-serf-chanel-bel-75kh23-5kh0-6-sm'],
  ['/store/tproduct/108051230562-dekorativnii-serf-dlya-interera-chernii', '/shop/dekorativnyj-serf-dlya-interera-chernyj-75kh23-5kh0-6-sm-1-sht'],
  ['/store/tproduct/984703768372-panno-znaki-urbanart-disrup-50h50sm-mdf', '/shop/panno-znaki-urbanart-disrup-50kh50sm-mdf'],
  ['/store/tproduct/869103267242-gerb-rossii-na-stenu', '/shop/gerb-rossii-na-stenu'],
  ['/store/tproduct/324953532812-panno-znaki-urbanart-no-mercy-black-50h5', '/shop/panno-znaki-urbanart-no-mercy-black-50kh50sm-mdf'],
  ['/graverovka-na-metalle-medallyah', '/products/medali'],
  ['/graverovka-na-metalle-nozh', '/products/nozhi-gravir'],
  ['/graverovka-na-metalle-zhetony', '/products/zhetony'],
] as const

test('known legacy URLs redirect permanently to their specific existing replacements', async () => {
  const redirects = await config.redirects()
  for (const [source, destination] of expectedLegacyRedirects) {
    const rule = redirects.find((item: { source: string }) => item.source === source)
    assert.ok(rule, `missing redirect: ${source}`)
    assert.equal(rule.destination, destination)
    assert.equal(rule.permanent, true)
    assert.equal(rule.has, undefined)
    const slug = destination.split('/').at(-1)
    assert.ok(destination.startsWith('/shop/')
      ? shopItems.some(item => item.slug === slug)
      : products.some(item => item.id === slug), `missing destination: ${destination}`)
  }
})

test('mixed Cyrillic legacy path matches its actual percent-encoded request form', async () => {
  const redirects = await config.redirects()
  const literal = '/products/heshteги'
  for (const source of [literal, encodeURI(literal)]) {
    const rule = redirects.find((item: { source: string }) => item.source === source)
    assert.ok(rule, `missing exact redirect: ${source}`)
    assert.equal(rule.destination, '/products/kheshtegi')
    assert.equal(rule.permanent, true)
  }
})

test('unidentified legacy products and obsolete assets do not get blanket redirects', async () => {
  const redirects = await config.redirects()
  const guarded = [
    '/store/tproduct/663505522802-magicheskii-altar-zarya-alatir-krest-sva',
    '/store/tproduct/576861254302-altar-runicheskii-valknut-koltsa-borrome',
    '/store/tproduct/285249065472-altar-runicheskii-s-risunkom-valknut-kol',
    '/images/portfolio/p-f756521ce627.jfif', '/$', '/&',
    '/_next/static/media/6c25f6e897d845a3-s.p.woff2',
  ]
  const plain = redirects.filter((rule: { has?: unknown }) => !rule.has)
  for (const source of guarded) {
    assert.ok(!plain.some((rule: { source: string }) => rule.source === source), source)
  }
  assert.ok(!plain.some((rule: { source: string }) =>
    ['/store/:path*', '/store/tproduct/:path*', '/_next/:path*'].includes(rule.source)))
})
