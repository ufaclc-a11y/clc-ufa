import { publicCases } from '@/lib/public-cases'

export type PortfolioCaseLink = { id: string; title: string }

/**
 * Фото портфолио, которые используются в кейсах: кейс ссылается на файл портфолио (`/images/portfolio/…`), а не хранит копию.
 * Единственный источник связи — поле images[].src кейса: портфолио само узнаёт, к какому кейсу относится фото.
 */
export function portfolioCaseLinks(cases = publicCases): Map<string, PortfolioCaseLink> {
  const links = new Map<string, PortfolioCaseLink>()
  for (const item of cases) {
    const sources = [item.image, ...(item.images ?? []).map(image => image.src)]
    for (const src of sources) if (src?.startsWith('/images/portfolio/') && !links.has(src)) links.set(src, { id: item.id, title: item.title })
  }
  return links
}
