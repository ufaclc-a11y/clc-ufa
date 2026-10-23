import { business } from '../data/contacts'

/** No full referrer, free-form text, customer details or arbitrary query keys. */
export function contactContext(path: string, search: string, position?: string | null): Record<string, string> {
  const params: Record<string, string> = {}
  const match = path.match(/^\/cases\/([a-z0-9-]+)\/?$/)
  if (match) params.case_id = match[1]
  if (match && (position === 'hero' || position === 'final')) params.cta_position = position
  const query = new URLSearchParams(search)
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'source']) {
    const value = query.get(key)
    if (value && /^[a-zA-Z0-9_-]{1,64}$/.test(value)) params[key] = value
  }
  return params
}

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
