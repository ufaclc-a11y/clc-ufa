import type { Case } from '../data/cases'
import { services } from '../data/services'
import { products } from '../data/products'

function terms(text: string) {
  return new Set((text.toLowerCase().match(/[а-яёa-z]{5,}/g) ?? [])
    .filter(word => !['изделие', 'заказчик', 'клиентка', 'готового', 'которую'].includes(word))
    .map(word => word.slice(0, 5)))
}

export function relatedCaseLinks(item: Case, examples: Case[]) {
  const source = terms([item.title, item.task, ...item.tags].join(' '))
  const score = (text: string) => [...terms(text)].filter(term => source.has(term)).length
  const catalog = [
    ...services.map(service => ({ href: `/services/${service.slug}`, title: service.title })),
    ...products.map(product => ({ href: `/products/${product.id}`, title: product.title })),
  ].map(link => ({ ...link, score: score(link.title) }))
    .filter(link => link.score >= Math.min(2, terms(link.title).size) && link.score > 0)
    .sort((a, b) => b.score - a.score).slice(0, 4)
  const related = examples.filter(example => example.id !== item.id)
    .map(example => ({ href: `/cases/${example.id}`, title: example.title, score: score([example.title, example.task, ...example.tags].join(' ')) }))
    .filter(link => link.score >= 2).sort((a, b) => b.score - a.score).slice(0, 2)
  return [...catalog, ...related].filter((link, index, all) => all.findIndex(other => other.href === link.href) === index)
}
