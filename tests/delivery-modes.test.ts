import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pickupModes, doorModes, matchesDestination } from '../lib/delivery/cdek'

/*
 * Значения delivery_mode сверены с живым ответом API СДЭК:
 *   1 дверь-дверь      2 дверь-склад     3 склад-дверь     4 склад-склад
 *   6 дверь-постамат   7 склад-постамат  8 постамат-дверь  9 постамат-склад
 *   10 постамат-постамат
 */

test('в пункт выдачи попадают только режимы с назначением склад/постамат', () => {
  for (const mode of [2, 4, 6, 7]) {
    assert.equal(matchesDestination(mode, 'pickup'), true, `режим ${mode} должен подходить для ПВЗ`)
  }
  for (const mode of [1, 3, 8]) {
    assert.equal(matchesDestination(mode, 'pickup'), false, `режим ${mode} везёт до двери, не в ПВЗ`)
  }
})

test('до двери попадают только режимы с назначением дверь', () => {
  for (const mode of [1, 3]) {
    assert.equal(matchesDestination(mode, 'door'), true)
  }
  for (const mode of [2, 4, 6, 7]) {
    assert.equal(matchesDestination(mode, 'door'), false, `режим ${mode} везёт в ПВЗ, не до двери`)
  }
})

test('отправка из постамата не предлагается — мы шлём из мастерской', () => {
  for (const mode of [8, 9, 10]) {
    assert.equal(matchesDestination(mode, 'pickup'), false)
    assert.equal(matchesDestination(mode, 'door'), false)
  }
})

test('без указания направления фильтр не применяется', () => {
  for (const mode of [1, 2, 3, 4, 6, 7, 8, 9, 10]) {
    assert.equal(matchesDestination(mode, undefined), true)
  }
})

test('неизвестный режим отсекается, когда направление задано', () => {
  assert.equal(matchesDestination(null, 'pickup'), false)
  assert.equal(matchesDestination(999, 'pickup'), false)
  assert.equal(matchesDestination(null, undefined), true)
})

test('наборы режимов не пересекаются', () => {
  // Без итерации по Set — цель TS в проекте её не допускает.
  for (const mode of [2, 4, 6, 7]) {
    assert.ok(pickupModes.has(mode) && !doorModes.has(mode),
      `режим ${mode} не может быть одновременно в ПВЗ и до двери`)
  }
  assert.equal(pickupModes.size, 4)
  assert.equal(doorModes.size, 2)
})
