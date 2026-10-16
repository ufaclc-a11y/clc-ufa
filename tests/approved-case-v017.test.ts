import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import CasePage, { generateMetadata, generateStaticParams } from '../app/cases/[slug]/page'
import { getPublicCase, publicCases } from '../lib/public-cases'
import { cases } from '../data/cases'

const slug = 'company-gift-infinity'

test('approved Claude v002 and designer series render approved copy and preserve old cases', async () => {
  const item = getPublicCase(slug)!
  assert.ok(item)
  assert.equal(publicCases.filter(c => c.id === slug).length, 1)
  assert.deepEqual(publicCases.slice(0, cases.length), cases)
  assert.equal(publicCases.length, cases.length + 1)
  assert.equal(item.task, 'Подарок ко дню рождения компании начался со сгенерированной картинки. Готового макета у заказчика ещё не было.')
  assert.equal(item.solution, 'Мы сделали небольшой тёмный пробник. После него заказчик решил поменять оформление: в тёмном варианте подарок смотрелся уныло. Остановились на светлом, доработали макет и подобрали цвет графит на реальной детали.')
  assert.equal(item.result, 'В этом заказе пробник помог определиться с оформлением ещё до изготовления готовой статуэтки. На фото и видео — результат работы Центра лазерной резки.')
  assert.equal(item.video?.contactText, 'Нужен подарок компании? Пришлите картинку — обсудим, как воплотить вашу идею.')
  const html = renderToStaticMarkup(await CasePage({ params: Promise.resolve({ slug }) }))
  for (const paragraph of [item.task, item.solution, item.result, item.video!.contactText]) assert.ok(html.includes(paragraph))
  assert.ok(html.includes('Музыка: Dream Culture — Kevin MacLeod.'))
  assert.ok(html.includes('https://creativecommons.org/licenses/by/4.0/'))
  assert.ok(html.includes('https://incompetech.com/music/royalty-free/index.html?Search=Search&amp;isrc=USUAN1300046'))
  assert.ok(html.includes('Изменения: использован фрагмент; плавное появление и затухание; понижен уровень; музыка приглушается под речь.'))
  const metadata = await generateMetadata({ params: Promise.resolve({ slug }) })
  assert.equal(metadata.alternates?.canonical, `https://clc-ufa.ru/cases/${slug}`)
  assert.ok(generateStaticParams().some(item => item.slug === slug))
  assert.equal(item.client, 'GS medicine')
  assert.equal(item.images?.length, 3)
  assert.equal(item.video?.src, '/videos/cases/company-gift-infinity/claude-refinement-v002.mp4')
  const assets = [
    [item.video!.src, '5d1ebda5dfb9b4bba6172704d7e20d46ee9bce3dbeaf8419072bb91630f2f765'],
    [item.video!.poster, '75e0d30d29f6c26e6f556ce566653c1e2d029fdbf3e0f9f89eb4657bdf5925ed'],
    [item.image, '534d3e682d3dbbc29eb45a229a604aff869832d7484a88bb2c48d8bd259a99bb'],
    [item.images![1].src, '27e198adce395f7a9a175b71de65583b5803ada565cf9076181f80c097ef1ac6'],
    [item.images![2].src, '0456e1b27b5b0fa4e765a1bb7e055f465467a9b4bcd0940681eb6af45dccb1a9'],
  ]
  for (const [path, hash] of assets) assert.equal(createHash('sha256').update(readFileSync(`public${path}`)).digest('hex'), hash)
  assert.equal(item.qty, 'Не указано')
  assert.equal(item.deadline, 'Не указано')
  assert.equal(item.price, 'По запросу')
})
