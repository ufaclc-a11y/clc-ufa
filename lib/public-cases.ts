import { cases as demonstrationCases } from '@/data/cases'
import { contentFactoryCases } from '@/lib/content-factory-cases'

// Append approved cases without removing, reordering or replacing existing cases.
// Canonical IDs remain unique; the first existing entry wins on collision.
export const publicCases = [...demonstrationCases, ...contentFactoryCases]
  .filter((item, index, all) => all.findIndex(existing => existing.id === item.id) === index)

export function getPublicCase(slug: string) {
  return publicCases.find(item => item.id === slug)
}
