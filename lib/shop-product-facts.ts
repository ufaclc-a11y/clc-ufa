export type ProductFact = {
  label: string
  value: string
}

const dimensionPattern = /(\d+(?:[.,]\d+)?(?:\s*[xх×]\s*\d+(?:[.,]\d+)?){1,2})\s*см(?:\s|$|[.,;:])/i

function sentenceCase(value: string) {
  const clean = value.trim().replace(/\s+/g, ' ')
  return clean ? clean[0].toUpperCase() + clean.slice(1) : clean
}

function dimensions(title: string, description: string) {
  const match = title.match(dimensionPattern) ?? description.match(dimensionPattern)
  if (!match) return null
  return `${match[1].replace(/\s*[xх×]\s*/gi, ' × ').replaceAll(',', '.')} см`
}

function material(title: string, description: string) {
  const source = `${title} ${description.slice(0, 800)}`
  const materials: string[] = []

  if (/оргстекл|акрил/i.test(source)) materials.push('Акрил / оргстекло')
  if (/\bмдф\b/i.test(source)) materials.push('МДФ')
  if (/фанер/i.test(source)) materials.push('Фанера')
  if (/бер[её]з/i.test(source) && !materials.includes('Фанера')) materials.push('Берёза')
  if (/деревян/i.test(source) && materials.length === 0) materials.push('Дерево')

  return materials.length ? materials.join(', ') : null
}

function mounting(title: string, description: string) {
  const source = `${title} ${description.slice(0, 1200)}`
  const variants: string[] = []
  if (/на присосках/i.test(source)) variants.push('Присоски')
  if (/клейк[а-яё]*\s+лент/i.test(source)) variants.push('Клейкая лента')
  if (/дюбел/i.test(source)) variants.push('Дюбель-гвоздь')
  return variants.length ? variants.join(' или ') : null
}

function contents(title: string, description: string) {
  const byTitle = title.match(/\b(\d+)\s*шт\.?\b/i)
  if (byTitle) return `${byTitle[1]} шт.`

  const byCount = description.match(/количеств[оа]\s+(?:детал(?:ей|и)|элемент(?:ов|а))\s*[-—:]?\s*(\d+)/i)
  if (byCount) return `${byCount[1]} деталей`

  const bySet = description.match(/в комплекте\s+([^.!;\n]{1,80})/i)
  return bySet ? sentenceCase(bySet[1]) : null
}

/** Только явно найденные в карточке сведения — без догадок по названию категории. */
export function getProductFacts(input: {
  title: string
  description: string
  category: string
  sku: string
}): ProductFact[] {
  const candidates: Array<ProductFact | null> = [
    dimensions(input.title, input.description)
      ? { label: 'Размер изделия', value: dimensions(input.title, input.description)! }
      : null,
    material(input.title, input.description)
      ? { label: 'Материал', value: material(input.title, input.description)! }
      : null,
    mounting(input.title, input.description)
      ? { label: 'Крепление', value: mounting(input.title, input.description)! }
      : null,
    contents(input.title, input.description)
      ? { label: 'Комплектация', value: contents(input.title, input.description)! }
      : null,
    { label: 'Категория', value: input.category },
    { label: 'Артикул', value: input.sku },
  ]

  return candidates.filter((fact): fact is ProductFact => fact !== null)
}

/** Убирает из полного описания уже показанный вводный абзац. */
export function descriptionAfterLead(full: string) {
  const paragraphs = full.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean)
  return paragraphs.length > 1 ? paragraphs.slice(1).join('\n\n') : full
}
