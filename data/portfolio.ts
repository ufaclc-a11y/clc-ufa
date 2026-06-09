export type PortfolioItem = {
  id:       string
  title:    string
  category: string
  tags:     string[]
  image:    string
  alt:      string
}

export type PortfolioCategory = { id: string; label: string; count: number }

// Все категории с количеством фото
export const portfolioCategories: PortfolioCategory[] = [
  { id: 'all',                label: 'Все работы',           count: 806 },
  { id: 'lazernaya-rezka',    label: 'Лазерная резка',       count: 375 },
  { id: 'koroba-fanera',      label: 'Коробки и ящики',      count: 74  },
  { id: 'gravirovka',         label: 'Гравировка',           count: 69  },
  { id: 'frezernaya-rezka',   label: 'Фрезеровка',           count: 50  },
  { id: 'organajzery',        label: 'Органайзеры',          count: 37  },
  { id: 'nagradnye-statuetki',label: 'Наградные статуэтки',  count: 23  },
  { id: 'uf-pechat',          label: 'УФ-печать',            count: 24  },
  { id: 'medali',             label: 'Медали',               count: 23  },
  { id: 'tablitchki',         label: 'Таблички',             count: 21  },
  { id: 'breloki',            label: 'Брелоки',              count: 15  },
  { id: 'kheshtegi',          label: 'Хештеги',              count: 15  },
  { id: 'shkatulki-fanera',   label: 'Шкатулки',            count: 14  },
  { id: 'vyveski',            label: 'Вывески',              count: 14  },
  { id: 'ramki-foto',         label: 'Рамки для фото',       count: 10  },
  { id: 'chasy',              label: 'Часы',                 count: 8   },
  { id: 'medalnitsa',         label: 'Медальницы',           count: 8   },
  { id: 'nomerki-garderob',   label: 'Номерки',              count: 6   },
  { id: 'tejbl-tenty',        label: 'Тейбл тенты',          count: 5   },
  { id: 'kormushki',          label: 'Кормушки',             count: 5   },
  { id: 'bejdzhi',            label: 'Бейджи',               count: 5   },
  { id: 'zagotovki',          label: 'Заготовки',            count: 3   },
  { id: 'klyuchnitsa',        label: 'Ключницы',             count: 2   },
]

/** Генерирует массив PortfolioItem для заданного префикса */
function makeItems(id: string, label: string, count: number): PortfolioItem[] {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(3, '0')
    return {
      id:       `${id}-${n}`,
      title:    label,
      category: id,
      tags:     [],
      image:    `/images/portfolio/${id}-${n}.jpg`,
      alt:      `${label} — пример ${i + 1}`,
    }
  })
}

// Все элементы портфолио (генерируются из файлов)
export const portfolioItems: PortfolioItem[] = portfolioCategories
  .filter(c => c.id !== 'all')
  .flatMap(c => makeItems(c.id, c.label, c.count))
