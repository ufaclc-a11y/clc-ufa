import type { Case } from '../data/cases'
import { services } from '../data/services'
import { products } from '../data/products'
import { allowedCaseServicePaths, caseServiceLinks } from './case-service-links.mjs'

function terms(text: string) {
  return new Set((text.toLowerCase().match(/[а-яёa-z]{5,}/g) ?? [])
    .filter(word => !['изделие', 'заказчик', 'клиентка', 'готового', 'которую'].includes(word))
    .map(word => word.slice(0, 5)))
}

export function relatedCaseLinks(item: Case, examples: Case[]) {
  if (item.presentation === 'product-first') {
    const curated = allowedCaseServicePaths(item.serviceLinks).map(href => caseServiceLinks.find(link => link.href === href)!)
    const taxonomy = item.classification
    if (!taxonomy) return curated
    const technologies = taxonomy.technologies ?? (taxonomy.technology ? [taxonomy.technology] : [])
    if (!Array.isArray(technologies) || technologies.some(t => !['engraving', 'laser-cutting', 'milling', 'uv-printing'].includes(t))) return curated
    const routes: Record<string, string> = { 'laser-cutting': 'lazernaya-rezka', milling: 'frezernaya-rezka-chpu', 'uv-printing': 'uf-pechat' }
    const slugs = technologies.map(technology => technology === 'engraving' ? (taxonomy.material === 'metal' ? 'gravirovka-na-metalle' : taxonomy.material ? 'gravirovka-na-nemetalah' : '') : routes[technology]).filter(Boolean)
    const catalog = [
      ...services.filter(service => slugs.includes(service.slug)).map(service => ({ href: `/services/${service.slug}`, title: service.title })),
      ...products.filter(product => taxonomy.type === 'tag' && product.id === 'zhetony').map(product => ({ href: `/products/${product.id}`, title: product.title })),
    ]
    return [...curated, ...catalog, ...(item.autoRelatedCases === false ? [] : examples).filter(example => example.id !== item.id && example.classification
      && taxonomy.material && taxonomy.type && technologies.length > 0
      && new Set(example.classification.technologies ?? [example.classification.technology]).size === new Set(technologies).size
      && technologies.every(t => (example.classification!.technologies ?? [example.classification!.technology]).includes(t))
      && example.classification.material === taxonomy.material
      && example.classification.type === taxonomy.type)
      .slice(0, 2).map(example => ({ href: `/cases/${example.id}`, title: example.title }))]
      .filter((link, index, all) => all.findIndex(other => other.href === link.href) === index)
  }
  // Услуги и товары: ищем по названию, задаче, тегам и по описанию изготовления (материал, технология), чтобы кейс вёл на нужную услугу.
  const source = terms([item.title, item.task, item.solution, item.approvedDetails, ...item.tags].filter(Boolean).join(' '))
  const score = (text: string) => [...terms(text)].filter(term => source.has(term)).length
  const catalog = [
    ...services.map(service => ({ href: `/services/${service.slug}`, title: service.title })),
    ...products.map(product => ({ href: `/products/${product.id}`, title: product.title })),
  ].map(link => ({ ...link, score: score(link.title) }))
    .filter(link => link.score >= Math.min(2, terms(link.title).size) && link.score > 0)
    .sort((a, b) => b.score - a.score).slice(0, 4)
  // Похожие кейсы по убыванию важности: то же изделие (название) → та же потребность (задача) → тот же материал и технология.
  const overlap = (a: string, b: string) => { const other = terms(b); return [...terms(a)].filter(term => other.has(term)).length }
  const related = (item.autoRelatedCases === false ? [] : examples).filter(example => example.id !== item.id)
    .map(example => ({
      href: `/cases/${example.id}`, title: example.title,
      score: 4 * overlap(item.title, example.title) + 2 * overlap([item.task, ...item.tags].join(' '), [example.task, ...example.tags].join(' '))
        + overlap([item.solution, item.approvedDetails].filter(Boolean).join(' '), [example.solution, example.approvedDetails].filter(Boolean).join(' ')),
    }))
    .filter(link => link.score >= 4).sort((a, b) => b.score - a.score).slice(0, 2)
  return [...catalog, ...related].filter((link, index, all) => all.findIndex(other => other.href === link.href) === index)
}
