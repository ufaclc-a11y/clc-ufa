import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProductFocusedCase } from '../components/ProductFocusedCase'
import { getPublicCase } from '../lib/public-cases'

test('product-first retains accepted video/poster with useful caption and compact linked attribution', () => {
  const gs = getPublicCase('company-gift-infinity')!
  const html = renderToStaticMarkup(ProductFocusedCase({ item: { ...gs, presentation: 'product-first' } }))
  assert.match(html, /<video[^>]*controls=""[^>]*playsInline=""[^>]*preload="metadata"/)
  assert.ok(html.includes(`poster="${gs.video!.poster}"`))
  assert.ok(html.includes(`src="${gs.video!.src}"`))
  assert.ok(html.includes('Dream Culture — Kevin MacLeod.'))
  assert.ok(html.includes(gs.video!.description!))
  assert.match(html, /Музыка и лицензия/)
  assert.ok(!html.includes(gs.video!.contactText))
  assert.doesNotMatch(html, /autoPlay|autoplay|loop=""/)
  assert.equal((html.match(/data-case-calculation-trigger=/g) ?? []).length, 2)
  assert.match(html, /Контекст для копирования/)
  assert.equal(gs.presentation, 'product-first')
})

test('accepted murmiau without video does not acquire an empty media section', () => {
  const html = renderToStaticMarkup(ProductFocusedCase({ item: getPublicCase('murmiau-engraved-tag')! }))
  assert.doesNotMatch(html, /<video|Видео проекта/)
})
