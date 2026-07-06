import localFont from 'next/font/local'

// Самохостинг через next/font/local — woff2-файлы лежат в assets/fonts (в репозитории),
// сборка не ходит в сеть вообще. Раньше был next/font/google: он скачивает шрифты на
// этапе build, а fonts.gstatic.com отсюда недоступен — сборка зависала навсегда.
// Файлы скачаны через google-webfonts-helper (latin+cyrillic одним файлом).

// Bebas Neue поддерживает только латиницу — кириллические заголовки, как и раньше,
// рендерятся фоллбэком (Manrope). Это сохраняет текущее поведение сайта.
export const fontDisplay = localFont({
  src: '../assets/fonts/bebas-neue-400.woff2',
  weight: '400',
  display: 'swap',
  variable: '--f-display',
})

export const fontBody = localFont({
  src: [
    { path: '../assets/fonts/manrope-400.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/manrope-500.woff2', weight: '500', style: 'normal' },
    { path: '../assets/fonts/manrope-600.woff2', weight: '600', style: 'normal' },
    { path: '../assets/fonts/manrope-700.woff2', weight: '700', style: 'normal' },
    { path: '../assets/fonts/manrope-800.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  variable: '--f-body',
})

export const fontMono = localFont({
  src: [
    { path: '../assets/fonts/jetbrains-mono-400.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/jetbrains-mono-500.woff2', weight: '500', style: 'normal' },
  ],
  display: 'swap',
  variable: '--f-mono',
})

export const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`
