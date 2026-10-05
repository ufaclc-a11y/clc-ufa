import localFont from 'next/font/local'

// Самохостинг через next/font/local — woff2-файлы лежат в assets/fonts (в репозитории),
// сборка не ходит в сеть вообще. Раньше был next/font/google: он скачивает шрифты на
// этапе build, а fonts.gstatic.com отсюда недоступен — сборка зависала навсегда.
// Файлы скачаны через google-webfonts-helper (latin+cyrillic одним файлом).

// Manrope поддерживает кириллицу, латиницу и знаки препинания одним шрифтом.
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

export const fontVariables = fontBody.variable
