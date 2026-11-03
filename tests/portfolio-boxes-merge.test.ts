import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { portfolioFiles } from '../data/portfolio.generated'
import { portfolioCategories, portfolioItems, samplePhotos, firstPhoto } from '../data/portfolio'
import { products } from '../data/products'
import { services } from '../data/services'

const require = createRequire(import.meta.url)
type Entry = { categories: string[]; order?: Record<string, number> }
const canonical = 'koroba-fanera'
const obsolete = 'shkatulki-fanera'
const label = 'Коробки, ящики и шкатулки'

// Historical asset/order/content preservation is a one-time migration review artifact,
// not a CI contract: normal uploads, deletions and unrelated content edits stay valid.
test('live manifest and generated galleries share deduplicated canonical memberships and current order', () => {
  const manifest: Record<string, Entry> = JSON.parse(readFileSync('data/portfolio-tags.json', 'utf8'))
  const expected: Record<string, string[]> = {}
  for (const [file, entry] of Object.entries(manifest)) {
    assert.ok(!entry.categories.includes(obsolete), file)
    assert.ok(!(obsolete in (entry.order ?? {})), file)
    assert.equal(new Set(entry.categories).size, entry.categories.length, file)
    for (const category of entry.categories) (expected[category] ??= []).push(file)
  }
  for (const [category, files] of Object.entries(expected)) {
    files.sort((a, b) => (manifest[a].order?.[category] ?? 1e9) -
      (manifest[b].order?.[category] ?? 1e9) || a.localeCompare(b))
    assert.equal(new Set(portfolioFiles[category]).size, files.length, category)
  }
  assert.deepEqual(portfolioFiles, expected, 'all current memberships and ordering must match the manifest')
  assert.ok(!(obsolete in portfolioFiles))
  assert.ok(!portfolioCategories.some(category => category.id === obsolete))
  assert.ok(!portfolioItems.some(item => item.category === obsolete))
  const files = portfolioFiles[canonical] ?? []
  const category = portfolioCategories.find(category => category.id === canonical)
  if (files.length) {
    assert.ok(category)
    assert.equal(category.label, label)
    assert.equal(category.count, files.length)
  } else {
    assert.equal(category, undefined, 'empty galleries are hidden after deletions')
  }
  assert.deepEqual(portfolioItems.filter(item => item.category === canonical).map(item => item.image),
    files.map(file => `/images/portfolio/${file}`))
})

test('existing product and manufacturing service use the canonical gallery, independently of copy and prices', () => {
  const product = products.find(product => product.id === 'shkatulki')
  assert.ok(product)
  assert.equal(product.portfolioPrefix, canonical)
  const service = services.find(service => service.id === 'izgotovlenie-izdelij')
  assert.ok(service)
  assert.ok(service.portfolioPrefixes?.some(entry => entry.prefix === canonical))
  assert.ok(products.every(product => product.portfolioPrefix !== obsolete))
  assert.ok(services.every(service => service.portfolioPrefix !== obsolete &&
    service.portfolioPrefixes?.every(entry => entry.prefix !== obsolete) !== false))
  const files = portfolioFiles[canonical] ?? []
  assert.equal(samplePhotos(product.portfolioPrefix, 8).length, Math.min(8, files.length))
  assert.equal(firstPhoto(canonical), files.length ? `/images/portfolio/${files[0]}` : undefined)
})

test('old portfolio route is an unconditional permanent 308 to the canonical SEO category', async () => {
  const redirects = await require('../next.config.js').redirects()
  const rule = redirects.find((r: { source: string }) => r.source === `/portfolio/${obsolete}`)
  assert.deepEqual(rule, { source: `/portfolio/${obsolete}`, destination: `/portfolio/${canonical}`, permanent: true })
  const { getRedirectStatus } = require('next/dist/lib/redirect-status')
  assert.equal(getRedirectStatus(rule), 308)
  const page = readFileSync('app/portfolio/[category]/page.tsx', 'utf8')
  assert.match(page, /'koroba-fanera':\s+\{ title: 'Коробки, ящики и шкатулки из фанеры — портфолио'/)
  assert.match(page, /description: 'Коробки, ящики, шкатулки, пеналы и упаковка из фанеры/)
  assert.ok(!page.includes("'shkatulki-fanera':"), 'no obsolete category SEO or hero entry')
  assert.match(page, /export const dynamicParams = false/)
  assert.match(page, /canonical: `https:\/\/clc-ufa.ru\/portfolio\/\$\{cat.id\}`/)
})

// CI already runs stdlib publisher tests with Python 3; include the mapping contract in npm test too.
test('importer accepts both completed owner tags without recreating the old category', () => {
  const run = spawnSync('python3', ['-B', '-W', 'error::ResourceWarning', '-m', 'unittest',
    'discover', '-s', 'tests', '-p', 'test_portfolio_category_merge.py', '-v'], { encoding: 'utf8' })
  assert.equal(run.status, 0, `${run.error ?? ''}\n${run.stdout}\n${run.stderr}`)
})
