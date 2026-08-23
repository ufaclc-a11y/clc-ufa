import type { Metadata } from 'next'

export { default } from './new-home/page'

export const metadata: Metadata = {
  title: { absolute: 'Центр лазерной резки — лазерная резка, УФ-печать и ЧПУ в Уфе' },
  description: 'Лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ в Уфе. Изготавливаем детали и изделия от одной штуки до регулярной серии.',
  keywords: ['лазерная резка уфа', 'уф печать уфа', 'гравировка уфа', 'фрезеровка чпу уфа', 'изготовление изделий уфа'],
  alternates: { canonical: 'https://clc-ufa.ru/' },
}
