import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import { createElement } from 'react'
import { execFileSync } from 'node:child_process'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProductFocusedCase } from '../components/ProductFocusedCase'
import { ProductCaseGallery } from '../components/ProductCaseGallery'
import { getPublicCase } from '../lib/public-cases'
const previous = JSON.parse(execFileSync('git', ['show', '5c65c9c6c55916c1fb0c1ea309ebc27fd83c78e1:content/content-factory-cases.json'], { encoding: 'utf8' }))

test('GS mobile story trims approximately 30 percent without dropping supported decisions', () => {
  const gs = getPublicCase('company-gift-infinity')!
  const old = previous.find((x: { id: string }) => x.id === gs.id)
  const ratio = gs.solution.length / old.solution.length
  assert.ok(ratio >= 0.65 && ratio <= 0.75, `retained ratio ${ratio}`)
  for (const pattern of [/Тёмный пробник/, /заказчик.*унылым/, /светлое оформление/, /объёмными накладками/, /молочного акрила/, /УФ-печатью/, /светлыми торцами/, /Логотип и знак бесконечности/, /плоскими/, /не перегрузить/, /пересечения линий/, /табличку основания/, /согласовали макет/]) assert.match(gs.solution, pattern)
  assert.equal(gs.summary, '')
  const html = renderToStaticMarkup(ProductFocusedCase({ item: gs }))
  assert.ok(!html.includes(old.summary))
})

test('GS gallery gives source to sample to final controls with final product selected by default', () => {
  const gs = getPublicCase('company-gift-infinity')!
  assert.equal(gs.gallerySequence, true)
  const html = renderToStaticMarkup(createElement(ProductCaseGallery, { images: gs.images!, sequence: true }))
  const labels = ['1. ИИ-эскиз', '2. Образец', '3. Финал', 'Объём', 'Деталь']
  let position = -1
  for (const label of labels) { const next = html.indexOf(`>${label}</button>`); assert.ok(next > position); position = next }
  assert.match(html, /aria-label="Показать фото 3 из 5" aria-pressed="true"/)
  assert.ok(html.includes(gs.imageAlt))
  assert.deepEqual(gs.images!.map(i => i.src).sort(), previous[0].images.map((i: { src: string }) => i.src).sort())
})

test('GS video has a useful caption, compact linked credits and no technical processing dump', () => {
  const gs = getPublicCase('company-gift-infinity')!
  const html = renderToStaticMarkup(ProductFocusedCase({ item: gs }))
  assert.match(html, /Готовая статуэтка крупным планом: объёмные детали и оформление основания\./)
  assert.doesNotMatch(html, /плавное появление|затухание|понижен уровень|приглушается под речь|Нужен подарок компании/)
  assert.match(html, /Музыка и лицензия/)
  assert.match(html, /Dream Culture/)
  assert.match(html, /Kevin MacLeod/)
  assert.match(html, /href="https:\/\/creativecommons.org\/licenses\/by\/4.0\/"/)
  assert.match(html, /Источник музыки/)
  assert.match(html, /Использован фрагмент/)
  assert.equal(gs.video!.src, previous[0].video.src)
  assert.equal(gs.video!.poster, previous[0].video.poster)
})

test('all other imported records including accepted murmiau remain exactly unchanged', () => {
  const records = JSON.parse(fs.readFileSync('content/content-factory-cases.json', 'utf8'))
  assert.deepEqual(records.slice(1), previous.slice(1))
  const mur = getPublicCase('murmiau-engraved-tag')!
  const rendered = renderToStaticMarkup(ProductFocusedCase({ item: mur }))
  assert.ok(rendered.includes(mur.summary!))
  assert.doesNotMatch(rendered, /Музыка и лицензия|1\. ИИ-эскиз/)
})
