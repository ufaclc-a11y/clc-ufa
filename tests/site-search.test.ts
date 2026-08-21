import { test } from 'node:test'
import assert from 'node:assert/strict'
import { searchSite } from '../lib/site-search'

test('глобальный поиск находит товар магазина', () => {
  const results = searchSite('декоративный серф')
  assert.ok(results.some(result => result.type === 'shop' && result.href.startsWith('/shop/')))
})

test('глобальный поиск ограничивает выдачу', () => {
  assert.ok(searchSite('а', 3).length <= 3)
})

test('пустой запрос не возвращает весь каталог', () => {
  assert.deepEqual(searchSite('   '), [])
})
