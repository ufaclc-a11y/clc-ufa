import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import CasePage, { generateMetadata } from '../app/cases/[slug]/page'
import { cases, type Case } from '../data/cases'
import CasesPage from '../app/cases/page'
import { getPublicCase } from '../lib/public-cases'
import { CaseContactActions } from '../components/CaseContactActions'
import { relatedCaseLinks } from '../lib/case-related'
import { caseSections, caseFacts, caseDescription, visibleCaseLabel } from '../lib/case-presentation'

test('detail renders structured story, summary, early and final case contacts and complete SEO', async () => {
  const item = getPublicCase('murmiau-engraved-tag')!
  const html = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug: item.id }) }))
  assert.ok(html.includes(item.summary!))
  for (const text of ['Задача', 'Исходные материалы', 'Подготовка', 'Что согласовали', 'Изготовление', 'Результат']) assert.ok(html.includes(text))
  assert.ok(html.indexOf('Задача') < html.indexOf('Исходные материалы'))
  assert.ok(html.includes('data-cta-position="hero"'))
  assert.ok(html.includes('data-cta-position="final"'))
  assert.ok(html.includes(item.cta!))
  assert.ok(!html.includes('Не указано'))
  assert.ok(!html.includes('Клиент Центра лазерной резки'))
  assert.ok(html.includes('/services/gravirovka-na-metalle'))
  assert.ok(html.includes('/products/zhetony'))
  assert.ok(html.includes('CreativeWork'))
  assert.ok(html.includes('BreadcrumbList'))
  assert.ok(!html.includes('Offer'))
  const metadata = await generateMetadata({ params: Promise.resolve({ slug: item.id }) })
  assert.equal(metadata.description, item.seoDescription)
  assert.equal(metadata.openGraph?.url, `https://clc-ufa.ru/cases/${item.id}`)
  const index = renderToStaticMarkup(CasesPage())
  assert.ok(!index.includes('Не указано'))
  assert.ok(!index.includes('По запросу'))
  assert.ok(!index.includes('только факты'))
})

test('shared CTA works for a future case without local duplicate analytics handlers', () => {
  const html = renderToStaticMarkup(CaseContactActions({ item: { id: 'future-case', title: 'Рисунок' }, position: 'hero' }))
  assert.ok(html.includes('data-cta-position="hero"'))
  assert.ok(html.includes('future-case'))
  assert.ok(html.includes('WhatsApp'))
})

test('related links come from actual catalog and relevant examples, never self or unrelated cases', () => {
  const item = getPublicCase('murmiau-engraved-tag')!
  const links = relatedCaseLinks(item, [item, { ...cases[0], id: 'other-tag', title: 'Жетон с фотографией', task: 'Гравировка на металлическом жетоне' }, cases[4]])
  assert.ok(links.some(link => link.href === '/services/gravirovka-na-metalle'))
  assert.ok(links.some(link => link.href === '/products/zhetony'))
  assert.ok(!links.some(link => link.href === '/products/gravirovka-na-chasah' || link.href === '/services/gravirovka-na-nemetalah'))
  assert.ok(links.some(link => link.href === '/cases/other-tag'))
  assert.ok(!links.some(link => link.href === `/cases/${item.id}` || link.href === `/cases/${cases[4].id}`))
  assert.equal(new Set(links.map(link => link.href)).size, links.length)
})

const fixture: Case = {
  ...cases[0], id: 'new-photo-project', title: 'Изделие по рисунку',
  task: 'Перенести рисунок на изделие.', solution: 'Общий повтор подготовки.', result: 'Готовое изделие.',
  sourceMaterials: 'Рисунок заказчика.', preparation: 'Подготовили линии.', approvedDetails: 'Согласовали надпись.', production: 'Нанесли рисунок.',
  price: 'По расчёту', qty: 'Не указано', deadline: 'По запросу',
}

test('future structured case shows task first, only documented stages, result last without duplicate solution', () => {
  assert.deepEqual(caseSections(fixture).map(s => s.heading), ['Задача', 'Исходные материалы', 'Подготовка', 'Что согласовали', 'Изготовление', 'Результат'])
  assert.equal(caseSections(fixture).some(s => s.text === fixture.solution), false)
  assert.deepEqual(caseFacts(fixture), [])
  assert.deepEqual(caseSections(cases[0]).map(s => s.heading), ['Задача', 'Решение', 'Результат'])
  for (const value of ['Не указано', 'По запросу', 'По задаче', 'По расчёту', '  Не указано. ']) assert.equal(visibleCaseLabel(value), undefined)
  assert.equal(visibleCaseLabel('Спортивный клуб «Дракон»'), 'Спортивный клуб «Дракон»')
})

test('SEO uses explicit description then summary and trims at word boundaries', () => {
  assert.equal(caseDescription({ ...fixture, seoDescription: 'Описание для поиска.', summary: 'Кратко.' }), 'Описание для поиска.')
  assert.equal(caseDescription({ ...fixture, summary: 'Кратко.' }), 'Кратко.')
  const text = 'слово '.repeat(70).trim()
  const description = caseDescription({ ...fixture, task: text })
  assert.ok(description.length <= 155)
  assert.match(description, /слово…$/)
})
