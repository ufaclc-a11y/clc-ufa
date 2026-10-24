import assert from 'node:assert/strict'
import test from 'node:test'
import { getPublicCase } from '../lib/public-cases'
import { relatedCaseLinks } from '../lib/case-related'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProductCaseGallery } from '../components/ProductCaseGallery'

test('related examples require confirmed material and type, and the same complete technology set', () => {
  const item = getPublicCase('murmiau-engraved-tag')!
  const partial = { ...item, classification: { technologies: ['engraving'] } }
  assert.equal(relatedCaseLinks(partial, [{ ...partial, id: 'unknown-pair' }]).some(link => link.href.startsWith('/cases/')), false)
  const multi = { ...item, id: 'other-process', classification: { ...item.classification, technologies: ['engraving', 'uv-printing'] } }
  assert.equal(relatedCaseLinks(item, [multi]).some(link => link.href.startsWith('/cases/')), false)
  const exact = { ...item, id: 'known-match' }
  assert.ok(relatedCaseLinks(item, [exact]).some(link => link.href === '/cases/known-match'))
})

test('general gallery starts with confirmed result and never invents front/back roles for process photographs', () => {
  const html = renderToStaticMarkup(createElement(ProductCaseGallery, { images: [
    { src: '/reference.png', alt: 'Предоставленный рисунок', stage: 'before' },
    { src: '/finished.png', alt: 'Готовая конструкция', stage: 'result', width: 600, height: 900 },
    { src: '/process.png', alt: 'Реальная сборка', stage: 'process' },
  ] }))
  assert.match(html, /alt="Готовая конструкция"/)
  assert.doesNotMatch(html, /Лицевая сторона|Оборот/)
  assert.match(html, /Исходный материал/)
  assert.match(html, /В процессе/)
})
