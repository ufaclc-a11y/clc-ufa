import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { Hero }         from './_components/Hero'
import { Positioning }  from './_components/Positioning'
import { Technologies } from './_components/Technologies'
import { Works }        from './_components/Works'
import { Capabilities } from './_components/Capabilities'
import { Process }      from './_components/Process'
import { OrderSection } from './_components/OrderSection'

import './claude-home.css'

/**
 * Альтернативная концепция главной страницы. Полностью изолирована:
 * собственные компоненты в _components, собственный CSS под классом .ch,
 * собственный display-шрифт. Действующая «/», /new-home и /new-home-v2
 * не затрагиваются.
 *
 * Страница закрыта от индексации, чтобы не конкурировать с рабочей главной.
 */

// Oswald — узкий технический гротеск с кириллицей, файл уже лежит в assets/fonts.
// Сборка не ходит в сеть (см. CLAUDE.md: только next/font/local).
const display = localFont({
  src: '../../assets/fonts/oswald-400.woff2',
  weight: '400',
  display: 'swap',
  variable: '--ch-display',
})

export const metadata: Metadata = {
  title: 'Центр лазерной резки в Уфе — лазерная резка, УФ-печать, гравировка, фрезеровка ЧПУ',
  description:
    'Производственный цех в Уфе: лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ. Детали, комплектующие и готовые изделия по вашему файлу или эскизу — от одной штуки до серии.',
  robots: { index: false, follow: false },
}

export default function ClaudeHomePage() {
  return (
    <div className={`ch ${display.variable} pt-[67px]`}>
      <Hero />
      <Positioning />
      <Technologies />
      <Works />
      <Capabilities />
      <Process />
      <OrderSection />
    </div>
  )
}
