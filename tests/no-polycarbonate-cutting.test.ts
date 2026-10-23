import assert from 'node:assert/strict'
import test from 'node:test'
import { cuttingGroups, cuttingRates, getCuttingPriceTables, getLandingCuttingPrices } from '../data/cutting-prices'
import { faqItems } from '../data/faq'
import { seoPages } from '../data/seo-pages'
import { services } from '../data/services'

const polycarbonate = /поликарбон|polikarbonat|polycarbon/i

test('cutting services, landing pages, FAQ and prices do not offer polycarbonate cutting', () => {
  const cuttingServices = services.filter(service => service.slug.includes('rezka'))
  const cuttingPages = seoPages.filter(page => page.service.includes('rezka'))
  assert.ok(cuttingServices.length > 0)
  assert.ok(cuttingPages.length > 0)
  for (const value of [cuttingServices, cuttingPages, faqItems, cuttingGroups, cuttingRates]) {
    assert.doesNotMatch(JSON.stringify(value), polycarbonate)
  }
  for (const method of ['laser', 'cnc'] as const) {
    assert.doesNotMatch(JSON.stringify(getCuttingPriceTables(method)), polycarbonate)
    assert.ok(getCuttingPriceTables(method).length > 0)
  }
  assert.deepEqual(getLandingCuttingPrices('frezernaya-rezka-pvh-ufa')?.groups, ['pvh', 'polistirol'])
})

test('unrelated polycarbonate engraving descriptions remain available', () => {
  const engraving = seoPages.find(page => page.slug === 'gravirovka-na-plastike-ufa')
  assert.ok(engraving)
  assert.match(engraving.bodyText, polycarbonate)
})
