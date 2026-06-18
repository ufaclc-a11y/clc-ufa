import {
  // script / рукописные
  Lobster, Caveat, Marck_Script, Bad_Script, Pangolin, Pacifico,
  Lobster_Two, Pattaya, Neucha,
  Comforter, Comforter_Brush, Amatic_SC, Balsamiq_Sans, Bellota,
  Shantell_Sans, Yomogi, Klee_One, Hachi_Maru_Pop, Zen_Kurenaido,
  // serif / с засечками
  Yeseva_One, Playfair_Display, Prata, Forum, PT_Serif, Merriweather,
  Lora, Cormorant, EB_Garamond, Spectral, Vollkorn, Old_Standard_TT,
  Tenor_Sans, Philosopher, Noto_Serif,
  // decor / декоративные
  Ruslan_Display, Underdog, Press_Start_2P, Seymour_One, Rubik_Mono_One,
  Stalinist_One, Kelly_Slab, Podkova,
  // sans / без засечек
  Russo_One, Oswald, Roboto, Open_Sans, Montserrat, PT_Sans, Raleway,
  Ubuntu, Nunito, Rubik, Inter, Fira_Sans, Exo_2, Play, Comfortaa,
  Yanone_Kaffeesatz, Jura, Cuprum,
} from 'next/font/google'

// Самохостинг через next/font — без запроса к Google Fonts в рантайме (CSP-friendly,
// важно для 152-ФЗ). preload: false — чтобы 50 шрифтов не создавали десятки <link
// rel=preload>; браузер подгружает их по мере отображения карточек (display: swap).
// Свободные шрифты, у большинства есть кириллица; те, что только латиница, помечены
// cyrillic: false и показываются как «ENG».

// next/font требует литералы в каждом вызове (SWC-плагин не поддерживает spread).

// ── script / рукописные ──────────────────────────────────────────────────────
const lobster    = Lobster({         weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-lobster'    })
const caveat     = Caveat({          weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-caveat'     })
const marck      = Marck_Script({    weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-marck'      })
const badScript  = Bad_Script({      weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-bad'        })
const pangolin   = Pangolin({        weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-pangolin'   })
const pacifico   = Pacifico({        weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-pacifico'   })
const lobsterTwo = Lobster_Two({     weight: '400', subsets: ['latin'], display: 'swap', preload: false, variable: '--fp-lobstertwo' })
const pattaya    = Pattaya({         weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-pattaya'    })
const neucha     = Neucha({          weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-neucha'     })
const comforter  = Comforter({       weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-comforter' })
const comforterBr= Comforter_Brush({ weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-comfortbr' })
const amatic     = Amatic_SC({       weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-amatic'    })
const balsamiq   = Balsamiq_Sans({   weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-balsamiq'  })
const bellota    = Bellota({         weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-bellota'   })
const shantell   = Shantell_Sans({   weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-shantell'  })
const yomogi     = Yomogi({          weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-yomogi'    })
const kleeOne    = Klee_One({        weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-klee'      })
const hachiMaru  = Hachi_Maru_Pop({  weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-hachimaru' })
const zenKure    = Zen_Kurenaido({   weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-zenkure'   })

// ── serif / с засечками ──────────────────────────────────────────────────────
const yeseva     = Yeseva_One({      weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-yeseva'    })
const playfair   = Playfair_Display({weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-playfair'  })
const prata      = Prata({           weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-prata'     })
const forum      = Forum({           weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-forum'     })
const ptSerif    = PT_Serif({        weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-ptserif'   })
const merriweather = Merriweather({  weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-merri'     })
const lora       = Lora({            weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-lora'      })
const cormorant  = Cormorant({       weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-cormorant' })
const ebGaramond = EB_Garamond({     weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-garamond'  })
const spectral   = Spectral({        weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-spectral'  })
const vollkorn   = Vollkorn({        weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-vollkorn'  })
const oldStandard= Old_Standard_TT({ weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-oldstd'    })
const tenor      = Tenor_Sans({      weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-tenor'     })
const philosopher= Philosopher({     weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-philo'     })
const notoSerif  = Noto_Serif({      weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-notoserif' })

// ── decor / декоративные ─────────────────────────────────────────────────────
const ruslan     = Ruslan_Display({  weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-ruslan'    })
const underdog   = Underdog({        weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-underdog'  })
const pressStart = Press_Start_2P({  weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-press'     })
const seymour    = Seymour_One({     weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-seymour'   })
const rubikMono  = Rubik_Mono_One({  weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-rubikmono' })
const stalinist  = Stalinist_One({   weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-stalinist' })
const kellySlab  = Kelly_Slab({      weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-kelly'     })
const podkova    = Podkova({         weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-podkova'   })

// ── sans / без засечек ───────────────────────────────────────────────────────
const russo      = Russo_One({       weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-russo'     })
const oswald     = Oswald({          weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-oswald'    })
const roboto     = Roboto({          weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-roboto'    })
const openSans   = Open_Sans({       weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-opensans'  })
const montserrat = Montserrat({      weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-montserrat'})
const ptSans     = PT_Sans({         weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-ptsans'    })
const raleway    = Raleway({         weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-raleway'   })
const ubuntu     = Ubuntu({          weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-ubuntu'    })
const nunito     = Nunito({          weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-nunito'    })
const rubik      = Rubik({           weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-rubik'     })
const inter      = Inter({           weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-inter'     })
const firaSans   = Fira_Sans({       weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-fira'      })
const exo2       = Exo_2({           weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-exo'       })
const play       = Play({            weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-play'      })
const comfortaa  = Comfortaa({       weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-comfortaa' })
const yanone     = Yanone_Kaffeesatz({weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-yanone'  })
const jura       = Jura({            weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-jura'      })
const cuprum     = Cuprum({          weight: '400', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false, variable: '--fp-cuprum'    })

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
  // script
  { id: 'lobster',    name: 'Lobster',          cssVar: '--fp-lobster',    cyrillic: true,  category: 'script' },
  { id: 'lobstertwo', name: 'Lobster Two',      cssVar: '--fp-lobstertwo', cyrillic: false, category: 'script' },
  { id: 'caveat',     name: 'Caveat',           cssVar: '--fp-caveat',     cyrillic: true,  category: 'script' },
  { id: 'marck',      name: 'Marck Script',     cssVar: '--fp-marck',      cyrillic: true,  category: 'script' },
  { id: 'bad',        name: 'Bad Script',       cssVar: '--fp-bad',        cyrillic: true,  category: 'script' },
  { id: 'pangolin',   name: 'Pangolin',         cssVar: '--fp-pangolin',   cyrillic: true,  category: 'script' },
  { id: 'pattaya',    name: 'Pattaya',          cssVar: '--fp-pattaya',    cyrillic: true,  category: 'script' },
  { id: 'neucha',     name: 'Neucha',           cssVar: '--fp-neucha',     cyrillic: true,  category: 'script' },
  { id: 'pacifico',   name: 'Pacifico',         cssVar: '--fp-pacifico',   cyrillic: true,  category: 'script' },
  { id: 'comforter',  name: 'Comforter',        cssVar: '--fp-comforter',  cyrillic: true,  category: 'script' },
  { id: 'comfortbr',  name: 'Comforter Brush',  cssVar: '--fp-comfortbr',  cyrillic: true,  category: 'script' },
  { id: 'amatic',     name: 'Amatic SC',        cssVar: '--fp-amatic',     cyrillic: true,  category: 'script' },
  { id: 'balsamiq',   name: 'Balsamiq Sans',    cssVar: '--fp-balsamiq',   cyrillic: true,  category: 'script' },
  { id: 'bellota',    name: 'Bellota',          cssVar: '--fp-bellota',    cyrillic: true,  category: 'script' },
  { id: 'shantell',   name: 'Shantell Sans',    cssVar: '--fp-shantell',   cyrillic: true,  category: 'script' },
  { id: 'yomogi',     name: 'Yomogi',           cssVar: '--fp-yomogi',     cyrillic: true,  category: 'script' },
  { id: 'klee',       name: 'Klee One',         cssVar: '--fp-klee',       cyrillic: true,  category: 'script' },
  { id: 'hachimaru',  name: 'Hachi Maru Pop',   cssVar: '--fp-hachimaru',  cyrillic: true,  category: 'script' },
  { id: 'zenkure',    name: 'Zen Kurenaido',    cssVar: '--fp-zenkure',    cyrillic: true,  category: 'script' },
  // serif
  { id: 'yeseva',     name: 'Yeseva One',       cssVar: '--fp-yeseva',     cyrillic: true,  category: 'serif'  },
  { id: 'playfair',   name: 'Playfair Display', cssVar: '--fp-playfair',   cyrillic: true,  category: 'serif'  },
  { id: 'prata',      name: 'Prata',            cssVar: '--fp-prata',      cyrillic: true,  category: 'serif'  },
  { id: 'forum',      name: 'Forum',            cssVar: '--fp-forum',      cyrillic: true,  category: 'serif'  },
  { id: 'ptserif',    name: 'PT Serif',         cssVar: '--fp-ptserif',    cyrillic: true,  category: 'serif'  },
  { id: 'merri',      name: 'Merriweather',     cssVar: '--fp-merri',      cyrillic: true,  category: 'serif'  },
  { id: 'lora',       name: 'Lora',             cssVar: '--fp-lora',       cyrillic: true,  category: 'serif'  },
  { id: 'cormorant',  name: 'Cormorant',        cssVar: '--fp-cormorant',  cyrillic: true,  category: 'serif'  },
  { id: 'garamond',   name: 'EB Garamond',      cssVar: '--fp-garamond',   cyrillic: true,  category: 'serif'  },
  { id: 'spectral',   name: 'Spectral',         cssVar: '--fp-spectral',   cyrillic: true,  category: 'serif'  },
  { id: 'vollkorn',   name: 'Vollkorn',         cssVar: '--fp-vollkorn',   cyrillic: true,  category: 'serif'  },
  { id: 'oldstd',     name: 'Old Standard TT',  cssVar: '--fp-oldstd',     cyrillic: true,  category: 'serif'  },
  { id: 'tenor',      name: 'Tenor Sans',       cssVar: '--fp-tenor',      cyrillic: true,  category: 'serif'  },
  { id: 'philo',      name: 'Philosopher',      cssVar: '--fp-philo',      cyrillic: true,  category: 'serif'  },
  { id: 'notoserif',  name: 'Noto Serif',       cssVar: '--fp-notoserif',  cyrillic: true,  category: 'serif'  },
  // decor
  { id: 'ruslan',     name: 'Ruslan Display',   cssVar: '--fp-ruslan',     cyrillic: true,  category: 'decor'  },
  { id: 'underdog',   name: 'Underdog',         cssVar: '--fp-underdog',   cyrillic: true,  category: 'decor'  },
  { id: 'seymour',    name: 'Seymour One',      cssVar: '--fp-seymour',    cyrillic: true,  category: 'decor'  },
  { id: 'rubikmono',  name: 'Rubik Mono One',   cssVar: '--fp-rubikmono',  cyrillic: true,  category: 'decor'  },
  { id: 'stalinist',  name: 'Stalinist One',    cssVar: '--fp-stalinist',  cyrillic: true,  category: 'decor'  },
  { id: 'kelly',      name: 'Kelly Slab',       cssVar: '--fp-kelly',      cyrillic: true,  category: 'decor'  },
  { id: 'podkova',    name: 'Podkova',          cssVar: '--fp-podkova',    cyrillic: true,  category: 'decor'  },
  { id: 'press',      name: 'Press Start 2P',   cssVar: '--fp-press',      cyrillic: true,  category: 'decor'  },
  // sans
  { id: 'russo',      name: 'Russo One',        cssVar: '--fp-russo',      cyrillic: true,  category: 'sans'   },
  { id: 'oswald',     name: 'Oswald',           cssVar: '--fp-oswald',     cyrillic: true,  category: 'sans'   },
  { id: 'roboto',     name: 'Roboto',           cssVar: '--fp-roboto',     cyrillic: true,  category: 'sans'   },
  { id: 'opensans',   name: 'Open Sans',        cssVar: '--fp-opensans',   cyrillic: true,  category: 'sans'   },
  { id: 'montserrat', name: 'Montserrat',       cssVar: '--fp-montserrat', cyrillic: true,  category: 'sans'   },
  { id: 'ptsans',     name: 'PT Sans',          cssVar: '--fp-ptsans',     cyrillic: true,  category: 'sans'   },
  { id: 'raleway',    name: 'Raleway',          cssVar: '--fp-raleway',    cyrillic: true,  category: 'sans'   },
  { id: 'ubuntu',     name: 'Ubuntu',           cssVar: '--fp-ubuntu',     cyrillic: true,  category: 'sans'   },
  { id: 'nunito',     name: 'Nunito',           cssVar: '--fp-nunito',     cyrillic: true,  category: 'sans'   },
  { id: 'rubik',      name: 'Rubik',            cssVar: '--fp-rubik',      cyrillic: true,  category: 'sans'   },
  { id: 'inter',      name: 'Inter',            cssVar: '--fp-inter',      cyrillic: true,  category: 'sans'   },
  { id: 'fira',       name: 'Fira Sans',        cssVar: '--fp-fira',       cyrillic: true,  category: 'sans'   },
  { id: 'exo',        name: 'Exo 2',            cssVar: '--fp-exo',        cyrillic: true,  category: 'sans'   },
  { id: 'play',       name: 'Play',             cssVar: '--fp-play',       cyrillic: true,  category: 'sans'   },
  { id: 'comfortaa',  name: 'Comfortaa',        cssVar: '--fp-comfortaa',  cyrillic: true,  category: 'sans'   },
  { id: 'yanone',     name: 'Yanone Kaffeesatz',cssVar: '--fp-yanone',     cyrillic: true,  category: 'sans'   },
  { id: 'jura',       name: 'Jura',             cssVar: '--fp-jura',       cyrillic: true,  category: 'sans'   },
  { id: 'cuprum',     name: 'Cuprum',           cssVar: '--fp-cuprum',     cyrillic: true,  category: 'sans'   },
]

// Класс со всеми CSS-переменными шрифтов — вешается на обёртку страницы.
export const previewFontVars = [
  lobster, caveat, marck, badScript, pangolin, pacifico, lobsterTwo, pattaya, neucha,
  comforter, comforterBr, amatic, balsamiq, bellota, shantell, yomogi, kleeOne, hachiMaru, zenKure,
  yeseva, playfair, prata, forum, ptSerif, merriweather, lora, cormorant, ebGaramond,
  spectral, vollkorn, oldStandard, tenor, philosopher, notoSerif,
  ruslan, underdog, pressStart, seymour, rubikMono, stalinist, kellySlab, podkova,
  russo, oswald, roboto, openSans, montserrat, ptSans, raleway, ubuntu, nunito, rubik,
  inter, firaSans, exo2, play, comfortaa, yanone, jura, cuprum,
].map(f => f.variable).join(' ')
