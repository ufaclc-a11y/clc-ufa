import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { renderToStaticMarkup } from 'react-dom/server'
import { contentFactoryCaseFromExport } from '../scripts/lib/content-factory-export.mjs'
import { caseSections } from '../lib/case-presentation'
import { ProductFocusedCase } from '../components/ProductFocusedCase'
import type { Case } from '../data/cases'

function imported(fields: object): Case {
  const payload = { schemaVersion: 'content-factory.website-case.v1', approval: { packId: 'synthetic', packVersion: 1, approvalHash: 'fixture-only' }, project: { id: 'fixture' }, websiteCase: { slug: 'synthetic', title: 'Учебное изделие', problem: 'Форма по рисунку', solution: 'Изменили основание', result: 'Светлая статуэтка на подставке', ...fields } }
  return contentFactoryCaseFromExport({ ...payload, payloadHash: createHash('sha256').update(JSON.stringify(payload)).digest('hex') }, ['/fixture.jpg']) as Case
}

test('explicit B survives real export mapper and renders source-backed idea / revision / result', () => {
  const item = imported({ storyLevel: 'B', sourceMaterials: 'Рисунок заказчика' })
  assert.equal(item.storyLevel, 'B')
  assert.deepEqual(caseSections(item), [
    { heading: 'Исходная идея', text: 'Форма по рисунку Рисунок заказчика' },
    { heading: 'Доработка', text: 'Изменили основание' },
    { heading: 'Результат', text: 'Светлая статуэтка на подставке' },
  ])
  const html = renderToStaticMarkup(ProductFocusedCase({ item }))
  assert.match(html, /Исходная идея/)
  assert.match(html, /Рисунок заказчика/)
  assert.doesNotMatch(html, />Как сделали</)
})


test('explicit C exposes independent production but omits blank and repeated sections', () => {
  const rich = imported({ storyLevel: 'C', production: 'Вырезали и собрали элементы' })
  assert.deepEqual(caseSections(rich).map(s => s.heading), ['Задача', 'Сложности и решения', 'Изготовление', 'Результат'])
  assert.match(renderToStaticMarkup(ProductFocusedCase({ item: rich })), /Вырезали и собрали элементы/)
  assert.deepEqual(caseSections({ ...rich, production: '  Изменили   основание  ', result: ' ' }).map(s => s.heading), ['Задача', 'Сложности и решения'])
  assert.deepEqual(caseSections({ ...rich, task: '', solution: '', production: '' }), [{ heading: 'Результат', text: rich.result }])
})

test('explicit A and B deduplicate normalized source blocks without filling a quota', () => {
  const a = imported({ storyLevel: 'A', solution: '', preparation: 'Макет', approvedDetails: ' Макет ', production: 'Сборка' })
  assert.deepEqual(caseSections(a).map(s => s.heading), ['Задача', 'Как сделали', 'Результат'])
  assert.equal(caseSections(a)[1].text, 'Макет Сборка')
  const caseB = imported({ storyLevel: 'B', problem: '  Рисунок   заказчика ', sourceMaterials: 'Рисунок заказчика', solution: '', preparation: 'Макет', approvedDetails: 'Макет', result: 'Макет' })
  assert.deepEqual(caseSections(caseB), [{ heading: 'Исходная идея', text: 'Рисунок   заказчика' }, { heading: 'Доработка', text: 'Макет' }])
})

test('unknown/missing story level stays absent', () => {
  for (const value of [undefined, '', 'c', 'D', 3, {}]) {
    const item = imported({ storyLevel: value })
    assert.equal(item.storyLevel, undefined)
    assert.deepEqual(caseSections(item).map(s => s.heading), ['Задача', 'Как сделали', 'Результат'])
  }
})
