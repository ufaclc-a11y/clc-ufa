import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { contentFactoryCaseFromExport } from '../scripts/lib/content-factory-export.mjs'
import { relatedCaseLinks } from '../lib/case-related'
import { services } from '../data/services'
import { seoPages } from '../data/seo-pages'
import { getPublicCase } from '../lib/public-cases'
import type { Case } from '../data/cases'

const curated = ['/services/izgotovlenie-izdelij', '/services/uf-pechat', '/lazernaya-rezka-akrila-ufa', '/suveniry-na-zakaz-ufa']

test('actual export retains story/media labels and explicit policy with allowlisted existing services', () => {
  const source = { schemaVersion: 'content-factory.website-case.v1', approval: { packId: 'fixture', packVersion: 1, approvalHash: 'synthetic' }, project: { id: 'fixture' }, websiteCase: { slug: 'fixture', title: 'Изделие', storyLevel: 'C', autoRelatedCases: false, serviceLinks: [...curated, '/fake', 'https://example.org', 3, curated[0]] }, media: [{ stage: 'before', label: 'ИИ-референс', alt: 'Идея', width: 100, height: 200 }] }
  const item = contentFactoryCaseFromExport({ ...source, payloadHash: createHash('sha256').update(JSON.stringify(source)).digest('hex') }, ['/image.jpg']) as Case
  assert.equal(item.autoRelatedCases, false)
  assert.deepEqual(item.serviceLinks, curated)
  assert.equal(item.images![0].label, 'ИИ-референс')
  assert.equal(item.images![0].stage, 'before')
  assert.equal(item.images![0].width, 100)
  assert.deepEqual(relatedCaseLinks(item, []).map(l => l.href), curated)
  for (const href of curated) {
    assert.ok(href.startsWith('/services/') ? services.some(s => `/services/${s.slug}` === href) : seoPages.some(p => `/${p.slug}` === href), href)
  }
})

test('autoRelatedCases false suppresses product-first exact examples but keeps real technology services', () => {
  const known = getPublicCase('murmiau-engraved-tag')!
  const item = { ...known, autoRelatedCases: false }
  assert.deepEqual(relatedCaseLinks(item, [{ ...known, id: 'exact-other' }]).map(l => l.href), ['/services/gravirovka-na-metalle', '/products/zhetony'])
})

test('direct malformed taxonomy never silently becomes a confirmed product-first match', () => {
  const known = getPublicCase('murmiau-engraved-tag')!
  const item = { ...known, classification: { technologies: ['engraving', 'unknown'], material: 'metal', type: 'tag' } }
  assert.deepEqual(relatedCaseLinks(item, [{ ...item, id: 'same-unconfirmed' }]), [])
})


test('real CLI carries explicit A/B/C plus unknown omission through approved export files', async () => {
  const { mkdtemp, mkdir, writeFile, readFile, rm } = await import('node:fs/promises')
  const { spawnSync } = await import('node:child_process')
  const path = await import('node:path')
  const root = await mkdtemp(path.join((await import('node:os')).tmpdir(), 'adaptive-cli-'))
  try {
    await mkdir(path.join(root, 'content'))
    await mkdir(path.join(root, 'media'))
    await writeFile(path.join(root, 'content/content-factory-cases.json'), '[]')
    await writeFile(path.join(root, 'media/item.jpg'), await readFile('public/images/cases/company-gift-infinity/01-front.jpg'))
    for (const level of ['A', 'B', 'C', 'unknown']) {
      const payload = { schemaVersion: 'content-factory.website-case.v1', approval: { packId: 'fixture', packVersion: 1, approvalHash: 'synthetic' }, project: { id: 'fixture' }, websiteCase: { slug: 'fixture', title: 'Фикстура', problem: 'Идея', solution: 'Решение', production: 'Изготовили', result: 'Готовое изделие', storyLevel: level, autoRelatedCases: false, serviceLinks: curated }, media: [{ filename: 'private.pdf', stage: 'before' }, { filename: 'item.jpg', stage: 'result', label: 'Готовое изделие', alt: 'Фикстура' }] }
      await writeFile(path.join(root, 'export.json'), JSON.stringify({ ...payload, payloadHash: createHash('sha256').update(JSON.stringify(payload)).digest('hex') }))
      const result = spawnSync(process.execPath, [path.resolve('scripts/import-content-factory-case.mjs'), '--export=export.json', '--media-dir=media'], { cwd: root, encoding: 'utf8' })
      assert.equal(result.status, 0, result.stderr)
      const [record] = JSON.parse(await readFile(path.join(root, 'content/content-factory-cases.json'), 'utf8'))
      assert.equal(record.storyLevel, level === 'unknown' ? undefined : level)
      assert.equal(record.images[0].label, 'Готовое изделие')
      assert.equal(record.images[0].stage, 'result')
      assert.equal(record.autoRelatedCases, false)
      assert.deepEqual(record.serviceLinks, curated)
    }
  } finally { await rm(root, { recursive: true, force: true }) }
})
