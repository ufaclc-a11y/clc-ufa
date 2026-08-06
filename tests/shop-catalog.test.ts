import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shopItems, shopCategories } from '../data/shop'
import { shopDescriptions } from '../data/shop-descriptions.generated'

/** Сегменты внутри /shop, занятые служебными страницами: slug их занимать не должен. */
const RESERVED = ['cart', 'checkout', 'order', 'search', 'thanks']

/**
 * Товары, у которых габариты/вес не заполнены в самих карточках на Wildberries.
 * Список фиксируем, чтобы пробелы не расползались молча: заполните карточку на
 * WB, перезапустите npm run gen:wb-dimensions и уберите id отсюда.
 */
const KNOWN_INCOMPLETE_PACKAGING = new Set([
  963848845, 592856777, 567285841, 541345760, // алтари
  200084636, 155757277, 146375573, 146373712, // алтари
  159057738,                                   // руны
  146469601, 147753967,                        // заготовки
  874246986, 376412948,                        // нет габаритов, вес есть
  365052748,                                   // есть габариты, нет веса
])

/** Значения, встречающиеся больше одного раза (без Set — цель TS не даёт его итерировать). */
function duplicates(values: string[]): string[] {
  const repeated = values.filter((v, i) => values.indexOf(v) !== i)
  return repeated.filter((v, i) => repeated.indexOf(v) === i)
}

test('slug уникальны', () => {
  const slugs = shopItems.map(i => i.slug)
  assert.deepEqual(duplicates(slugs), [], 'найдены одинаковые slug')
  assert.equal(new Set(slugs).size, shopItems.length)
})

test('slug пригоден для URL', () => {
  for (const item of shopItems) {
    assert.match(
      item.slug,
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      `slug «${item.slug}» (id ${item.id}) содержит недопустимые символы, двойной дефис или дефис по краям`,
    )
  }
})

test('slug не занимает служебные адреса /shop', () => {
  for (const item of shopItems) {
    assert.ok(!RESERVED.includes(item.slug), `slug «${item.slug}» конфликтует со служебной страницей`)
  }
})

test('артикулы (sku) уникальны и непустые', () => {
  for (const item of shopItems) {
    assert.ok(item.sku.trim().length > 0, `пустой sku у товара ${item.id}`)
    assert.equal(item.sku, item.sku.trim(), `sku «${item.sku}» с лишними пробелами по краям`)
  }
  assert.deepEqual(duplicates(shopItems.map(i => i.sku)), [], 'найдены одинаковые sku')
})

test('у каждого товара есть полное описание', () => {
  for (const item of shopItems) {
    const text = shopDescriptions[item.id]
    assert.ok(text && text.length > 0, `нет полного описания для ${item.id} «${item.title}»`)
  }
})

test('категория товара существует в справочнике', () => {
  const known = new Set(shopCategories.map(c => c.id))
  for (const item of shopItems) {
    assert.ok(known.has(item.category), `неизвестная категория «${item.category}» у товара ${item.id}`)
  }
})

test('заполненные габариты и вес — положительные числа', () => {
  for (const item of shopItems) {
    const p = item.packaging
    if (!p) continue
    for (const [key, value] of Object.entries(p)) {
      if (key === 'wbSlug' || value === undefined) continue
      assert.ok(
        typeof value === 'number' && value > 0,
        `${key} = ${value} у товара ${item.id} — ожидалось положительное число`,
      )
    }
  }
})

test('габариты и вес заполнены у всех товаров, кроме известных пробелов', () => {
  const missing: string[] = []
  for (const item of shopItems) {
    if (KNOWN_INCOMPLETE_PACKAGING.has(item.id)) continue
    const p = item.packaging
    const complete = p?.packLengthCm && p?.packWidthCm && p?.packHeightCm && p?.weightGrams
    if (!complete) missing.push(`${item.id} «${item.title}»`)
  }
  assert.deepEqual(missing, [], 'без габаритов/веса — расчёт доставки по ним не сработает')
})
