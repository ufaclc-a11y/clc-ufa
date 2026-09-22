import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { contentFactoryCaseFromExport, verifyContentFactoryExport } from './lib/content-factory-export.mjs'

function arg(name) {
  const prefix = `--${name}=`
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length)
}

function safeFilename(value) {
  return typeof value === 'string' && value === path.basename(value) && /\.(?:avif|gif|jpe?g|png|webp)$/i.test(value)
}

async function main() {
  const exportFile = arg('export')
  const mediaDir = arg('media-dir')
  if (!exportFile || !mediaDir) throw new Error('Usage: npm run import:content-factory -- --export=<json> --media-dir=<downloaded-media-directory>')
  const payload = verifyContentFactoryExport(JSON.parse(await readFile(path.resolve(exportFile), 'utf8')))
  const media = (payload.media ?? []).filter(item => safeFilename(item?.filename) && (!item.mimeType || item.mimeType.startsWith('image/')))
  if (!media.length) throw new Error('Approved export has no transferable product image')
  const destinationDir = path.resolve('public', 'images', 'cases', 'content-factory')
  await mkdir(destinationDir, { recursive: true })
  const imagePaths = []
  for (const item of media) {
    const source = path.resolve(mediaDir, item.filename)
    const bytes = await readFile(source)
    const actualSha = createHash('sha256').update(bytes).digest('hex')
    if (item.sha256 && item.sha256 !== actualSha) throw new Error(`Media SHA-256 mismatch for ${item.filename}`)
    const extension = path.extname(item.filename).toLowerCase()
    const destinationName = `${payload.websiteCase.slug}-${actualSha.slice(0, 12)}${extension}`
    await copyFile(source, path.join(destinationDir, destinationName))
    imagePaths.push(`/images/cases/content-factory/${destinationName}`)
  }

  const dataFile = path.resolve('content', 'content-factory-cases.json')
  const current = JSON.parse(await readFile(dataFile, 'utf8'))
  if (!Array.isArray(current)) throw new Error('content/content-factory-cases.json must be an array')
  const record = contentFactoryCaseFromExport(payload, imagePaths)
  const next = [...current.filter((item) => item?.contentFactory?.packId !== payload.approval.packId && item?.id !== record.id), record]
    .sort((left, right) => String(left.id).localeCompare(String(right.id)))
  const temporary = `${dataFile}.tmp`
  await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  await rename(temporary, dataFile)
  console.log(JSON.stringify({ imported: record.id, images: imagePaths.length, cover: record.image, total: next.length }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
