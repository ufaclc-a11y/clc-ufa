import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import CasePage from '../app/cases/[slug]/page'
import { getPublicCase } from '../lib/public-cases'
import { caseSections } from '../lib/case-presentation'

const expected = 'Получился двусторонний кулон: на одной стороне глаза с фотографии, на другой надпись „мурмяу“ с двумя лапками. Индивидуальное изделие изготовили по согласованному макету.'

test('murmiau result retains the finished-product description with authorized kulon terminology', async () => {
  const item = getPublicCase('murmiau-engraved-tag')!
  assert.ok(item)
  assert.equal(item.result, expected)
  const sections = caseSections(item)
  assert.deepEqual(sections.map(section => section.heading), ['Задача', 'Как сделали', 'Результат'])
  assert.equal(sections.at(-1)?.text, expected)
  const html = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug: item.id }) }))
  assert.ok(html.includes(expected), 'the real page renders the complete approved text')
  assert.doesNotMatch(html, /Готовность заказа подтверждена в переписке с клиенткой/)
})
