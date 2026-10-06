import { business } from '../data/contacts'

/** Только контакты мастерской, без ссылок на каналы, карты и чужие номера. */
export function contactGoal(href: string): string | undefined {
  if (href === `tel:${business.phone}` || href === `tel:${business.founder.phone}`) return 'contact_phone'
  if (href === `mailto:${business.email}` || href.startsWith(`mailto:${business.email}?`)) return 'contact_email'
  try {
    const url = new URL(href)
    if (url.protocol !== 'https:') return
    if (url.hostname === 'wa.me' && url.pathname === '/79374838003') return 'contact_whatsapp'
    const telegram = new URL(business.telegram)
    if (url.hostname === telegram.hostname && url.pathname === telegram.pathname) return 'contact_telegram'
    const max = new URL(business.max)
    if (url.hostname === max.hostname && url.pathname === max.pathname) return 'contact_max'
  } catch { /* Внутренние и некорректные ссылки не являются контактами. */ }
}
