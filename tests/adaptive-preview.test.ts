import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'

test('local browser fixtures are 404 by default and noindex when explicitly enabled in development', async () => {
  const { default: Preview, metadata } = await import('../app/case-preview/[slug]/page')
  const previous = { mode: process.env.NODE_ENV, flag: process.env.CLC_CASE_PREVIEW }
  try {
    delete process.env.CLC_CASE_PREVIEW
    await assert.rejects(() => Preview({ params: Promise.resolve({ slug: 'large' }) }), /NEXT_HTTP_ERROR_FALLBACK;404/)
    Object.assign(process.env, { NODE_ENV: 'development' })
    process.env.CLC_CASE_PREVIEW = '1'
    const html = renderToStaticMarkup(await Preview({ params: Promise.resolve({ slug: 'large' }) }))
    assert.match(html, /Синтетический пример/)
    assert.match(html, /data-product-gallery/)
    assert.match(html, /object-contain/)
    assert.equal((html.match(/data-case-calculation-trigger=/g) ?? []).length, 2)
    assert.deepEqual(metadata.robots, { index: false, follow: false })
    Object.assign(process.env, { NODE_ENV: 'production' })
    await assert.rejects(() => Preview({ params: Promise.resolve({ slug: 'large' }) }), /NEXT_HTTP_ERROR_FALLBACK;404/)
  } finally {
    for (const [key, value] of Object.entries({ NODE_ENV: previous.mode, CLC_CASE_PREVIEW: previous.flag })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value
    }
  }
})
