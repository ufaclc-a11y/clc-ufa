import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { renderToStaticMarkup } from 'react-dom/server'
import CasePage, { generateMetadata } from '../app/cases/[slug]/page'
import { getPublicCase, publicCases } from '../lib/public-cases'
import { caseSections } from '../lib/case-presentation'
import { caseContactLinks, productCaseMessage } from '../lib/case-contact'
import { relatedCaseLinks } from '../lib/case-related'
import type { Case } from '../data/cases'

const slug = 'murmiau-engraved-tag'
const title = 'Кулон «мурмяу» с гравировкой по фотографии'
const result = 'Получился двусторонний кулон: на одной стороне глаза с фотографии, на другой надпись „мурмяу“ с двумя лапками. Индивидуальное изделие изготовили по согласованному макету.'
const bytes = readFileSync(new URL('./fixtures/murmiau-before-copy-20261026.json', import.meta.url))
assert.equal(createHash('sha256').update(bytes).digest('hex'), 'b9c94c7faf8e581b0b4362ac0c4f295e49effe513d496845b895a51e54150d54')
const previous = JSON.parse(bytes.toString()) as Case[]
const before = previous.find(item => item.id === slug)!

test('approved warm direction is adapted through the real loader and page, not pasted as a caption', async () => {
  const item = getPublicCase(slug)!
  assert.equal(item.title, title)
  assert.equal(item.result, result)
  assert.deepEqual(caseSections(item).map(section => section.heading), ['Задача', 'Как сделали', 'Результат'])
  assert.match(item.task, /металлический кулон/)
  assert.equal(item.solution, before.solution, 'keep source-backed third font and two paws story verbatim')
  assert.doesNotMatch([item.title, item.summary, item.task, item.solution, item.result, item.cta, item.seoDescription, item.imageAlt, ...item.images!.map(image => image.alt)].join(' '), /жетон|#гравировка|🖤|🐾/i)
  const html = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug }) }))
  assert.ok(html.includes(`<h1`) && html.includes(title))
  assert.ok(html.includes(result))
  assert.equal((html.match(/data-case-calculation-trigger=/g) || []).length, 2)
  assert.equal((html.match(/<dialog/g) || []).length, 1)
  const metadata = await generateMetadata({ params: Promise.resolve({ slug }) })
  assert.equal(metadata.title, title)
  assert.equal(metadata.alternates?.canonical, `https://clc-ufa.ru/cases/${slug}`)
  assert.equal(metadata.description, item.seoDescription)
  const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(match => JSON.parse(match[1]))
  const work = ld.find(node => node['@type'] === 'CreativeWork')
  assert.equal(work.name, title)
  assert.equal(work.description, item.seoDescription)
  assert.equal(work.url, `https://clc-ufa.ru/cases/${slug}`)
})

test('existing calculation panel now carries a contextual photo-evaluation request', async () => {
  const item = getPublicCase(slug)!
  const message = productCaseMessage(item)
  assert.match(message, /подойдёт ли моё фото для гравировки/)
  assert.ok(message.includes(title))
  assert.ok(message.includes(`https://clc-ufa.ru/cases/${slug}`))
  assert.doesNotMatch(message, /жетон/i)
  for (const link of caseContactLinks(item, message).slice(0, 2)) assert.equal(new URL(link.href).searchParams.get('text'), message)
  const html = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug }) }))
  assert.ok(html.includes(message), 'the contextual CTA is actually rendered in the copyable contact message')
  assert.equal(productCaseMessage({ id: 'legacy', title: 'Legacy' }), 'Здравствуйте! Хочу рассчитать похожее изделие. Кейс: «Legacy»: https://clc-ufa.ru/cases/legacy')
})

test('only authorized copy/provenance changes; media, layout, commercial unknowns and other cases survive', () => {
  const records = JSON.parse(readFileSync('content/content-factory-cases.json', 'utf8')) as Case[]
  assert.deepEqual(records.map(item => item.id), previous.map(item => item.id))
  assert.deepEqual(records.filter(item => item.id !== slug), previous.filter(item => item.id !== slug))
  const item = getPublicCase(slug)!
  const permitted = ['title', 'cta', 'seoDescription', 'imageAlt', 'images', 'task', 'result', 'contentFactory']
  const retained = (record: object) => Object.fromEntries(Object.entries(record).filter(([key]) => !permitted.includes(key)))
  assert.deepEqual(retained(records.find(item => item.id === slug)!), retained(before))
  const withoutAlt = (image: object) => Object.fromEntries(Object.entries(image).filter(([key]) => key !== 'alt'))
  assert.deepEqual(item.images!.map(withoutAlt), before.images!.map(withoutAlt))
  const hashes = ['3955ca7d58ecd4153c5141137333e9d1460723575f214797ae4a27a265dd040d', 'e8882331f13faee87aa0c1c1441f4ad1c1d071f719fefac9f315936f693ef3bd']
  item.images!.forEach((image, i) => assert.equal(createHash('sha256').update(readFileSync(`public${image.src}`)).digest('hex'), hashes[i]))
  const oldCases = publicCases.map(record => record.id === slug ? before : record)
  for (const record of publicCases) {
    const old = oldCases.find(previous => previous.id === record.id)!
    assert.deepEqual(relatedCaseLinks(record, publicCases), relatedCaseLinks(old, oldCases), `derived related links: ${record.id}`)
  }
  for (const field of ['price', 'qty', 'deadline'] as const) assert.equal(item[field], '')
})
