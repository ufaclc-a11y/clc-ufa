import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import CasePage from '../app/cases/[slug]/page'
import { getPublicCase, publicCases } from '../lib/public-cases'
import { caseSections } from '../lib/case-presentation'
import { relatedCaseLinks } from '../lib/case-related'
import { ProductFocusedCase } from '../components/ProductFocusedCase'
import generated from '../content/content-factory-cases.json'

const item = getPublicCase('murmiau-engraved-tag')!
test('opt-in product case has exactly three narrative sections and one working primary trigger', async () => {
  assert.deepEqual(caseSections(item).map(s => s.heading), ['Задача', 'Как сделали', 'Результат'])
  const html = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug: item.id }) }))
  assert.equal((html.match(/data-primary-cta/g) ?? []).length, 1)
  assert.equal((html.match(/data-case-calculation-trigger=/g) ?? []).length, 2)
  assert.equal((html.match(/<dialog/g) ?? []).length, 1)
  assert.match(html, /aria-haspopup="dialog"/)
  assert.match(html, /murmiau-front-product/)
  assert.doesNotMatch(html, /pt-24/)
  assert.match(html, /data-cta-position="final"/)
  assert.equal(generated.find(record => record.id === item.id)!.contentFactory.packVersion, 6)
  assert.equal(publicCases.filter(c => c.presentation === 'product-first').length, 1)
  const legacy = getPublicCase('company-gift-infinity')!
  assert.equal(legacy.presentation, undefined)
  const old = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug: legacy.id }) }))
  assert.match(old, /pt-24/)
  assert.match(old, /data-cta-position="final"/)
})
test('strict related taxonomy fails closed for unclassified cases and excludes fuzzy organizers', () => {
  const links = relatedCaseLinks(item, publicCases)
  assert.deepEqual(links.map(l => l.href), ['/services/gravirovka-na-metalle', '/products/zhetony'])
  const unknown = { ...item, id: 'unknown', classification: undefined }
  assert.deepEqual(relatedCaseLinks(unknown, publicCases), [])
  const exact = { ...item, id: 'known-tag', title: 'Проверенный жетон' }
  assert.ok(relatedCaseLinks(item, [unknown, exact]).some(l => l.href === '/cases/known-tag'))
})

test('large product fixture uses the same component without opting the real case into publication', () => {
  const legacy = getPublicCase('company-gift-infinity')!
  const html = renderToStaticMarkup(ProductFocusedCase({ item: { ...legacy, presentation: 'product-first' } }))
  assert.match(html, /data-product-first-hero/)
  assert.match(html, /object-contain/)
  assert.match(html, /max-h-\[36vh\]/)
  assert.equal(legacy.presentation, undefined)
})
