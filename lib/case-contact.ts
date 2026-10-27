import { business } from '../data/contacts'

export function caseUrl(item: { id: string }) {
  return `https://clc-ufa.ru/cases/${item.id}`
}

export function productCaseMessage(item: { id: string; title: string }) {
  return item.id === 'murmiau-engraved-tag'
    ? `Здравствуйте! Хочу кулон с гравировкой по фото. Подскажите, подойдёт ли моё фото для гравировки. Кейс: «${item.title}»: ${caseUrl(item)}`
    : `Здравствуйте! Хочу рассчитать похожее изделие. Кейс: «${item.title}»: ${caseUrl(item)}`
}

export function caseContactLinks(item: { id: string; title: string }, message = `Здравствуйте! Хочу обсудить похожую задачу. Кейс: «${item.title}». ${caseUrl(item)}`) {
  const whatsapp = new URL(business.whatsapp)
  whatsapp.searchParams.set('text', message)
  const telegram = new URL(business.telegram)
  telegram.searchParams.set('text', message)
  return [
    { label: 'WhatsApp', href: whatsapp.toString() },
    { label: 'Telegram', href: telegram.toString() },
    { label: 'MAX', href: business.max },
    { label: 'Позвонить', href: `tel:${business.phone}` },
  ]
}
