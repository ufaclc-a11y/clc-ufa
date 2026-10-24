import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { contentFactoryCaseFromExport } from '../scripts/lib/content-factory-export.mjs'
import { caseSections } from '../lib/case-presentation'
import { ProductFocusedCase } from '../components/ProductFocusedCase'
import { renderToStaticMarkup } from 'react-dom/server'
import { caseContactLinks } from '../lib/case-contact'
import { relatedCaseLinks } from '../lib/case-related'
import type { Case } from '../data/cases'
function exported(website: object) { const p = { schemaVersion: 'content-factory.website-case.v1', approval: { packId: 'fixture', packVersion: 1, approvalHash: 'test-only' }, project: { id: 'fixture' }, websiteCase: { slug: 'fixture', title: 'Изделие', ...website } }; return { ...p, payloadHash: createHash('sha256').update(JSON.stringify(p)).digest('hex') } }
test('real common importer opts future approved exports into adaptive product-first rendering', () => {
 for (const technologies of [['engraving'], ['laser-cutting'], ['milling'], ['uv-printing'], ['laser-cutting','uv-printing'], []]) {
  const item = contentFactoryCaseFromExport(exported({ problem: 'Задача', preparation: 'Подготовили макет', approvedDetails: 'Согласовали рисунок', production: 'Изготовили изделие', result: 'Готово', classification: { technologies, material: 'metal', type: 'tag' } }), ['/x.jpg']) as Case
  assert.equal(item.presentation, 'product-first')
  assert.deepEqual(caseSections(item).map(s => s.heading), ['Задача','Как сделали','Результат'])
  const html=renderToStaticMarkup(ProductFocusedCase({ item }))
  assert.equal((html.match(/<dialog/g)||[]).length,1)
  assert.match(html,/data-cta-position="final"/)
  assert.equal((html.match(/data-primary-cta/g)||[]).length,1)
  if(technologies.length) assert.ok(relatedCaseLinks(item,[]).length >= technologies.length)
 }
 const sparse=contentFactoryCaseFromExport(exported({ summary: 'Готово', result: 'Готово' }), ['/x.jpg']) as Case
 assert.deepEqual(caseSections(sparse),[])
 const unknown=contentFactoryCaseFromExport(exported({ classification: { technologies: ['unknown'], material: 'unobtainium', type: 'alien' } }), ['/x.jpg']) as Case
 assert.equal(unknown.classification,undefined)
})
test('mixed known/unknown technology export cannot become a false exact related-case match', () => {
 const mixed=contentFactoryCaseFromExport(exported({ classification: { technologies: ['engraving','unknown-future-tech'], material:'metal', type:'tag' } }), ['/x.jpg']) as Case
 const onlyKnown=contentFactoryCaseFromExport(exported({ classification: { technologies:['engraving'], material:'metal', type:'tag' } }), ['/x.jpg']) as Case
 const related=relatedCaseLinks(mixed,[{...onlyKnown,id:'engraving-only'}])
 assert.equal(related.some(link=>link.href==='/cases/engraving-only'),false)
 assert.equal(mixed.classification,undefined)
})
test('product CTA prefill is exact and preserves legacy default', () => {
 const message='Здравствуйте! Хочу рассчитать изделие, похожее на жетон „мурмяу“: https://clc-ufa.ru/cases/murmiau-engraved-tag'
 const links=caseContactLinks({ id:'murmiau-engraved-tag', title:'Жетон' }, message)
 for (const link of links.slice(0,2)) assert.equal(new URL(link.href).searchParams.get('text'),message)
 assert.match(new URL(caseContactLinks({id:'legacy',title:'Legacy'})[0].href).searchParams.get('text')!,/похожую задачу/)
})
