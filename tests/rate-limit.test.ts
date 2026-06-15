import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rateLimit, clientIp } from '../lib/rate-limit'

test('пропускает запросы в пределах лимита, затем блокирует', () => {
  const key = `test-${Math.random()}`
  for (let i = 0; i < 5; i++) {
    assert.equal(rateLimit(key, 5, 60_000).ok, true, `запрос ${i + 1} должен пройти`)
  }
  const blocked = rateLimit(key, 5, 60_000)
  assert.equal(blocked.ok, false)
  assert.ok(blocked.retryAfter > 0)
})

test('окно сбрасывается по истечении времени', () => {
  const key = `test-${Math.random()}`
  assert.equal(rateLimit(key, 1, 1).ok, true)
  assert.equal(rateLimit(key, 1, 1).ok, false)
  // окно 1 мс — ждём и проверяем сброс
  const start = Date.now()
  while (Date.now() - start < 5) { /* busy-wait 5ms */ }
  assert.equal(rateLimit(key, 1, 1).ok, true)
})

test('ключи лимитируются независимо', () => {
  const a = `a-${Math.random()}`
  const b = `b-${Math.random()}`
  assert.equal(rateLimit(a, 1, 60_000).ok, true)
  assert.equal(rateLimit(a, 1, 60_000).ok, false)
  assert.equal(rateLimit(b, 1, 60_000).ok, true) // другой ключ не затронут
})

test('clientIp берёт первый IP из X-Forwarded-For', () => {
  const req = new Request('http://x', { headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' } })
  assert.equal(clientIp(req), '203.0.113.7')
})

test('clientIp возвращает unknown без заголовков', () => {
  assert.equal(clientIp(new Request('http://x')), 'unknown')
})
