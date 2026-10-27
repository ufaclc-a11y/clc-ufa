import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProductFocusedCase } from '../components/ProductFocusedCase'
import { getPublicCase } from '../lib/public-cases'

test('nonadaptive product hero reserves narrow-screen clearance without changing cookie consent', () => {
  const item = getPublicCase('murmiau-engraved-tag')!
  const html = renderToStaticMarkup(createElement(ProductFocusedCase, { item }))
  assert.match(html, /max-\[359px\]:text-2xl/, 'narrow heading must leave room for the full photo and CTA above cookie notice')
  assert.match(html, /max-\[359px\]:hidden/, 'narrow summary must follow the product instead of preceding the CTA')
  assert.match(html, /max-\[359px\]:order-1/, 'primary CTA must precede gallery on narrow screens')
  assert.match(html, /max-\[359px\]:order-2/, 'full product remains in narrow first screen after CTA')
  assert.match(html, /min-\[360px\]:hidden/, 'separate narrow summary must not duplicate desktop content')
  assert.equal((html.match(/data-primary-cta=/g) || []).length, 1)
  assert.equal((html.match(/data-case-calculation-trigger=/g) || []).length, 2)
  assert.ok(html.includes(item.title))
  assert.ok(item.summary && html.includes(item.summary))
})
