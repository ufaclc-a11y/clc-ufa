import {
  Lobster,
  Caveat,
  Marck_Script,
  Bad_Script,
  Pangolin,
  Pacifico,
  Yeseva_One,
  Playfair_Display,
  Prata,
  Forum,
  Ruslan_Display,
  Underdog,
  Press_Start_2P,
  Russo_One,
  Oswald,
} from 'next/font/google'

// Самохостинг через next/font — без запроса к Google Fonts в рантайме (CSP-friendly,
// важно для 152-ФЗ). Свободные шрифты, у большинства есть кириллица; те, что только
// латиница, помечены cyrillic: false и показываются на странице как «ENG».

const lobster   = Lobster({   weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-lobster'   })
const caveat    = Caveat({    weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-caveat'    })
const marck     = Marck_Script({ weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-marck' })
const badScript = Bad_Script({ weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-bad'      })
const pangolin  = Pangolin({  weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-pangolin' })
const pacifico  = Pacifico({  weight: '400', subsets: ['latin'],             display: 'swap', variable: '--fp-pacifico' })
const yeseva    = Yeseva_One({ weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-yeseva'  })
const playfair  = Playfair_Display({ weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-playfair' })
const prata     = Prata({     weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-prata'    })
const forum     = Forum({     weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-forum'    })
const ruslan    = Ruslan_Display({ weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-ruslan' })
const underdog  = Underdog({  weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-underdog' })
const pressStart= Press_Start_2P({ weight: '400', subsets: ['latin'],        display: 'swap', variable: '--fp-press'    })
const russo     = Russo_One({ weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-russo'    })
const oswald    = Oswald({    weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--fp-oswald'   })

export type FontCategory = 'script' | 'serif' | 'decor' | 'sans'

export interface PreviewFont {
  id: string
  name: string
  cssVar: string          // имя CSS-переменной, напр. '--fp-lobster'
  cyrillic: boolean       // поддерживает ли кириллицу
  category: FontCategory
}

export const fontCategories: { id: FontCategory; label: string }[] = [
  { id: 'script', label: 'Рукописные'   },
  { id: 'serif',  label: 'С засечками'  },
  { id: 'decor',  label: 'Декоративные' },
  { id: 'sans',   label: 'Без засечек'  },
]

// Единый каталог — источник списка шрифтов для страницы /fonts.
export const previewFonts: PreviewFont[] = [
  { id: 'lobster',   name: 'Lobster',          cssVar: '--fp-lobster',   cyrillic: true,  category: 'script' },
  { id: 'caveat',    name: 'Caveat',           cssVar: '--fp-caveat',    cyrillic: true,  category: 'script' },
  { id: 'marck',     name: 'Marck Script',     cssVar: '--fp-marck',     cyrillic: true,  category: 'script' },
  { id: 'bad',       name: 'Bad Script',       cssVar: '--fp-bad',       cyrillic: true,  category: 'script' },
  { id: 'pangolin',  name: 'Pangolin',         cssVar: '--fp-pangolin',  cyrillic: true,  category: 'script' },
  { id: 'pacifico',  name: 'Pacifico',         cssVar: '--fp-pacifico',  cyrillic: false, category: 'script' },
  { id: 'yeseva',    name: 'Yeseva One',       cssVar: '--fp-yeseva',    cyrillic: true,  category: 'serif'  },
  { id: 'playfair',  name: 'Playfair Display', cssVar: '--fp-playfair',  cyrillic: true,  category: 'serif'  },
  { id: 'prata',     name: 'Prata',            cssVar: '--fp-prata',     cyrillic: true,  category: 'serif'  },
  { id: 'forum',     name: 'Forum',            cssVar: '--fp-forum',     cyrillic: true,  category: 'serif'  },
  { id: 'ruslan',    name: 'Ruslan Display',   cssVar: '--fp-ruslan',    cyrillic: true,  category: 'decor'  },
  { id: 'underdog',  name: 'Underdog',         cssVar: '--fp-underdog',  cyrillic: true,  category: 'decor'  },
  { id: 'press',     name: 'Press Start 2P',   cssVar: '--fp-press',     cyrillic: false, category: 'decor'  },
  { id: 'russo',     name: 'Russo One',        cssVar: '--fp-russo',     cyrillic: true,  category: 'sans'   },
  { id: 'oswald',    name: 'Oswald',           cssVar: '--fp-oswald',    cyrillic: true,  category: 'sans'   },
]

// Класс со всеми CSS-переменными шрифтов — вешается на обёртку страницы.
export const previewFontVars = [
  lobster, caveat, marck, badScript, pangolin, pacifico, yeseva,
  playfair, prata, forum, ruslan, underdog, pressStart, russo, oswald,
].map(f => f.variable).join(' ')
