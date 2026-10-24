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
import sharp from 'sharp'

const slug = 'murmiau-engraved-tag'
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')

test('website revision 5 has authorized concise story and exact crops; accepted originals and previous cases stay intact', async () => {
  const item = generated.find(record => record.id === slug)
  assert.ok(item, 'accepted murmiau case must exist')
  // Compile-time check of actual JSON, not the loader’s unchecked type assertion.
  const typedRecords: ContentFactoryCase[] = generated.map(record => ({ ...record, presentation: 'presentation' in record && record.presentation === 'product-first' ? 'product-first' as const : undefined, images: record.images.map(image => ({ ...image, stage: 'stage' in image && image.stage === 'result' ? 'result' as const : undefined })), contentFactory: { ...record.contentFactory, schemaVersion: 'content-factory.website-case.v1' as const } }))
  assert.equal(typedRecords.filter(record => record.id === slug).length, 1)
  const revised = generated.find(record => record.id === slug) as unknown as Record<string, unknown>
  assert.equal(revised.title, 'Жетон «мурмяу» с гравировкой по фотографии')
  for (const field of ['summary', 'task', 'solution', 'result', 'cta', 'seoDescription']) assert.ok(typeof revised[field] === 'string' && revised[field], field)
  assert.match(String(revised.solution), /Подготовили фотографию/)
  assert.match(String(revised.solution), /третий шрифт/)
  assert.match(String(revised.solution), /две лапки и согласовали/)
  assert.equal(revised.cta, 'Есть фото, рисунок или идея? Пришлите нам, проверим возможность изготовления и рассчитаем стоимость')
  const provenance = generated.find(record => record.id === slug)!.contentFactory
  assert.equal(provenance.packVersion, 5)
  assert.equal(provenance.approvalHash, '4b3f6597cfd310b1804442cf126341d4b8681d5d1c571ed643da826f46ceeca3')
  assert.notEqual(provenance.approvalHash, '1a181a878dded7cbfebe979365359c88448aba5047ebb38ba950b9240c77e300')
  assert.equal(item.images?.length, 2)
  for (const image of revised.images as { stage?: string }[]) assert.equal(image.stage, 'result')
  const hashes = ['3955ca7d58ecd4153c5141137333e9d1460723575f214797ae4a27a265dd040d', 'e8882331f13faee87aa0c1c1441f4ad1c1d071f719fefac9f315936f693ef3bd']
  item.images!.forEach((image, index) => assert.equal(sha(readFileSync(`public${image.src}`)), hashes[index]))
  const originals = ['354b1e206a2b8a80b72fc092be3d57124f213c96743eb587f3811c7a12b0bccc', '359840c544e882f119aa87357de3b9c3de245ef4858c0c58060f108412fce541']
  const regions = [{ left: 24, top: 160, width: 736, height: 220 }, { left: 20, top: 182, width: 696, height: 222 }]
  for (const [index, hash] of originals.entries()) {
    const original = readFileSync(`public/images/cases/content-factory/murmiau-engraved-tag-${hash.slice(0, 12)}.jpg`)
    assert.equal(sha(original), hash)
    const expected = await sharp(original).extract(regions[index]).removeAlpha().raw().toBuffer()
    const actual: Buffer = await sharp(readFileSync(`public${item.images[index].src}`)).removeAlpha().raw().toBuffer()
    // Decoder implementations can differ by a few levels; geometry and dimensions must be exact.
    assert.equal(actual.length, expected.length)
    assert.ok(actual.every((value, offset) => Math.abs(value - expected[offset]) <= 4))
  }
  assert.equal(item.image, item.images![0].src)
  for (const key of ['price', 'qty', 'deadline'] as const) assert.equal(item[key], '')
  assert.equal(item.video, undefined)
  assert.deepEqual(item.tags, [])
  assert.deepEqual(publicCases.slice(0, cases.length), cases)
  assert.equal(publicCases[cases.length].id, 'company-gift-infinity')
  assert.equal(publicCases.at(-1)?.id, slug)
  assert.equal(new Set(publicCases.map(record => record.id)).size, publicCases.length)
  const html = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug }) }))
  // Structured UI may split solution into preparation/approval/production sections.
  for (const paragraph of [getPublicCase(slug)!.task, getPublicCase(slug)!.result]) assert.ok(html.includes(paragraph))
  assert.doesNotMatch(html, /<video/)
  assert.ok(generateStaticParams().some(record => record.slug === slug))
  const metadata = await generateMetadata({ params: Promise.resolve({ slug }) })
  assert.equal(metadata.alternates?.canonical, `https://clc-ufa.ru/cases/${slug}`)
})
