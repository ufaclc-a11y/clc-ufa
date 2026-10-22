import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// The generated next/font fallback uses local Arial. If that face is absent,
// system-ui can have very different Cyrillic widths and cause a font-swap CLS.
test('body font keeps an Arial-compatible fallback before generic sans-serif', () => {
  const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
  const declaration = css.match(/--font-body:\s*([^;]+);/)?.[1]
  assert.ok(declaration, 'body font variable must exist')
  const families = declaration.split(',').map(value => value.trim())
  assert.equal(families[0], 'var(--f-body)', 'keep the original Manrope and generated fallback first')
  assert.equal(families[1], 'Arial', 'use the compatible Arial mapping when local Arial is unavailable')
  assert.equal(families.at(-1), 'sans-serif')
  assert.ok(!families.includes('system-ui'), 'avoid platform-specific system font metrics during swap')
})
