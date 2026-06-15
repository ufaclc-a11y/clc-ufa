import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseWbImageUrl } from '../lib/wb-cdn'

test('принимает легитимный URL CDN Wildberries', () => {
  const u = parseWbImageUrl('https://basket-12.wbbasket.ru/vol1/part1/1/images/big/1.webp')
  assert.ok(u)
  assert.equal(u.hostname, 'basket-12.wbbasket.ru')
})

test('отклоняет хост-самозванец (SSRF)', () => {
  assert.equal(parseWbImageUrl('https://basket-evil.attacker.com/x.png'), null)
  assert.equal(parseWbImageUrl('https://basket-12.wbbasket.ru.attacker.com/x'), null)
  assert.equal(parseWbImageUrl('https://attacker.com/basket-12.wbbasket.ru'), null)
})

test('отклоняет не-https и внутренние адреса', () => {
  assert.equal(parseWbImageUrl('http://basket-12.wbbasket.ru/x'), null)
  assert.equal(parseWbImageUrl('https://localhost/x'), null)
  assert.equal(parseWbImageUrl('https://169.254.169.254/latest/meta-data'), null)
  assert.equal(parseWbImageUrl('file:///etc/passwd'), null)
})

test('отклоняет пустые/битые значения', () => {
  assert.equal(parseWbImageUrl(null), null)
  assert.equal(parseWbImageUrl(undefined), null)
  assert.equal(parseWbImageUrl(''), null)
  assert.equal(parseWbImageUrl('not a url'), null)
})
