import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hydrateCart } from '../lib/cart'
import { shopItems } from '../data/shop'

test('подробности корзины подключаются только для существующих товаров', () => {
  const item = shopItems[0]
  const entries = hydrateCart([
    { id: item.id, qty: 2 },
    { id: -1, qty: 99 },
  ], shopItems)

  assert.equal(entries.length, 1)
  assert.equal(entries[0].item.id, item.id)
  assert.equal(entries[0].sum, item.price * 2)
})
