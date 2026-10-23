import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

test('CLI rejects malformed slugs before creating any public directory or copying media', async () => {
  const importer = path.resolve('scripts/import-content-factory-case.mjs')
  const jpeg = await readFile('public/images/cases/content-factory/murmiau-engraved-tag-354b1e206a2b.jpg')
  for (const slug of ['../escaped', '../../outside', '/absolute', 'test/child', ' test-case']) {
    const root = await mkdtemp(path.join(tmpdir(), 'clc-import-path-'))
    try {
      await mkdir(path.join(root, 'content'))
      await mkdir(path.join(root, 'media'))
      const previous = '[{"id":"existing","unchanged":true}]\n'
      const data = path.join(root, 'content/content-factory-cases.json')
      await writeFile(data, previous)
      await writeFile(path.join(root, 'media/result.jpg'), jpeg)
      const unsigned = {
        schemaVersion: 'content-factory.website-case.v1',
        approval: { packId: 'path-test', packVersion: 1, approvalHash: 'synthetic-approved-fixture' },
        project: { id: 'synthetic-project' },
        websiteCase: { slug, title: 'Synthetic path-safety test' },
        media: [{ filename: 'result.jpg', mimeType: 'image/jpeg', sha256: createHash('sha256').update(jpeg).digest('hex') }],
      }
      const payload = { ...unsigned, payloadHash: createHash('sha256').update(JSON.stringify(unsigned)).digest('hex') }
      await writeFile(path.join(root, 'export.json'), JSON.stringify(payload))
      const result = spawnSync(process.execPath, [importer, '--export=export.json', '--media-dir=media'], { cwd: root, encoding: 'utf8' })
      assert.equal(result.status, 1, `must reject ${JSON.stringify(slug)}: ${result.stderr}`)
      assert.match(result.stderr, /websiteCase\.slug is invalid/)
      assert.equal(await readFile(data, 'utf8'), previous)
      await assert.rejects(access(path.join(root, 'public')), { code: 'ENOENT' }, 'no mkdir/copy is allowed before slug validation')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  }
})
