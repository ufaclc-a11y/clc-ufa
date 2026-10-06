import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contactGoal } from '../lib/contact-events'
import { business } from '../data/contacts'

test('contact goals identify the workshop links with prefilled text', () => {
  assert.equal(contactGoal(business.whatsapp), 'contact_whatsapp')
  assert.equal(contactGoal(`${business.telegram}?text=hello`), 'contact_telegram')
  assert.equal(contactGoal(`${business.max}?text=hello`), 'contact_max')
  assert.equal(contactGoal(`tel:${business.phone}`), 'contact_phone')
  assert.equal(contactGoal(`mailto:${business.email}?subject=order`), 'contact_email')
})

test('social channels, other recipients and internal links are not contact leads', () => {
  for (const href of [business.telegramChannel, business.vk, business.yandexMaps,
    'https://wa.me/79000000000', 'https://t.me/someone', 'https://max.ru/u/someone',
    'https://wa.me.evil.example/79374838003', 'tel:+79000000000', '/calculator', '#calc', '']) {
    assert.equal(contactGoal(href), undefined, href)
  }
})
