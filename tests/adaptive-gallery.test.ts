import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProductCaseGallery } from '../components/ProductCaseGallery'
import type { CaseImage } from '../data/cases'

const input: CaseImage[] = [
  { src: '/front.jpg', alt: 'Готовая статуэтка целиком', stage: 'result', width: 600, height: 1200, label: 'Готовое изделие' },
  { src: '/reference.jpg', alt: 'Изображение-идея, сгенерированное заказчиком', stage: 'before', label: 'ИИ-референс' },
  { src: '/prototype.jpg', alt: 'Тёмный пробник', stage: 'process', label: 'Пробник' },
  { src: '/detail.jpg', alt: 'Табличка готового изделия', stage: 'result', label: 'Деталь' },
]

test('actual gallery retains finished/reference/prototype/detail order and honest explicit labels', () => {
  const html = renderToStaticMarkup(createElement(ProductCaseGallery, { images: [...input, input[0]] }))
  const labels = [...html.matchAll(/<button[^>]*>([^<]+)<\/button>/g)].map(m => m[1])
  assert.deepEqual(labels, ['Готовое изделие', 'ИИ-референс', 'Пробник', 'Деталь'])
  assert.doesNotMatch(html, /Оборот|Лицевая сторона/)
  assert.equal((html.match(/aria-pressed=/g) ?? []).length, 4)
  assert.match(html, /object-contain/)
  assert.match(html, /aspect-ratio:600 \/ 1200/)
  assert.match(html, /min-h-11 min-w-11/)
})

test('only first finished image is promoted; unlabelled stage defaults do not invent a camera angle', () => {
  const images = [input[1], input[0], input[2], input[3]].map(photo => ({ ...photo, label: undefined }))
  const html = renderToStaticMarkup(createElement(ProductCaseGallery, { images }))
  assert.match(html, /alt="Готовая статуэтка целиком"/)
  const labels = [...html.matchAll(/<button[^>]*>([^<]+)<\/button>/g)].map(m => m[1])
  assert.deepEqual(labels, ['Фото 1', 'Исходный материал', 'В процессе', 'Фото 4'])
})


test('adaptive portrait reserves a full-width containing box rather than shrinking it to the image ratio', () => {
  const html = renderToStaticMarkup(createElement(ProductCaseGallery, { images: input, compact: true }))
  assert.match(html, /class="relative w-full max-h-\[21vh\]/)
})
