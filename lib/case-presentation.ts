import type { Case, CaseImage } from '../data/cases'

export function visibleCaseLabel(value?: string): string | undefined {
  const text = value?.trim()
  if (!text || /^(?:не указано|по\s|клиент центра лазерной резки)/i.test(text)) return
  return text
}

export function caseSections(item: Case) {
  if (item.presentation === 'product-first') {
    const seen = new Set([item.summary?.trim()].filter(Boolean))
    const solution = visibleCaseLabel(item.solution) || [...new Set([item.preparation, item.approvedDetails, item.production].map(v => visibleCaseLabel(v)).filter(Boolean))].join(' ')
    return [
      { heading: 'Задача', text: item.task },
      { heading: 'Как сделали', text: solution },
      { heading: 'Результат', text: item.result },
    ].filter((section): section is { heading: string; text: string } => {
      const value = visibleCaseLabel(section.text)
      if (!value || seen.has(value)) return false
      seen.add(value)
      return true
    })
  }
  const structured = [
    { heading: 'Исходные материалы', text: item.sourceMaterials },
    { heading: 'Подготовка', text: item.preparation },
    { heading: 'Что согласовали', text: item.approvedDetails },
    { heading: 'Изготовление', text: item.production },
  ].filter(section => visibleCaseLabel(section.text))
  return [
    { heading: 'Задача', text: item.task },
    ...(structured.length ? structured : [{ heading: 'Решение', text: item.solution }]),
    { heading: 'Результат', text: item.result },
  ].filter((section): section is { heading: string; text: string } => !!visibleCaseLabel(section.text))
}

export function caseFacts(item: Case) {
  return [
    { label: 'Количество', value: item.qty },
    { label: 'Срок', value: item.deadline },
    { label: 'Цена', value: item.price },
  ].filter(fact => visibleCaseLabel(fact.value))
}

export function caseDescription(item: Case): string {
  if (item.seoDescription?.trim()) return item.seoDescription.trim()
  const text = (item.summary || item.task).trim()
  if (text.length <= 155) return text
  const part = text.slice(0, 154)
  const boundary = part.lastIndexOf(' ')
  return `${part.slice(0, boundary > 0 ? boundary : 154).trimEnd()}…`
}

export function caseImages(images: CaseImage[]): CaseImage[] {
  const order = { before: 0, process: 1, result: 2 }
  // Unknown stages keep the accepted order; never infer a stage from position.
  return images.every(image => image.stage)
    ? [...images].sort((a, b) => order[a.stage!] - order[b.stage!]) : images
}
