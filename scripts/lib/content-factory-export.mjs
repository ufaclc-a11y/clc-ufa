import { createHash } from 'node:crypto'

export const WEBSITE_EXPORT_SCHEMA = 'content-factory.website-case.v1'

export function verifyContentFactoryExport(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Export payload must be an object')
  if (payload.schemaVersion !== WEBSITE_EXPORT_SCHEMA) throw new Error(`Unsupported schemaVersion: ${payload.schemaVersion}`)
  if (!payload.approval?.packId || !payload.approval?.approvalHash || payload.approval?.packVersion < 1) throw new Error('Approved pack metadata is required')
  if (!payload.websiteCase || typeof payload.websiteCase !== 'object') throw new Error('websiteCase is required')
  const { payloadHash, ...unsigned } = payload
  const expected = createHash('sha256').update(JSON.stringify(unsigned)).digest('hex')
  if (payloadHash !== expected) throw new Error('payloadHash mismatch')
  return payload
}

function text(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export function contentFactoryCaseFromExport(payload, imagePath, importedAt = new Date().toISOString()) {
  verifyContentFactoryExport(payload)
  const website = payload.websiteCase
  const slug = text(website.slug, '')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('websiteCase.slug is invalid')
  return {
    id: slug,
    title: text(website.title, 'Реальный проект'),
    client: 'Клиент Центра лазерной резки',
    category: 'Реальный проект',
    image: imagePath,
    imageAlt: text(website.title, 'Выполненная работа'),
    task: text(website.problem, website.summary ?? 'Задача клиента'),
    solution: text(website.solution, 'Решение Центра лазерной резки'),
    result: text(website.result, 'Проект выполнен'),
    price: text(website.price, 'По запросу'),
    qty: text(website.qty, 'По задаче'),
    deadline: text(website.deadline, 'По расчёту'),
    tags: [],
    contentFactory: {
      schemaVersion: WEBSITE_EXPORT_SCHEMA,
      projectId: payload.project.id,
      packId: payload.approval.packId,
      packVersion: payload.approval.packVersion,
      approvalHash: payload.approval.approvalHash,
      payloadHash: payload.payloadHash,
      importedAt,
    },
  }
}
