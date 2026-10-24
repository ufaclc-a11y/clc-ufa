import assert from 'node:assert/strict'
import test from 'node:test'
import generated from '../content/content-factory-cases.json'
import { relatedCaseLinks } from '../lib/case-related'
import { getPublicCase, publicCases } from '../lib/public-cases'

test('approved infinity copy does not add automatic related examples to its existing layout', () => {
  const item = getPublicCase('company-gift-infinity')!
  const policy = generated.find(record => record.id === item.id) as unknown as Record<string, unknown>
  assert.equal(policy.autoRelatedCases, false)
  assert.deepEqual(relatedCaseLinks(item, publicCases), [])
})

test('turning off automatic examples is scoped and preserves catalog matching', () => {
  const example = getPublicCase('company-gift-infinity')!
  const item = { ...example, autoRelatedCases: false }
  assert.deepEqual(relatedCaseLinks(item, publicCases), [])
  const ordinary = { ...example, id: 'comparison-fixture', autoRelatedCases: undefined }
  assert.ok(relatedCaseLinks(ordinary, publicCases).some(link => link.href === '/cases/company-gift-infinity'))
  const metalTag = getPublicCase('murmiau-engraved-tag')!
  assert.deepEqual(relatedCaseLinks(metalTag, publicCases).map(link => link.href), ['/services/gravirovka-na-metalle', '/products/zhetony'])
})
