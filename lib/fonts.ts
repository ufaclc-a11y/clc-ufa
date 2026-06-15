import { Bebas_Neue, Manrope, JetBrains_Mono } from 'next/font/google'

// Самохостинг через next/font — без render-blocking запроса к Google Fonts,
// без скачка макета (size-adjust) и без внешней зависимости (важно для 152-ФЗ).

// Bebas Neue поддерживает только латиницу — кириллические заголовки, как и раньше,
// рендерятся фоллбэком (Manrope). Это сохраняет текущее поведение сайта.
export const fontDisplay = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-display',
})

export const fontBody = Manrope({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--f-body',
})

export const fontMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--f-mono',
})

export const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`
