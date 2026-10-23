import assert from 'node:assert/strict'
import test from 'node:test'
import { caseContactLinks, caseUrl } from '../lib/case-contact'
import { business } from '../data/contacts'
import { contactContext } from '../lib/contact-events'
import { caseImages } from '../lib/case-presentation'

test('case contacts preserve exact title and canonical URL; MAX unchanged and business phone valid', () => {
  const item = { id: 'future-case', title: 'Фото «кот» & рисунок' }
  const links = caseContactLinks(item)
  for (const label of ['WhatsApp', 'Telegram']) {
    const url = new URL(links.find(link => link.label === label)!.href)
    assert.ok(url.searchParams.get('text')!.includes(item.title))
    assert.ok(url.searchParams.get('text')!.includes(caseUrl(item)))
  }
  assert.equal(links.find(link => link.label === 'MAX')!.href, business.max)
  assert.equal(business.phone, '+79374838003')
  assert.equal(business.phoneDisplay.replace(/[^+\d]/g, ''), business.phone)
  assert.match(links.find(link => link.label === 'Позвонить')!.href, /^tel:\+\d{11}$/)
})

test('case context allows only safe campaign attribution, no arbitrary private query values', () => {
  assert.deepEqual(contactContext('/cases/future-case', '?utm_source=instagram&utm_medium=social&utm_campaign=autumn&text=secret&source=telegram&email=private', 'hero'), {
    case_id: 'future-case', cta_position: 'hero', utm_source: 'instagram', utm_medium: 'social', utm_campaign: 'autumn', source: 'telegram',
  })
  assert.deepEqual(contactContext('/contacts', '?utm_source=secret%40mail.ru', 'invented'), {})
  assert.deepEqual(contactContext('/cases/test', '?utm_source=a%20private%20message', 'final'), { case_id: 'test', cta_position: 'final' })
})

test('gallery sorts only explicit stages, preserves finished sides and unknown order', () => {
  const images = [{ src: 'r', alt: 'result', stage: 'result' as const }, { src: 'b', alt: 'source', stage: 'before' as const }, { src: 'p', alt: 'work', stage: 'process' as const }]
  assert.deepEqual(caseImages(images).map(i => i.src), ['b', 'p', 'r'])
  assert.deepEqual(caseImages([{ src: 'x', alt: 'unknown' }, ...images]).map(i => i.src), ['x', 'r', 'b', 'p'])
  assert.deepEqual(caseImages([images[0], { ...images[0], src: 'r2' }]).map(i => i.src), ['r', 'r2'])
})
