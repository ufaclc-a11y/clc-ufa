import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductFocusedCase } from '@/components/ProductFocusedCase'
import { getPublicCase } from '@/lib/public-cases'
import { relatedCaseLinks } from '@/lib/case-related'
import type { Case } from '@/data/cases'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { robots: { index: false, follow: false } }

// In-memory browser probes only: never add fixtures to the published case collection.
export default async function CasePreview({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV !== 'development' || process.env.CLC_CASE_PREVIEW !== '1') notFound()
  const { slug } = await params
  const source = getPublicCase('company-gift-infinity')!
  let item: Case
  if (slug === 'gs') item = { ...source, presentation: 'product-first', storyLevel: 'C' }
  else if (slug === 'large') item = {
    ...source,
    id: 'synthetic-large-preview',
    presentation: 'product-first',
    storyLevel: 'C',
    title: 'Синтетический пример: крупное изделие с длинным названием и подробным описанием',
    summary: 'Только проверка адаптивности на существующих изображениях: высокий предмет, длинный заголовок, четыре кнопки галереи и оба способа открыть обсуждение. Это не опубликованный клиентский кейс.',
    task: 'Проверить высокий предмет и длинное название на узком экране.',
    solution: 'Используем тот же принятый компонент без обрезки предмета.',
    production: 'Проверяем переключение фотографий и управление с клавиатуры.',
    result: 'Локальная синтетическая демонстрация интерфейса, не свидетельство изготовления нового заказа.',
    autoRelatedCases: false,
    classification: undefined,
    serviceLinks: ['/services/izgotovlenie-izdelij', '/services/uf-pechat', '/lazernaya-rezka-akrila-ufa', '/suveniry-na-zakaz-ufa'],
    images: [
      { src: '/images/cases/company-gift-infinity/cover-1080x1920.png', alt: 'Тестовый портретный пример', width: 1080, height: 1920, stage: 'result', label: 'Высокое изделие' },
      { src: '/images/cases/company-gift-infinity/01-front.jpg', alt: 'Тест порядка before, не документальный референс', stage: 'before', label: 'Тест before' },
      { src: '/images/cases/company-gift-infinity/02-construction.jpg', alt: 'Тест порядка process, не документальный пробник', stage: 'process', label: 'Тест process' },
      { src: '/images/cases/company-gift-infinity/03-detail.jpg', alt: 'Фотография детали для теста', stage: 'result', label: 'Деталь' },
    ],
  }
  else notFound()
  return <ProductFocusedCase item={item} related={relatedCaseLinks(item, [])} />
}
