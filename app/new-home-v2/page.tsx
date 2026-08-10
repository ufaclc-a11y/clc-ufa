import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { JsonLd } from '@/components/JsonLd'
import { NewHomeV2 } from './_components/NewHomeV2'
import './new-home-v2.css'

const display = localFont({
  src: '../../assets/fonts/oswald-400.woff2',
  display: 'swap',
  variable: '--font-v2-display',
})

const body = localFont({
  src: [
    { path: '../../assets/fonts/manrope-400.woff2', weight: '400' },
    { path: '../../assets/fonts/manrope-500.woff2', weight: '500' },
    { path: '../../assets/fonts/manrope-600.woff2', weight: '600' },
    { path: '../../assets/fonts/manrope-700.woff2', weight: '700' },
    { path: '../../assets/fonts/manrope-800.woff2', weight: '800' },
  ],
  display: 'swap',
  variable: '--font-v2-body',
})

const orderSteps = [
  {
    name: 'Отправьте задачу',
    text: 'Приложите файл, эскиз или фотографию либо опишите, что нужно изготовить.',
  },
  {
    name: 'Проверим и рассчитаем',
    text: 'Уточним материал, размеры и количество, проверим макет, сообщим стоимость и срок.',
  },
  {
    name: 'Изготовим и проверим',
    text: 'Выполним работу, проверим результат и подготовим детали или изделия к выдаче.',
  },
  {
    name: 'Передадим результат',
    text: 'Заказ можно забрать в цехе в Уфе или получить доставкой транспортной компанией.',
  },
]

const howToLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Как заказать лазерную резку, УФ-печать или фрезеровку ЧПУ в Уфе',
  step: orderSteps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text,
  })),
}

export const metadata: Metadata = {
  title: 'Новая главная v2 — Центр лазерной резки в Уфе',
  description: 'Лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ в Уфе. Изготовление деталей и готовых изделий от одной штуки до серии.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://clc-ufa.ru/' },
}

export default function NewHomeV2Page() {
  return (
    <div className={`${display.variable} ${body.variable} new-home-v2-surface`}>
      <JsonLd data={howToLd} />
      <NewHomeV2 orderSteps={orderSteps} />
    </div>
  )
}
