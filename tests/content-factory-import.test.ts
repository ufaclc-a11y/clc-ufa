import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { contentFactoryCaseFromExport, verifyContentFactoryExport } from '../scripts/lib/content-factory-export.mjs'

function fixture() {
  const unsigned = {
    schemaVersion: 'content-factory.website-case.v1',
    exportedAt: '2026-09-16T10:00:00.000Z',
    approval: { packId: 'pack-1', packVersion: 1, approvalHash: 'approved-hash', qaVersion: 'content-qa-v1', approvedAt: '2026-09-16T09:00:00.000Z' },
    project: { id: 'project-1', title: 'Таблички', customerType: 'B2B', industry: 'Офис', customerProblem: 'Навигация', requestedProduct: 'Таблички', resultDescription: 'Комплект готов', score: 80 },
    websiteCase: { slug: 'tablichki-office', title: 'Таблички для офиса', summary: 'Реальный проект', problem: 'Нужна навигация', solution: 'Изготовили комплект', result: 'Комплект установлен', cta: 'Обсудить задачу', price: '', qty: '', deadline: '', claims: [] },
    media: [{ filename: 'result.jpg', sha256: 'abc' }],
  }
  return { ...unsigned, payloadHash: createHash('sha256').update(JSON.stringify(unsigned)).digest('hex') }
}

test('website importer accepts only a hash-valid approved v1 package', () => {
  const payload = fixture()
  assert.equal(verifyContentFactoryExport(payload), payload)
  assert.throws(() => verifyContentFactoryExport({ ...payload, payloadHash: 'tampered' }), /payloadHash mismatch/)
  assert.throws(() => verifyContentFactoryExport({ ...payload, approval: { packId: 'pack-1' } }), /Approved pack metadata/)
})

test('website importer maps safe public fields and never invents commercial facts', () => {
  const imported = contentFactoryCaseFromExport(fixture(), ['/images/cases/content-factory/result.jpg', '/images/cases/content-factory/detail.jpg'], '2026-09-16T11:00:00.000Z')
  assert.equal(imported.id, 'tablichki-office')
  assert.equal(imported.client, 'Клиент Центра лазерной резки')
  assert.equal(imported.price, 'По запросу')
  assert.equal(imported.qty, 'По задаче')
  assert.equal(imported.deadline, 'По расчёту')
  assert.equal(imported.category, 'Реальный проект')
  assert.equal(imported.image, '/images/cases/content-factory/result.jpg')
  assert.deepEqual(imported.images, [
    { src: '/images/cases/content-factory/result.jpg', alt: 'Таблички для офиса' },
    { src: '/images/cases/content-factory/detail.jpg', alt: 'Таблички для офиса, фото 2' },
  ])
  assert.deepEqual(imported.tags, [])
  assert.equal(imported.contentFactory.packId, 'pack-1')
  assert.equal(imported.contentFactory.projectId, 'project-1')
})

test('website importer maps explicitly approved commercial display fields', () => {
  const payload = fixture()
  payload.websiteCase = { ...payload.websiteCase, price: '12 500 ₽', qty: '5 наборов', deadline: '3 рабочих дня' }
  const unsigned = { ...payload, payloadHash: undefined }
  const signed = { ...unsigned, payloadHash: createHash('sha256').update(JSON.stringify(unsigned)).digest('hex') }
  const imported = contentFactoryCaseFromExport(signed, '/images/cases/content-factory/result.jpg')
  assert.equal(imported.price, '12 500 ₽')
  assert.equal(imported.qty, '5 наборов')
  assert.equal(imported.deadline, '3 рабочих дня')
})

test('website importer ignores raw project metadata outside the approved Website Case', () => {
  const payload = fixture()
  payload.project = {
    ...payload.project,
    title: 'PRIVATE',
    industry: 'PRIVATE',
    requestedProduct: 'PRIVATE',
    resultDescription: 'PRIVATE',
  }
  const unsigned = { ...payload, payloadHash: undefined }
  const signed = { ...unsigned, payloadHash: createHash('sha256').update(JSON.stringify(unsigned)).digest('hex') }
  const imported = contentFactoryCaseFromExport(signed, '/images/cases/content-factory/result.jpg')
  assert.equal(JSON.stringify(imported).includes('PRIVATE'), false)
})
