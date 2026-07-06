import localFont from 'next/font/local'

// Самохостинг через next/font/local — woff2 лежат в assets/fonts (latin+cyrillic одним
// файлом, скачаны через google-webfonts-helper). Раньше был next/font/google, который
// скачивает шрифты при сборке — fonts.gstatic.com отсюда недоступен, build зависал.
// preload: false — чтобы 60 шрифтов не создавали десятки <link rel=preload>; браузер
// подгружает их по мере отображения карточек (display: swap).
// Свободные шрифты, у большинства есть кириллица; те, что только латиница, помечены
// cyrillic: false и показываются как «ENG».

// next/font требует литералы в каждом вызове (SWC-плагин не поддерживает spread).

// ── script / рукописные ──────────────────────────────────────────────────────
const lobster    = localFont({ src: '../assets/fonts/lobster-400.woff2',          weight: '400', display: 'swap', preload: false, variable: '--fp-lobster'    })
const caveat     = localFont({ src: '../assets/fonts/caveat-400.woff2',           weight: '400', display: 'swap', preload: false, variable: '--fp-caveat'     })
const marck      = localFont({ src: '../assets/fonts/marck-script-400.woff2',     weight: '400', display: 'swap', preload: false, variable: '--fp-marck'      })
const badScript  = localFont({ src: '../assets/fonts/bad-script-400.woff2',       weight: '400', display: 'swap', preload: false, variable: '--fp-bad'        })
const pangolin   = localFont({ src: '../assets/fonts/pangolin-400.woff2',         weight: '400', display: 'swap', preload: false, variable: '--fp-pangolin'   })
const pacifico   = localFont({ src: '../assets/fonts/pacifico-400.woff2',         weight: '400', display: 'swap', preload: false, variable: '--fp-pacifico'   })
const lobsterTwo = localFont({ src: '../assets/fonts/lobster-two-400.woff2',      weight: '400', display: 'swap', preload: false, variable: '--fp-lobstertwo' })
const pattaya    = localFont({ src: '../assets/fonts/pattaya-400.woff2',          weight: '400', display: 'swap', preload: false, variable: '--fp-pattaya'    })
const neucha     = localFont({ src: '../assets/fonts/neucha-400.woff2',           weight: '400', display: 'swap', preload: false, variable: '--fp-neucha'     })
const comforter  = localFont({ src: '../assets/fonts/comforter-400.woff2',        weight: '400', display: 'swap', preload: false, variable: '--fp-comforter'  })
const comforterBr= localFont({ src: '../assets/fonts/comforter-brush-400.woff2',  weight: '400', display: 'swap', preload: false, variable: '--fp-comfortbr'  })
const amatic     = localFont({ src: '../assets/fonts/amatic-sc-400.woff2',        weight: '400', display: 'swap', preload: false, variable: '--fp-amatic'     })
const balsamiq   = localFont({ src: '../assets/fonts/balsamiq-sans-400.woff2',    weight: '400', display: 'swap', preload: false, variable: '--fp-balsamiq'   })
const bellota    = localFont({ src: '../assets/fonts/bellota-400.woff2',          weight: '400', display: 'swap', preload: false, variable: '--fp-bellota'    })
const shantell   = localFont({ src: '../assets/fonts/shantell-sans-400.woff2',    weight: '400', display: 'swap', preload: false, variable: '--fp-shantell'   })
const yomogi     = localFont({ src: '../assets/fonts/yomogi-400.woff2',           weight: '400', display: 'swap', preload: false, variable: '--fp-yomogi'     })
const kleeOne    = localFont({ src: '../assets/fonts/klee-one-400.woff2',         weight: '400', display: 'swap', preload: false, variable: '--fp-klee'       })
const hachiMaru  = localFont({ src: '../assets/fonts/hachi-maru-pop-400.woff2',   weight: '400', display: 'swap', preload: false, variable: '--fp-hachimaru'  })
const zenKure    = localFont({ src: '../assets/fonts/zen-kurenaido-400.woff2',    weight: '400', display: 'swap', preload: false, variable: '--fp-zenkure'    })

// ── serif / с засечками ──────────────────────────────────────────────────────
const yeseva     = localFont({ src: '../assets/fonts/yeseva-one-400.woff2',       weight: '400', display: 'swap', preload: false, variable: '--fp-yeseva'     })
const playfair   = localFont({ src: '../assets/fonts/playfair-display-400.woff2', weight: '400', display: 'swap', preload: false, variable: '--fp-playfair'   })
const prata      = localFont({ src: '../assets/fonts/prata-400.woff2',            weight: '400', display: 'swap', preload: false, variable: '--fp-prata'      })
const forum      = localFont({ src: '../assets/fonts/forum-400.woff2',            weight: '400', display: 'swap', preload: false, variable: '--fp-forum'      })
const ptSerif    = localFont({ src: '../assets/fonts/pt-serif-400.woff2',         weight: '400', display: 'swap', preload: false, variable: '--fp-ptserif'    })
const merriweather = localFont({ src: '../assets/fonts/merriweather-400.woff2',   weight: '400', display: 'swap', preload: false, variable: '--fp-merri'      })
const lora       = localFont({ src: '../assets/fonts/lora-400.woff2',             weight: '400', display: 'swap', preload: false, variable: '--fp-lora'       })
const cormorant  = localFont({ src: '../assets/fonts/cormorant-400.woff2',        weight: '400', display: 'swap', preload: false, variable: '--fp-cormorant'  })
const ebGaramond = localFont({ src: '../assets/fonts/eb-garamond-400.woff2',      weight: '400', display: 'swap', preload: false, variable: '--fp-garamond'   })
const spectral   = localFont({ src: '../assets/fonts/spectral-400.woff2',         weight: '400', display: 'swap', preload: false, variable: '--fp-spectral'   })
const vollkorn   = localFont({ src: '../assets/fonts/vollkorn-400.woff2',         weight: '400', display: 'swap', preload: false, variable: '--fp-vollkorn'   })
const oldStandard= localFont({ src: '../assets/fonts/old-standard-tt-400.woff2',  weight: '400', display: 'swap', preload: false, variable: '--fp-oldstd'     })
const tenor      = localFont({ src: '../assets/fonts/tenor-sans-400.woff2',       weight: '400', display: 'swap', preload: false, variable: '--fp-tenor'      })
const philosopher= localFont({ src: '../assets/fonts/philosopher-400.woff2',      weight: '400', display: 'swap', preload: false, variable: '--fp-philo'      })
const notoSerif  = localFont({ src: '../assets/fonts/noto-serif-400.woff2',       weight: '400', display: 'swap', preload: false, variable: '--fp-notoserif'  })

// ── decor / декоративные ─────────────────────────────────────────────────────
const ruslan     = localFont({ src: '../assets/fonts/ruslan-display-400.woff2',   weight: '400', display: 'swap', preload: false, variable: '--fp-ruslan'     })
const underdog   = localFont({ src: '../assets/fonts/underdog-400.woff2',         weight: '400', display: 'swap', preload: false, variable: '--fp-underdog'   })
const pressStart = localFont({ src: '../assets/fonts/press-start-2p-400.woff2',   weight: '400', display: 'swap', preload: false, variable: '--fp-press'      })
const seymour    = localFont({ src: '../assets/fonts/seymour-one-400.woff2',      weight: '400', display: 'swap', preload: false, variable: '--fp-seymour'    })
const rubikMono  = localFont({ src: '../assets/fonts/rubik-mono-one-400.woff2',   weight: '400', display: 'swap', preload: false, variable: '--fp-rubikmono'  })
const stalinist  = localFont({ src: '../assets/fonts/stalinist-one-400.woff2',    weight: '400', display: 'swap', preload: false, variable: '--fp-stalinist'  })
const kellySlab  = localFont({ src: '../assets/fonts/kelly-slab-400.woff2',       weight: '400', display: 'swap', preload: false, variable: '--fp-kelly'      })
const podkova    = localFont({ src: '../assets/fonts/podkova-400.woff2',          weight: '400', display: 'swap', preload: false, variable: '--fp-podkova'    })

// ── sans / без засечек ───────────────────────────────────────────────────────
const russo      = localFont({ src: '../assets/fonts/russo-one-400.woff2',        weight: '400', display: 'swap', preload: false, variable: '--fp-russo'      })
const oswald     = localFont({ src: '../assets/fonts/oswald-400.woff2',           weight: '400', display: 'swap', preload: false, variable: '--fp-oswald'     })
const roboto     = localFont({ src: '../assets/fonts/roboto-400.woff2',           weight: '400', display: 'swap', preload: false, variable: '--fp-roboto'     })
const openSans   = localFont({ src: '../assets/fonts/open-sans-400.woff2',        weight: '400', display: 'swap', preload: false, variable: '--fp-opensans'   })
const montserrat = localFont({ src: '../assets/fonts/montserrat-400.woff2',       weight: '400', display: 'swap', preload: false, variable: '--fp-montserrat' })
const ptSans     = localFont({ src: '../assets/fonts/pt-sans-400.woff2',          weight: '400', display: 'swap', preload: false, variable: '--fp-ptsans'     })
const raleway    = localFont({ src: '../assets/fonts/raleway-400.woff2',          weight: '400', display: 'swap', preload: false, variable: '--fp-raleway'    })
const ubuntu     = localFont({ src: '../assets/fonts/ubuntu-400.woff2',           weight: '400', display: 'swap', preload: false, variable: '--fp-ubuntu'     })
const nunito     = localFont({ src: '../assets/fonts/nunito-400.woff2',           weight: '400', display: 'swap', preload: false, variable: '--fp-nunito'     })
const rubik      = localFont({ src: '../assets/fonts/rubik-400.woff2',            weight: '400', display: 'swap', preload: false, variable: '--fp-rubik'      })
const inter      = localFont({ src: '../assets/fonts/inter-400.woff2',            weight: '400', display: 'swap', preload: false, variable: '--fp-inter'      })
const firaSans   = localFont({ src: '../assets/fonts/fira-sans-400.woff2',        weight: '400', display: 'swap', preload: false, variable: '--fp-fira'       })
const exo2       = localFont({ src: '../assets/fonts/exo-2-400.woff2',            weight: '400', display: 'swap', preload: false, variable: '--fp-exo'        })
const play       = localFont({ src: '../assets/fonts/play-400.woff2',             weight: '400', display: 'swap', preload: false, variable: '--fp-play'       })
const comfortaa  = localFont({ src: '../assets/fonts/comfortaa-400.woff2',        weight: '400', display: 'swap', preload: false, variable: '--fp-comfortaa'  })
const yanone     = localFont({ src: '../assets/fonts/yanone-kaffeesatz-400.woff2',weight: '400', display: 'swap', preload: false, variable: '--fp-yanone'     })
const jura       = localFont({ src: '../assets/fonts/jura-400.woff2',             weight: '400', display: 'swap', preload: false, variable: '--fp-jura'       })
const cuprum     = localFont({ src: '../assets/fonts/cuprum-400.woff2',           weight: '400', display: 'swap', preload: false, variable: '--fp-cuprum'     })

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
