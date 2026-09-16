import type { Case } from '@/data/cases'
import generated from '@/content/content-factory-cases.json'

export type ContentFactoryCase = Case & {
  contentFactory: {
    schemaVersion: 'content-factory.website-case.v1'
    packId: string
    packVersion: number
    approvalHash: string
    payloadHash: string
    importedAt: string
  }
}

export const contentFactoryCases = generated as ContentFactoryCase[]
