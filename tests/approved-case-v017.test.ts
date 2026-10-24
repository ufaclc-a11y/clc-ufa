import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import CasePage, { generateMetadata, generateStaticParams } from '../app/cases/[slug]/page'
import { getPublicCase, publicCases } from '../lib/public-cases'
import { cases } from '../data/cases'

const slug = 'company-gift-infinity'

test('approved GS medicine story v004 preserves Claude v002 video, original designer series and other cases', async () => {
  const item = getPublicCase(slug)!
  assert.ok(item)
  assert.equal(publicCases.filter(c => c.id === slug).length, 1)
  assert.deepEqual(publicCases.slice(0, cases.length), cases)
  assert.deepEqual(publicCases.slice(cases.length).map(item => item.id), ['company-gift-infinity', 'murmiau-engraved-tag'])
  assert.equal(item.title, "Корпоративная статуэтка по ИИ-эскизу для GS medicine")
  assert.equal(item.task, "Изготовить корпоративный подарок ко дню рождения GS medicine — статуэтку в форме знака бесконечности. На старте у заказчика была сгенерированная картинка, но не было готового производственного макета.")
  assert.equal(item.solution, "Сначала сделали тёмный пробник. Заказчику он показался унылым, поэтому перешли к светлому оформлению.\n\nМедицинские аппараты выполнили отдельными объёмными элементами. Для них выбрали молочный акрил с УФ-печатью, чтобы торцы оставались светлыми. Логотип и знак бесконечности на табличке оставили плоскими: объёмных элементов уже достаточно на самой статуэтке.\n\nВ центре макета развели пересекавшиеся линии и доработали табличку на основании. Исправленный вариант согласовали с заказчиком.")
  assert.equal(item.result, "Сгенерированную идею воплотили в светлой статуэтке со знаком бесконечности, объёмными изображениями медицинского оборудования и табличкой GS medicine на основании.")
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
  assert.equal(item.images?.length, 5)
  assert.equal(item.video?.src, '/videos/cases/company-gift-infinity/claude-refinement-v002.mp4')
  const assets = [
    [item.video!.src, '5d1ebda5dfb9b4bba6172704d7e20d46ee9bce3dbeaf8419072bb91630f2f765'],
    [item.video!.poster, '75e0d30d29f6c26e6f556ce566653c1e2d029fdbf3e0f9f89eb4657bdf5925ed'],
    ['/images/cases/company-gift-infinity/01-front.jpg', '534d3e682d3dbbc29eb45a229a604aff869832d7484a88bb2c48d8bd259a99bb'],
    ['/images/cases/company-gift-infinity/02-construction.jpg', '27e198adce395f7a9a175b71de65583b5803ada565cf9076181f80c097ef1ac6'],
    ['/images/cases/company-gift-infinity/03-detail.jpg', '0456e1b27b5b0fa4e765a1bb7e055f465467a9b4bcd0940681eb6af45dccb1a9'],
  ]
  for (const [path, hash] of assets) assert.equal(createHash('sha256').update(readFileSync(`public${path}`)).digest('hex'), hash)
  assert.equal(item.qty, '')
  assert.equal(item.deadline, '')
  assert.equal(item.price, '')
})
