import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildOrder, deliveryDestinationError, orderNumber, isDeliveryMethod, MAX_LINE_QTY } from '../lib/shop-order'
import { shopItems } from '../data/shop'

const inStock = shopItems.filter(i => i.inStock)
const a = inStock[0]
const b = inStock[1]

test('собирает заказ и считает сумму по каталогу', () => {
  const r = buildOrder([{ id: a.id, qty: 2 }, { id: b.id, qty: 1 }])
  assert.ok(r.ok)
  assert.equal(r.order.lines.length, 2)
  assert.equal(r.order.count, 3)
  assert.equal(r.order.total, a.price * 2 + b.price)
})

test('цена берётся из каталога, а не из запроса', () => {
  // Клиент пытается подсунуть свою цену — она должна быть проигнорирована.
  const r = buildOrder([{ id: a.id, qty: 1, price: 1, sum: 1, title: 'Взлом' }])
  assert.ok(r.ok)
  assert.equal(r.order.lines[0].price, a.price)
  assert.equal(r.order.total, a.price)
  assert.equal(r.order.lines[0].title, a.title)
})

test('повторяющиеся позиции складываются в одну строку', () => {
  const r = buildOrder([{ id: a.id, qty: 2 }, { id: a.id, qty: 3 }])
  assert.ok(r.ok)
  assert.equal(r.order.lines.length, 1)
  assert.equal(r.order.lines[0].qty, 5)
  assert.equal(r.order.total, a.price * 5)
})

test('пустая корзина и мусор отклоняются', () => {
  for (const bad of [[], null, undefined, 'нет', {}, [null], [{}], [{ id: 'x', qty: 1 }]]) {
    const r = buildOrder(bad)
    assert.equal(r.ok, false, `должно быть отклонено: ${JSON.stringify(bad)}`)
  }
})

test('некорректное количество отклоняется', () => {
  for (const qty of [0, -1, 1.5, MAX_LINE_QTY + 1, '2', NaN]) {
    const r = buildOrder([{ id: a.id, qty }])
    assert.equal(r.ok, false, `должно быть отклонено количество: ${String(qty)}`)
  }
})

test('сумма количеств одного товара тоже ограничена', () => {
  const r = buildOrder([{ id: a.id, qty: 60 }, { id: a.id, qty: 60 }])
  assert.equal(r.ok, false)
})

test('несуществующий товар отклоняется', () => {
  const r = buildOrder([{ id: 1, qty: 1 }])
  assert.equal(r.ok, false)
})

test('слишком много позиций отклоняется', () => {
  const many = Array.from({ length: 51 }, () => ({ id: a.id, qty: 1 }))
  assert.equal(buildOrder(many).ok, false)
})

test('вес считается, когда он известен у всех позиций', () => {
  const withWeight = inStock.filter(i => typeof i.packaging?.weightGrams === 'number')
  const r = buildOrder([{ id: withWeight[0].id, qty: 2 }])
  assert.ok(r.ok)
  assert.equal(r.order.weightGrams, withWeight[0].packaging!.weightGrams! * 2)

  const noWeight = inStock.find(i => typeof i.packaging?.weightGrams !== 'number')
  if (noWeight) {
    const r2 = buildOrder([{ id: noWeight.id, qty: 1 }])
    assert.ok(r2.ok)
    assert.equal(r2.order.weightGrams, null, 'вес неизвестен — должен быть null, а не заниженная сумма')
  }
})

test('номер заказа имеет ожидаемый вид', () => {
  assert.match(orderNumber(new Date('2026-08-07T10:00:00Z')), /^260807-[A-Z0-9]{4}$/)
})

test('способ получения проверяется по списку', () => {
  assert.equal(isDeliveryMethod('pickup'), true)
  assert.equal(isDeliveryMethod('cdek'), true)
  assert.equal(isDeliveryMethod('телепорт'), false)
  assert.equal(isDeliveryMethod(null), false)
  assert.equal(isDeliveryMethod('constructor'), false)
})

test('доставка требует город и реальный адрес назначения', () => {
  assert.equal(deliveryDestinationError({ delivery: 'pickup', city: '', address: '', pointAddress: '' }), null)
  assert.equal(deliveryDestinationError({ delivery: 'cdek', city: '', address: '', pointAddress: '' }), 'Укажите город доставки')
  assert.equal(deliveryDestinationError({ delivery: 'ozon', city: 'Уфа', address: '', pointAddress: '' }), 'Выберите пункт выдачи или укажите его адрес')
  assert.equal(deliveryDestinationError({ delivery: 'ozon', city: 'Уфа', address: '', pointAddress: 'ПВЗ' }), null)
  assert.equal(deliveryDestinationError({ delivery: 'russian', city: 'Уфа', address: '', pointAddress: 'ОПС' }), 'Укажите адрес доставки')
  assert.equal(deliveryDestinationError({ delivery: 'russian', city: 'Уфа', address: 'Ленина, 1', pointAddress: '' }), null)
})
