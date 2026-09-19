import { cases as demonstrationCases } from '@/data/cases'
import { contentFactoryCases } from '@/lib/content-factory-cases'

// Approved Content Factory exports replace the demonstration set as soon as
// the first real case is published. All public surfaces use the same source.
export const publicCases = contentFactoryCases.length ? contentFactoryCases : demonstrationCases

export function getPublicCase(slug: string) {
  return publicCases.find(item => item.id === slug)
}
