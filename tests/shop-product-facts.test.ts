import { test } from 'node:test'
import assert from 'node:assert/strict'
import { descriptionAfterLead, getProductFacts } from '../lib/shop-product-facts'

test('характеристики изделия не смешиваются с габаритами упаковки', () => {
  const facts = getProductFacts({
    title: 'Декоративный серф 75х23,5х0,6 см',
    description: 'Панно из фанеры крепится на клейкую ленту. В комплекте 2 крепления.',
    category: 'Декорации настенные',
    sku: 'surf-1',
  })

  assert.deepEqual(facts, [
    { label: 'Размер изделия', value: '75 × 23.5 × 0.6 см' },
    { label: 'Материал', value: 'Фанера' },
    { label: 'Крепление', value: 'Клейкая лента' },
    { label: 'Комплектация', value: '2 крепления' },
    { label: 'Категория', value: 'Декорации настенные' },
    { label: 'Артикул', value: 'surf-1' },
  ])
  assert.equal(facts.some(fact => /упаков/i.test(fact.label)), false)
})

test('не добавляет сведения, которых нет в названии и описании', () => {
  const facts = getProductFacts({
    title: 'Декоративное панно',
    description: 'Яркий акцент для интерьера.',
    category: 'Декор',
    sku: 'decor-1',
  })

  assert.deepEqual(facts, [
    { label: 'Категория', value: 'Декор' },
    { label: 'Артикул', value: 'decor-1' },
  ])
})

test('полное описание не повторяет уже показанный первый абзац', () => {
  assert.equal(descriptionAfterLead('Короткий лид.\n\nПодробности.\n\nЕщё абзац.'), 'Подробности.\n\nЕщё абзац.')
  assert.equal(descriptionAfterLead('Единственный абзац.'), 'Единственный абзац.')
})
