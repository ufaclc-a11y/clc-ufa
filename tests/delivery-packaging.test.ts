import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildParcel } from '../lib/delivery/packaging'
import { shopItems } from '../data/shop'

const complete = shopItems.filter(i =>
  typeof i.packaging?.weightGrams  === 'number' &&
  typeof i.packaging?.packLengthCm === 'number' &&
  typeof i.packaging?.packWidthCm  === 'number' &&
  typeof i.packaging?.packHeightCm === 'number')

const incomplete = shopItems.find(i => typeof i.packaging?.weightGrams !== 'number')

const a = complete[0]

test('вес умножается на количество', () => {
  const r = buildParcel([{ id: a.id, qty: 3 }])
  assert.ok(r.ok)
  assert.equal(r.parcel.weightGrams, a.packaging!.weightGrams! * 3)
})

test('товары складываются стопкой: высоты суммируются, длина и ширина — максимум', () => {
  const b = complete.find(i => i.id !== a.id)!
  const r = buildParcel([{ id: a.id, qty: 1 }, { id: b.id, qty: 2 }])
  assert.ok(r.ok)

  const pa = a.packaging!, pb = b.packaging!
  assert.equal(r.parcel.lengthCm, Math.max(pa.packLengthCm!, pb.packLengthCm!))
  assert.equal(r.parcel.widthCm,  Math.max(pa.packWidthCm!,  pb.packWidthCm!))
  assert.equal(r.parcel.heightCm, Math.ceil(pa.packHeightCm! + pb.packHeightCm! * 2))
})

test('габариты целые и не нулевые — иначе СДЭК отвергает посылку', () => {
  for (const item of complete.slice(0, 10)) {
    const r = buildParcel([{ id: item.id, qty: 1 }])
    assert.ok(r.ok)
    for (const v of [r.parcel.lengthCm, r.parcel.widthCm, r.parcel.heightCm]) {
      assert.ok(Number.isInteger(v) && v >= 1, `габарит ${v} недопустим`)
    }
  }
})

test('без габаритов расчёт не выдумывается', () => {
  if (!incomplete) return
  const r = buildParcel([{ id: incomplete.id, qty: 1 }])
  assert.equal(r.ok, false)
  if (!r.ok) {
    assert.equal(r.reason, 'no-dimensions')
    assert.ok(r.missing?.includes(incomplete.title))
  }
})

test('одна позиция без габаритов ломает весь расчёт, а не молча выпадает', () => {
  if (!incomplete) return
  const r = buildParcel([{ id: a.id, qty: 1 }, { id: incomplete.id, qty: 1 }])
  assert.equal(r.ok, false, 'иначе покупатель увидел бы заниженную стоимость доставки')
})

test('пустой список и неизвестный товар отклоняются', () => {
  assert.equal(buildParcel([]).ok, false)
  const r = buildParcel([{ id: 1, qty: 1 }])
  assert.equal(r.ok, false)
  if (!r.ok) assert.equal(r.reason, 'unknown-item')
})
