import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { JsonLd } from '@/components/JsonLd'
import { selectFaqItems } from '@/data/faq'
import { faqPageLd } from '@/lib/seo'
import { NewHomeHero } from './_components/NewHomeHero'
import { TechnologySection } from './_components/TechnologySection'
import { WorkGallery } from './_components/WorkGallery'
import { BusinessSection } from './_components/BusinessSection'
import { ProcessSection } from './_components/ProcessSection'
import { ReviewSection } from './_components/ReviewSection'
import { NewHomeFaq } from './_components/NewHomeFaq'
import { OrderSection } from './_components/OrderSection'
import { MobileOrderBar } from './_components/MobileOrderBar'
import './new-home.css'

const display = localFont({
  src: '../../assets/fonts/exo-2-400.woff2',
  display: 'swap',
  variable: '--font-clc-display',
})

const body = localFont({
  src: [
    { path: '../../assets/fonts/manrope-400.woff2', weight: '400' },
    { path: '../../assets/fonts/manrope-600.woff2', weight: '600' },
    { path: '../../assets/fonts/manrope-700.woff2', weight: '700' },
    { path: '../../assets/fonts/manrope-800.woff2', weight: '800' },
  ],
  display: 'swap',
  variable: '--font-clc-body',
})

const faqItems = selectFaqItems({ limit: 4 })

const steps = [
  { name: 'Покажите задачу', text: 'Пришлите макет, фотографию, эскиз или опишите будущее изделие.' },
  { name: 'Получите расчёт', text: 'Уточним материал, размер, количество, стоимость и срок изготовления.' },
  { name: 'Согласуйте макет', text: 'Проверим файл или подготовим макет и покажем его до запуска.' },
  { name: 'Заберите заказ', text: 'Изготовим, проверим и подготовим заказ к самовывозу или доставке.' },
]

const howToLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Как заказать изделие в Центре лазерной резки',
  step: steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text,
  })),
}

export const metadata: Metadata = {
  title: 'Новая главная - Центр лазерной резки в Уфе',
  description: 'Предварительная версия главной страницы Центра лазерной резки в Уфе.',
  robots: { index: false, follow: true },
}

export default function NewHomePage() {
  return (
    <div className={`${display.variable} ${body.variable} new-home-surface overflow-hidden bg-[#F3F5F2] text-[#101318]`}>
      <JsonLd data={howToLd} />
      <JsonLd data={faqPageLd(faqItems)} />
      <NewHomeHero />
      <div>
        <TechnologySection />
        <WorkGallery />
        <BusinessSection />
        <ProcessSection steps={steps} />
        <ReviewSection />
        <NewHomeFaq items={faqItems} />
        <OrderSection />
      </div>
      <MobileOrderBar />
    </div>
  )
}
