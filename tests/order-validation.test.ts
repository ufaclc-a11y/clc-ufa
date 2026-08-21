import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  isSpam, hasContact, isPlausibleContact, checkAttachment, escapeHtml,
  MAX_FILE_BYTES, MAX_TOTAL_BYTES,
} from '../lib/order-validation'

test('honeypot: заполненное поле company помечает заявку как спам', () => {
  assert.equal(isSpam({ company: 'ООО Спам' }), true)
  assert.equal(isSpam({ company: '  x  ' }), true)
})

test('honeypot: пустое или отсутствующее company — не спам', () => {
  assert.equal(isSpam({}), false)
  assert.equal(isSpam({ company: '' }), false)
  assert.equal(isSpam({ company: '   ' }), false)
})

test('contact обязателен и не может быть пробелами', () => {
  assert.equal(hasContact({ contact: '+7 937 483-80-03' }), true)
  assert.equal(hasContact({}), false)
  assert.equal(hasContact({ contact: '' }), false)
  assert.equal(hasContact({ contact: '   ' }), false)
})

test('контакт должен быть осмысленным', () => {
  assert.equal(isPlausibleContact('+7 937 483-80-03'), true)
  assert.equal(isPlausibleContact('mail@example.ru'), true)
  assert.equal(isPlausibleContact('@ivan'), true)
  assert.equal(isPlausibleContact('--'), false)
  assert.equal(isPlausibleContact('a'), false)
})

test('файлы: допустимые расширения проходят независимо от регистра', () => {
  assert.deepEqual(checkAttachment('maket.dxf', 1024, 0), { ok: true })
  assert.deepEqual(checkAttachment('LOGO.SVG', 1024, 0), { ok: true })
  assert.deepEqual(checkAttachment('фото.JPG', 1024, 0), { ok: true })
})

test('файлы: недопустимое или отсутствующее расширение — 400', () => {
  for (const name of ['virus.exe', 'script.js', 'noext', 'archive.tar.gz']) {
    const r = checkAttachment(name, 1024, 0)
    assert.equal(r.ok, false)
    if (!r.ok) assert.equal(r.status, 400)
  }
})

test('файлы: двойное расширение оценивается по последнему', () => {
  assert.deepEqual(checkAttachment('maket.exe.pdf', 1024, 0), { ok: true })
  const r = checkAttachment('maket.pdf.exe', 1024, 0)
  assert.equal(r.ok, false)
})

test('файлы: превышение размера одного файла — 413', () => {
  const r = checkAttachment('big.pdf', MAX_FILE_BYTES + 1, 0)
  assert.equal(r.ok, false)
  if (!r.ok) assert.equal(r.status, 413)
  assert.deepEqual(checkAttachment('ok.pdf', MAX_FILE_BYTES, 0), { ok: true })
})

test('файлы: превышение суммарного лимита — 413', () => {
  const r = checkAttachment('another.pdf', 1024, MAX_TOTAL_BYTES - 512)
  assert.equal(r.ok, false)
  if (!r.ok) assert.equal(r.status, 413)
  assert.deepEqual(checkAttachment('fits.pdf', 512, MAX_TOTAL_BYTES - 512), { ok: true })
})

test('escapeHtml экранирует спецсимволы и не трогает обычный текст', () => {
  assert.equal(
    escapeHtml('<img src=x onerror=alert(1)> & "кавычки"'),
    '&lt;img src=x onerror=alert(1)&gt; &amp; &quot;кавычки&quot;',
  )
  assert.equal(escapeHtml('Иван, +7 937 483-80-03'), 'Иван, +7 937 483-80-03')
})
