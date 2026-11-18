// Индекс фото портфолио для устранения дублей: data/photo-index.json = { "<имя файла>": { sha256, dhash } }.
// dhash считается так же, как в Content Factory (lib/content-factory/domain/fingerprint.ts: sharp, rotate, 9x8, grayscale, difference hash),
// поэтому публикатор кейсов узнаёт уже имеющееся в портфолио фото (даже пережатое) и ссылается на него вместо копии файла.
// Запуск: npm run gen:photo-index (после добавления фото в public/images/portfolio).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'public', 'images', 'portfolio')

export async function dhash(bytes) {
  const { data } = await sharp(bytes, { failOn: 'error', limitInputPixels: 40_000_000 }).rotate().resize(9, 8, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true })
  let hex = ''
  for (let i = 0; i < 64; i += 4) {
    let nibble = 0
    for (let b = 0; b < 4; b += 1) { const y = Math.floor((i + b) / 8), x = (i + b) % 8; nibble = (nibble << 1) | (data[y * 9 + x] > data[y * 9 + x + 1] ? 1 : 0) }
    hex += nibble.toString(16)
  }
  return hex
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = {}
  for (const file of readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort()) {
    const bytes = readFileSync(path.join(dir, file))
    try { out[file] = { sha256: createHash('sha256').update(bytes).digest('hex'), dhash: await dhash(bytes) } }
    catch (error) { console.error('skip', file, error instanceof Error ? error.message : error) }
  }
  writeFileSync(path.join(root, 'data', 'photo-index.json'), `${JSON.stringify(out, null, 1)}\n`)
  console.log(`photo-index: ${Object.keys(out).length} files`)
}
