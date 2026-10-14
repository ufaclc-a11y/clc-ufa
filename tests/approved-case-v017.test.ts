import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import CasePage, { generateMetadata, generateStaticParams } from '../app/cases/[slug]/page'
import { getPublicCase, publicCases } from '../lib/public-cases'
import { cases } from '../data/cases'

const slug = 'company-gift-infinity'

test('approved v017 case renders all paragraphs, music credit and real media without changing old cases', async () => {
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
  const assets = [
    [item.video!.src, 'f98e7d50381638da8413ea9f64a8a337894686ef920d5b337290cd2cee024ba8'],
    [item.video!.poster, '1306c463e47fee5c0ea22aa19fbac27c6a440275723ee186b631faa9143c3774'],
    [item.image, '9f9776d4e3adce2019b6bb3da2a7b8320ff9e5691a930ee85a1fa8864aabbcc4'],
  ]
  for (const [path, hash] of assets) assert.equal(createHash('sha256').update(readFileSync(`public${path}`)).digest('hex'), hash)
  assert.equal(item.qty, 'Не указано')
  assert.equal(item.deadline, 'Не указано')
  assert.equal(item.price, 'По запросу')
})
