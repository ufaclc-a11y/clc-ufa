import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { contentFactoryCaseFromExport } from '../scripts/lib/content-factory-export.mjs'

const sign = <T extends object>(p: T) => ({ ...p, payloadHash: createHash('sha256').update(JSON.stringify(p)).digest('hex') })
const payload = (website: object = {}, media: object[] = []) => sign({ schemaVersion: 'content-factory.website-case.v1', approval: { packId: 'new-revision', packVersion: 2, approvalHash: 'new-hash' }, project: { id: 'test' }, websiteCase: { slug: 'test-case', title: 'Жетон', problem: 'Задача', solution: 'Решение', result: 'Результат', ...website }, media })

test('imports approved story, summary, CTA and SEO without commercial placeholders', () => {
  const story = { summary: 'Коротко', sourceMaterials: 'Фото', preparation: 'Подготовили', approvedDetails: 'Согласовали', production: 'Гравировка', cta: 'Пришлите идею', seoDescription: 'Описание' }
  const record: Record<string, unknown> = contentFactoryCaseFromExport(payload(story), ['/one.jpg'])
  for (const [field, value] of Object.entries(story)) assert.equal(record[field], value, field)
  for (const field of ['client', 'price', 'qty', 'deadline']) assert.equal(record[field], '', field)
})

test('missing source text stays empty rather than claiming an undocumented completed project', () => {
  const record = contentFactoryCaseFromExport(payload({ problem: undefined, summary: undefined, solution: undefined, result: undefined }), ['/one.jpg'])
  for (const field of ['task', 'solution', 'result'] as const) assert.equal(record[field], '')
})

test('only explicit media stage is kept; roles never imply stages and alt remains honest', () => {
  const media = [{ filename: 'front.jpg', alt: 'Глаза на жетоне', role: 'COVER', stage: 'result' }, { filename: 'back.jpg', role: 'GALLERY' }]
  const record = contentFactoryCaseFromExport(payload({}, media), ['/front.jpg', '/back.jpg'])
  assert.deepEqual(record.images, [{ src: '/front.jpg', alt: 'Глаза на жетоне', stage: 'result' }, { src: '/back.jpg', alt: 'Жетон, фото 2' }])
  assert.equal(record.imageAlt, 'Глаза на жетоне')
  const invalid = contentFactoryCaseFromExport(payload({}, [{ filename: 'x.jpg', stage: 'COVER' }]), ['/x.jpg'])
  assert.equal(invalid.images[0].stage, undefined)
})

test('real CLI replaces in place, keeps unrelated records and reconciles filtered media', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'clc-import-test-'))
  try {
    await mkdir(path.join(root, 'content'))
    await mkdir(path.join(root, 'media'))
    const old = [{ id: 'z-first', custom: { untouched: true }, contentFactory: { packId: 'new-revision' } }, { id: 'test-case', contentFactory: { packId: 'old-revision' } }, { id: 'a-last', custom: 7 }]
    const data = path.join(root, 'content/content-factory-cases.json')
    await writeFile(data, JSON.stringify(old))
    await writeFile(path.join(root, 'media/result.jpg'), await readFile('public/images/cases/content-factory/murmiau-engraved-tag-354b1e206a2b.jpg'))
    await writeFile(path.join(root, 'export.json'), JSON.stringify(payload({}, [{ filename: 'private.pdf', stage: 'before' }, { filename: 'result.jpg', stage: 'result', alt: 'Готовый жетон' }])))
    const run = () => spawnSync(process.execPath, [path.resolve('scripts/import-content-factory-case.mjs'), '--export=export.json', '--media-dir=media'], { cwd: root, encoding: 'utf8' })
    const result = run()
    assert.equal(result.status, 0, result.stderr)
    const next = JSON.parse(await readFile(data, 'utf8'))
    assert.deepEqual(next.map((r: { id: string }) => r.id), old.map(r => r.id))
    assert.deepEqual(next[0], old[0]); assert.deepEqual(next[2], old[2])
    assert.equal(next[1].images[0].alt, 'Готовый жетон')
    assert.equal(next[1].images[0].stage, 'result')
    assert.equal(run().status, 0)
    assert.equal(JSON.parse(await readFile(data, 'utf8')).length, 3)
  } finally { await rm(root, { recursive: true, force: true }) }
})
