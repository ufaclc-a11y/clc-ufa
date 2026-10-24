import assert from 'node:assert/strict'
import test from 'node:test'
import generated from '../content/content-factory-cases.json'
import { relatedCaseLinks } from '../lib/case-related'
import { getPublicCase, publicCases } from '../lib/public-cases'

test('approved infinity adaptive story shows curated services, not automatic examples', () => {
  const item = getPublicCase('company-gift-infinity')!
  const policy = generated.find(record => record.id === item.id) as unknown as Record<string, unknown>
  assert.equal(policy.autoRelatedCases, false)
  assert.deepEqual(relatedCaseLinks(item, publicCases).map(link => link.href), ['/services/izgotovlenie-izdelij', '/services/uf-pechat', '/lazernaya-rezka-akrila-ufa', '/suveniry-na-zakaz-ufa'])
})

test('turning off automatic examples is scoped and preserves catalog matching', () => {
  const example = getPublicCase('nagrady-korporativ')!
  const item = { ...example, autoRelatedCases: false }
  assert.ok(relatedCaseLinks(item, publicCases).every(link => !link.href.startsWith('/cases/')))
  const ordinary = { ...example, id: 'comparison-fixture', autoRelatedCases: undefined }
  assert.ok(relatedCaseLinks(ordinary, publicCases).some(link => link.href === '/cases/nagrady-korporativ'))
  const metalTag = getPublicCase('murmiau-engraved-tag')!
  assert.deepEqual(relatedCaseLinks(metalTag, publicCases).map(link => link.href), ['/services/gravirovka-na-metalle', '/products/zhetony'])
})
