import { portfolioFiles } from './portfolio.generated'

export type PortfolioItem = {
  id:       string
  title:    string
  category: string
  tags:     string[]
  image:    string
  alt:      string
}

export type PortfolioCategory = { id: string; label: string; count: number }

// ─────────────────────────────────────────────────────────────────────────────
// Единственное, что поддерживается вручную — порядок категорий и их подписи.
// Количество фото и сами файлы берутся из public/images/portfolio
// (см. data/portfolio.generated.ts, обновляется в predev/prebuild).
//
// Добавить фото в существующую категорию → просто положить файл вида
//   <id>-NNN.jpg  в public/images/portfolio — код подхватит автоматически.
// Удалить фото → удалить файл. Категория без файлов скрывается сама.
// Новая категория → добавить строку с её id и подписью ниже.
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_META: { id: string; label: string }[] = [
  { id: 'lazernaya-rezka',     label: 'Лазерная резка'      },
  { id: 'koroba-fanera',       label: 'Коробки и ящики'     },
  { id: 'gravirovka',          label: 'Гравировка'          },
  { id: 'gravirovka-chasy',    label: 'Гравировка на часах' },
  { id: 'frezernaya-rezka',    label: 'Фрезеровка'          },
  { id: 'organajzery',         label: 'Органайзеры'         },
  { id: 'nagradnye-statuetki', label: 'Наградные статуэтки' },
  { id: 'uf-pechat',           label: 'УФ-печать'           },
  { id: 'medali',              label: 'Медали'              },
  { id: 'tablitchki',          label: 'Таблички'            },
  { id: 'shildiki-abs',        label: 'Шильдики'            },
  { id: 'breloki',             label: 'Брелоки'             },
  { id: 'kheshtegi',           label: 'Хештеги'             },
  { id: 'shkatulki-fanera',    label: 'Шкатулки'            },
  { id: 'vyveski',             label: 'Вывески'             },
  { id: 'ramki-foto',          label: 'Рамки для фото'      },
  { id: 'chasy',               label: 'Часы'                },
  { id: 'medalnitsa',          label: 'Медальницы'          },
  { id: 'nomerki-garderob',    label: 'Номерки'             },
  { id: 'tejbl-tenty',         label: 'Тейбл тенты'         },
  { id: 'kormushki',           label: 'Кормушки'            },
  { id: 'bejdzhi',             label: 'Бейджи'              },
  { id: 'zagotovki',           label: 'Заготовки'           },
  { id: 'klyuchnitsa',         label: 'Ключницы'            },
]

function makeItems(id: string, label: string): PortfolioItem[] {
  const files = portfolioFiles[id] ?? []
  return files.map((file, i) => ({
    id:       file.replace(/\.[^.]+$/, ''),
    title:    label,
    category: id,
    tags:     [],
    image:    `/images/portfolio/${file}`,
    alt:      `${label} — пример ${i + 1}`,
  }))
}

// Все элементы портфолио — строго из реальных файлов на диске
export const portfolioItems: PortfolioItem[] = CATEGORY_META.flatMap(c =>
  makeItems(c.id, c.label),
)

// Категории с непустым набором фото (+ виртуальная «Все работы»)
export const portfolioCategories: PortfolioCategory[] = [
  { id: 'all', label: 'Все работы', count: portfolioItems.length },
  ...CATEGORY_META
    .map(c => ({ id: c.id, label: c.label, count: (portfolioFiles[c.id] ?? []).length }))
    .filter(c => c.count > 0),
]

// ── Доступ к фото категории по манифесту (имя категории = portfolioPrefix) ────
/** Полные пути всех фото категории, в порядке манифеста. */
export function photosForCategory(catId?: string): string[] {
  if (!catId) return []
  return (portfolioFiles[catId] ?? []).map(f => `/images/portfolio/${f}`)
}

/** Первое (репрезентативное) фото категории — для hero / OG / превью. */
export function firstPhoto(catId?: string): string | undefined {
  return photosForCategory(catId)[0]
}

/** До `limit` фото категории, равномерно по всему набору. */
export function samplePhotos(catId?: string, limit = 8): string[] {
  const all = photosForCategory(catId)
  if (all.length <= limit) return all
  const step = Math.max(1, Math.floor(all.length / limit))
  const out: string[] = []
  for (let i = 0; i < all.length && out.length < limit; i += step) out.push(all[i])
  return out
}
