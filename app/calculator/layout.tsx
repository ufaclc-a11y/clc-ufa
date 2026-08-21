import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Калькулятор стоимости лазерной резки в Уфе',
  description: 'Рассчитайте ориентировочную стоимость лазерной резки, гравировки, УФ-печати и фрезеровки ЧПУ в Уфе. Быстрый онлайн-калькулятор.',
  keywords:    ['калькулятор лазерная резка уфа', 'стоимость лазерной резки уфа', 'цена гравировки уфа', 'расчет стоимости резки уфа', 'сколько стоит лазерная резка уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/calculator' },
}

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
