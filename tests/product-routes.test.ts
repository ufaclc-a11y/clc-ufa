import { test } from 'node:test'
import assert from 'node:assert/strict'
import { products } from '../data/products'
import { services } from '../data/services'

test('адреса заказных изделий состоят только из безопасного ASCII', () => {
  for (const product of products) {
    assert.match(product.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `небезопасный id товара: ${product.id}`)
  }
})

test('ссылки услуг на заказные изделия ведут на существующие страницы', () => {
  const known = new Set(products.map(product => `/products/${product.id}`))
  for (const service of services) {
    for (const href of Object.values(service.useCaseLinks ?? {}).filter(href => href.startsWith('/products/'))) {
      assert.ok(known.has(href), `битая ссылка ${href} в услуге ${service.slug}`)
    }
  }
})
