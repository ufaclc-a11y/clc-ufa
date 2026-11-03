import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

test('generator emits exhaustive public index identical to TS, hashes assets, rejects missing assets', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'portfolio-index-'))
  try {
    for (const dir of ['scripts', 'data', 'public/images/portfolio']) mkdirSync(path.join(root, dir), { recursive: true })
    copyFileSync('scripts/gen-portfolio.mjs', path.join(root, 'scripts/gen-portfolio.mjs'))
    const manifest: Record<string, { categories: string[]; order: Record<string, number>; private?: string }> = {}
    for (let i = 0; i < 65; i++) {
      const name = `p-${i}.jpg`
      manifest[name] = { categories: ['a'], order: { a: 65 - i }, private: 'not public' }
      writeFileSync(path.join(root, 'public/images/portfolio', name), `image ${i}`)
    }
    writeFileSync(path.join(root, 'data/portfolio-tags.json'), JSON.stringify(manifest))
    const run = () => spawnSync(process.execPath, ['scripts/gen-portfolio.mjs'], { cwd: root, encoding: 'utf8' })
    assert.equal(run().status, 0)
    const index = JSON.parse(readFileSync(path.join(root, 'public/portfolio-index.json'), 'utf8'))
    const ts = readFileSync(path.join(root, 'data/portfolio.generated.ts'), 'utf8')
    assert.deepEqual(index.categories, JSON.parse(ts.slice(ts.indexOf(' = ') + 3)))
    assert.equal(index.categories.a.length, 65)
    assert.equal(Object.keys(index.sha256).length, 65)
    assert.match(index.sha256['p-0.jpg'], /^[a-f0-9]{64}$/)
    assert.ok(!JSON.stringify(index).includes('not public'))
    delete manifest['p-0.jpg']
    writeFileSync(path.join(root, 'data/portfolio-tags.json'), JSON.stringify(manifest))
    assert.equal(run().status, 0)
    assert.ok(!readFileSync(path.join(root, 'public/portfolio-index.json'), 'utf8').includes('p-0.jpg'))
    rmSync(path.join(root, 'public/images/portfolio/p-1.jpg'))
    assert.notEqual(run().status, 0, 'missing asset must fail closed')
  } finally { rmSync(root, { recursive: true, force: true }) }
})
