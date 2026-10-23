import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import CasePage, { generateMetadata, generateStaticParams } from '../app/cases/[slug]/page'
import { cases } from '../data/cases'
import generated from '../content/content-factory-cases.json'
import { getPublicCase, publicCases } from '../lib/public-cases'
import type { ContentFactoryCase } from '../lib/content-factory-cases'

const slug = 'murmiau-engraved-tag'
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')

test('accepted murmiau photo case preserves exact approved text, both image hashes and previous cases', async () => {
  const item = getPublicCase(slug)
  assert.ok(item, 'accepted murmiau case must exist')
  // Compile-time check of actual JSON, not the loader’s unchecked type assertion.
  const typedRecords: ContentFactoryCase[] = generated.map(record => ({ ...record, contentFactory: { ...record.contentFactory, schemaVersion: 'content-factory.website-case.v1' as const } }))
  assert.equal(typedRecords.filter(record => record.id === slug).length, 1)
  assert.equal(sha([item.task, item.solution, item.result].join('\n\n') + '\n'), 'f60e86dd827a0a09583a22d4882fe6f949ddc1d5ff6e6a96c53aee2d8d637c61')
  assert.equal(item.images?.length, 2)
  const hashes = ['354b1e206a2b8a80b72fc092be3d57124f213c96743eb587f3811c7a12b0bccc', '359840c544e882f119aa87357de3b9c3de245ef4858c0c58060f108412fce541']
  item.images!.forEach((image, index) => assert.equal(sha(readFileSync(`public${image.src}`)), hashes[index]))
  assert.equal(item.image, item.images![0].src)
  for (const key of ['price', 'qty', 'deadline'] as const) assert.equal(item[key], 'Не указано')
  assert.equal(item.video, undefined)
  assert.deepEqual(item.tags, [])
  assert.deepEqual(publicCases.slice(0, cases.length), cases)
  assert.equal(publicCases[cases.length].id, 'company-gift-infinity')
  assert.equal(publicCases.at(-1)?.id, slug)
  assert.equal(new Set(publicCases.map(record => record.id)).size, publicCases.length)
  const html = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug }) }))
  for (const paragraph of [item.task, item.solution, item.result]) assert.ok(html.includes(paragraph))
  assert.doesNotMatch(html, /<video/)
  assert.ok(generateStaticParams().some(record => record.slug === slug))
  const metadata = await generateMetadata({ params: Promise.resolve({ slug }) })
  assert.equal(metadata.alternates?.canonical, `https://clc-ufa.ru/cases/${slug}`)
})
