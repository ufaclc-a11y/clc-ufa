import assert from 'node:assert/strict'
import test from 'node:test'
import { cases as existingCases } from '../data/cases'
import { contentFactoryCases, type ContentFactoryCase } from '../lib/content-factory-cases'

test('adding an approved case preserves existing cases, order and canonical IDs', async () => {
  const added = { ...existingCases[0], id: 'test-approved-addition' } as ContentFactoryCase
  const duplicate = { ...existingCases[0], title: 'Duplicate must not replace the existing case' } as ContentFactoryCase
  contentFactoryCases.push(added, duplicate)
  try {
    const { publicCases, getPublicCase } = await import('../lib/public-cases')
    assert.deepEqual(publicCases.slice(0, existingCases.length), existingCases)
    assert.equal(publicCases.at(-1)?.id, added.id)
    assert.equal(new Set(publicCases.map(item => item.id)).size, publicCases.length)
    assert.equal(getPublicCase(existingCases[0].id), existingCases[0])
  } finally {
    contentFactoryCases.splice(-2)
  }
})
