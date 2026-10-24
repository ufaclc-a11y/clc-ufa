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

export function contentFactoryCaseFromExport(payload, imagePathsInput, importedAt = new Date().toISOString(), transferredMedia = undefined) {
  verifyContentFactoryExport(payload)
  const website = payload.websiteCase
  const slug = text(website.slug, '')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('websiteCase.slug is invalid')
  const imagePaths = Array.isArray(imagePathsInput) ? imagePathsInput : [imagePathsInput]
  if (!imagePaths.length || imagePaths.some(imagePath => typeof imagePath !== 'string' || !imagePath.startsWith('/'))) throw new Error('At least one public image path is required')
  const titleAlt = text(website.title, 'Выполненная работа')
  // Never align a filtered transfer with the unfiltered export by index.
  const approvedMedia = transferredMedia ?? (payload.media?.length === imagePaths.length ? payload.media : [])
  const images = imagePaths.map((src, index) => {
    const media = approvedMedia[index]
    const stage = ['before', 'process', 'result'].includes(media?.stage) ? media.stage : undefined
    return { src, alt: text(media?.alt, index ? `${titleAlt}, фото ${index + 1}` : titleAlt), ...(stage ? { stage } : {}), ...(Number.isInteger(media?.width) && media.width > 0 && Number.isInteger(media?.height) && media.height > 0 ? { width: media.width, height: media.height } : {}) }
  })
  const imageAlt = images[0].alt
  const raw = website.classification
  const knownTechnologies = ['engraving', 'laser-cutting', 'milling', 'uv-printing']
  const requested = raw?.technologies ?? (raw?.technology ? [raw.technology] : [])
  const technologies = Array.isArray(requested) ? [...new Set(requested.filter(t => knownTechnologies.includes(t)))] : []
  // A partly unknown process set must never become a confirmed exact-match taxonomy.
  const taxonomyComplete = Array.isArray(requested) && requested.every(t => knownTechnologies.includes(t))
  const material = ['metal', 'acrylic', 'wood', 'plywood', 'plastic', 'glass', 'composite', 'paper', 'leather'].includes(raw?.material) ? raw.material : undefined
  const type = ['tag', 'sign', 'award', 'construction', 'part', 'souvenir', 'panel', 'stand', 'organizer'].includes(raw?.type) ? raw.type : undefined
  return {
    presentation: 'product-first',
    ...(taxonomyComplete && (technologies.length || material || type) ? { classification: { ...(technologies.length ? { technologies } : {}), ...(material ? { material } : {}), ...(type ? { type } : {}) } } : {}),
    id: slug,
    title: text(website.title, 'Реальный проект'),
    client: '',
    ...Object.fromEntries(['summary', 'sourceMaterials', 'preparation', 'approvedDetails', 'production', 'cta', 'seoDescription']
      .filter(field => typeof website[field] === 'string' && website[field].trim())
      .map(field => [field, website[field].trim()])),
    category: 'Реальный проект',
    image: imagePaths[0],
    imageAlt,
    images,
    task: text(website.problem, text(website.summary, '')),
    solution: text(website.solution, ''),
    result: text(website.result, ''),
    price: text(website.price, ''),
    qty: text(website.qty, ''),
    deadline: text(website.deadline, ''),
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
