import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import CasePage from '../app/cases/[slug]/page'
import { JsonLd } from '../components/JsonLd'
import { getPublicCase } from '../lib/public-cases'
import { contentFactoryCaseFromExport } from '../scripts/lib/content-factory-export.mjs'

const attack = '</script><script>globalThis.__injected=1</script>'

test('JSON-LD encodes HTML delimiters and preserves exact nested JSON values', () => {
  const data = { '@type': 'CreativeWork', name: attack, nested: [attack.toUpperCase(), 'Глаза & «мурмяу» <3', null] }
  const html = renderToStaticMarkup(JsonLd({ data }))
  const body = html.match(/^<script type="application\/ld\+json">([\s\S]*)<\/script>$/)?.[1]
  assert.ok(body)
  assert.equal(body.includes('<'), false, 'JSON-LD content must not contain HTML tag delimiters')
  assert.deepEqual(JSON.parse(body), data)
  assert.equal((html.match(/<script\b/gi) || []).length, 1)
})

test('actual imported SEO, title and fallback task cannot close a CasePage JSON-LD block', async () => {
  const item = getPublicCase('murmiau-engraved-tag')!
  const original = { ...item }
  try {
    for (const field of ['seoDescription', 'title', 'task'] as const) {
      Object.assign(item, original)
      const unsigned = {
        schemaVersion: 'content-factory.website-case.v1',
        approval: { packId: 'synthetic-security-test', packVersion: 1, approvalHash: 'synthetic-fixture' },
        project: { id: 'synthetic-project' },
        websiteCase: { slug: item.id, title: field === 'title' ? attack : 'Synthetic title', problem: field === 'task' ? attack : 'Synthetic task', ...(field === 'seoDescription' ? { seoDescription: attack } : {}) },
        media: [],
      }
      const payload = { ...unsigned, payloadHash: createHash('sha256').update(JSON.stringify(unsigned)).digest('hex') }
      const imported = contentFactoryCaseFromExport(payload, ['/images/synthetic-security-test.jpg'])
      Object.assign(item, imported, { summary: undefined, seoDescription: field === 'seoDescription' ? attack : undefined })
      const html = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug: item.id }) }))
      assert.equal(html.includes('</script><script>'), false, field)
      const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
      assert.ok(scripts.some(s => s[1].includes('application/ld+json')))
      assert.ok(scripts.every(s => s[1].includes('application/ld+json')), 'no executable inline script may be created')
      const data = scripts.map(s => JSON.parse(s[2]))
      const creative = data.find(row => row['@type'] === 'CreativeWork')
      assert.ok(creative)
      assert.equal(field === 'title' ? creative.name : creative.description, attack)
    }
  } finally {
    for (const key of Object.keys(item)) delete (item as unknown as Record<string, unknown>)[key]
    Object.assign(item, original)
  }
})
