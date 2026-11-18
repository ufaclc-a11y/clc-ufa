import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { portfolioCaseLinks } from '../lib/portfolio-case-links'
import { publicCases } from '../lib/public-cases'

const root = path.resolve(import.meta.dirname, '..')
const index = JSON.parse(readFileSync(path.join(root, 'data/photo-index.json'), 'utf8')) as Record<string, { sha256: string; dhash: string }>

test('photo index covers every portfolio file with the right hash (run npm run gen:photo-index after adding photos)', () => {
  const files = readdirSync(path.join(root, 'public/images/portfolio')).filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  assert.deepEqual(Object.keys(index).sort(), files.sort())
  for (const file of files.slice(0, 25)) {
    assert.equal(index[file].sha256, createHash('sha256').update(readFileSync(path.join(root, 'public/images/portfolio', file))).digest('hex'))
  }
})

test('no Content Factory case keeps its own copy of a photo that already exists in the portfolio', async () => {
  const { dhash } = await import('../scripts/gen-photo-index.mjs')
  const hamming = (a: string, b: string) => [...a].reduce((sum, ch, i) => { let v = parseInt(ch, 16) ^ parseInt(b[i], 16); let d = 0; while (v) { d += v & 1; v >>= 1 } return sum + d }, 0)
  for (const item of publicCases.filter(c => 'contentFactory' in c && c.id !== 'company-gift-infinity' && c.id !== 'murmiau-engraved-tag')) {
    for (const image of item.images ?? []) {
      const file = path.join(root, 'public', image.src)
      assert.ok(existsSync(file), `${item.id}: ${image.src} missing`)
      if (image.src.startsWith('/images/portfolio/')) continue
      const hash = await dhash(readFileSync(file))
      const nearest = Object.entries(index).map(([name, value]) => [hamming(hash, value.dhash), name] as const).sort((a, b) => a[0] - b[0])[0]
      assert.ok(nearest[0] > 6, `${item.id}: ${image.src} дублирует фото портфолио ${nearest[1]} — сошлитесь на /images/portfolio/${nearest[1]} и удалите копию`)
    }
  }
})

test('portfolio links point from a portfolio photo to the case that uses it', () => {
  const links = portfolioCaseLinks([
    { id: 'a', title: 'A', image: '/images/portfolio/x.jpg', images: [{ src: '/images/portfolio/x.jpg', alt: '' }, { src: '/images/cases/a/own.jpg', alt: '' }] },
    { id: 'b', title: 'B', image: '/images/cases/b/b.jpg', images: [{ src: '/images/portfolio/y.jpg', alt: '' }, { src: '/images/portfolio/x.jpg', alt: '' }] },
  ] as never)
  assert.deepEqual([...links.entries()], [['/images/portfolio/x.jpg', { id: 'a', title: 'A' }], ['/images/portfolio/y.jpg', { id: 'b', title: 'B' }]])
})
