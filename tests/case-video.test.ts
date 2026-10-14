import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import CasePage from '../app/cases/[slug]/page'
import { publicCases } from '../lib/public-cases'

const video = {
  src: '/videos/cases/company-gift-infinity/video-v017.mp4',
  poster: '/images/cases/company-gift-infinity/cover-1080x1920.png',
  attribution: 'Музыка: Dream Culture — Kevin MacLeod.\nЛицензия: Creative Commons Attribution 4.0 (CC BY 4.0).',
  contactText: 'Нужен подарок компании? Пришлите картинку — обсудим, как воплотить вашу идею.',
}

test('case page renders optional local video, poster, attribution and approved contacts CTA', async () => {
  const item = publicCases[0]
  const extended = Object.assign(item, { video })
  try {
    const html = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug: item.id }) }))
    assert.match(html, /<video[^>]*controls=""/)
    assert.match(html, /playsInline=""/)
    assert.match(html, /preload="metadata"/)
    assert.ok(html.includes(`poster="${video.poster}"`))
    assert.ok(html.includes(`src="${video.src}" type="video/mp4"`))
    assert.match(html, /object-contain/)
    assert.ok(html.includes('Dream Culture — Kevin MacLeod.'))
    assert.ok(html.includes(`href="/contacts"`))
    assert.ok(html.includes(video.contactText))
    assert.doesNotMatch(html, /autoplay|autoPlay/)
  } finally {
    delete (extended as { video?: typeof video }).video
  }
})

test('legacy case without video keeps its gallery and has no video player', async () => {
  const item = publicCases[0]
  const html = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug: item.id }) }))
  assert.doesNotMatch(html, /<video/)
  assert.ok(html.includes('Фотографии проекта'))
  assert.ok(html.includes(item.task))
})
