import sharp from 'sharp'
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const ROOT = 'public'
const MAX = 1920
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const SKIP = new Set(['public/images/og-image.jpg'])
const norm = (s) => s.split(path.sep).join('/')

const files = []
function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (exts.has(path.extname(e.name).toLowerCase())) files.push(p)
  }
}
walk(ROOT)

let before = 0, after = 0, rewritten = 0, skipped = 0
for (const f of files) {
  if (SKIP.has(norm(f))) { skipped++; continue }
  const ext = path.extname(f).toLowerCase()
  const input = readFileSync(f)
  before += input.length
  try {
    let pipe = sharp(input, { failOn: 'none' }).rotate()
    const meta = await pipe.metadata()
    if (Math.max(meta.width || 0, meta.height || 0) > MAX) {
      pipe = pipe.resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    }
    if (ext === '.png') {
      pipe = pipe.png({ compressionLevel: 9, effort: 10, palette: true, quality: 82 })
    } else if (ext === '.webp') {
      pipe = pipe.webp({ quality: 80, effort: 5 })
    } else {
      pipe = pipe.jpeg({ quality: 80, mozjpeg: true })
    }
    const out = await pipe.toBuffer()
    if (out.length < input.length) {
      writeFileSync(f, out)
      after += out.length
      rewritten++
    } else {
      after += input.length
    }
  } catch (e) {
    after += input.length
    console.error('skip (error):', norm(f), e.message)
  }
}
console.log('Файлов обработано:', files.length, '| пропущено:', skipped, '| перезаписано:', rewritten)
console.log('До: ', (before / 1e6).toFixed(1), 'МБ')
console.log('После:', (after / 1e6).toFixed(1), 'МБ')
console.log('Экономия:', ((before - after) / 1e6).toFixed(1), 'МБ (' + (100 * (before - after) / before).toFixed(1) + '%)')
