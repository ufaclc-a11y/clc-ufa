// Источник: Расчет.xlsx, лист «Материал и резка», столбцы F, H и I.
// Цены за метр реза; отсутствующий тариф не означает нулевую стоимость.
// Полистирол обрабатываем только на ЧПУ; лазерную резку не выполняем.
export type CuttingMethod = 'laser' | 'cnc'
export type CuttingRate = { label: string; group: string; laser?: number; cnc?: number }

export const minimumOrder = 450
export const cuttingGroups: Record<string, string> = {
  fanera: 'Фанера', akril: 'Акрил / оргстекло', mdf: 'МДФ',
  derevo: 'Массив дерева', pet: 'ПЭТ', pvh: 'ПВХ',
  polistirol: 'Полистирол', polikarbonat: 'Поликарбонат',
  kompozit: 'Алюминиевый композит', abs: 'АБС пластик',
  karton: 'Картон', other: 'Шпон, ХДФ и другие материалы',
}

export function getCuttingPriceTables(method: CuttingMethod, groups?: string[]) {
  return Object.entries(cuttingGroups)
    .filter(([key]) => !groups || groups.includes(key))
    .map(([key, title]) => ({
      title,
      unit: 'руб/м реза',
      note: `Без стоимости материала. Минимальный заказ — ${minimumOrder} ₽.`,
      rows: cuttingRates.filter(rate => rate.group === key && rate[method] !== undefined)
        .map(rate => ({ label: rate.label, price: String(rate[method]) })),
    }))
    .filter(table => table.rows.length > 0)
}

export function getLandingCuttingPrices(slug: string): { method: CuttingMethod; groups: string[] } | undefined {
  const pages: Record<string, { method: CuttingMethod; groups: string[] }> = {
    'lazernaya-rezka-fanery-ufa': { method: 'laser', groups: ['fanera'] },
    'lazernaya-rezka-akrila-ufa': { method: 'laser', groups: ['akril'] },
    'lazernaya-rezka-kartona-ufa': { method: 'laser', groups: ['karton'] },
    'lazernaya-rezka-mdf-ufa': { method: 'laser', groups: ['mdf'] },
    'frezernaya-rezka-fanery-ufa': { method: 'cnc', groups: ['fanera'] },
    'frezernaya-rezka-mdf-ufa': { method: 'cnc', groups: ['mdf'] },
    'frezernaya-rezka-dereva-ufa': { method: 'cnc', groups: ['derevo'] },
    'frezernaya-rezka-pvh-ufa': { method: 'cnc', groups: ['pvh', 'polistirol', 'polikarbonat'] },
    'frezernaya-rezka-kompozit-ufa': { method: 'cnc', groups: ['kompozit'] },
  }
  return pages[slug]
}

export const cuttingRates: CuttingRate[] = [
  {
    "label": "Фанера 3 мм",
    "group": "fanera",
    "laser": 36,
    "cnc": 44
  },
  {
    "label": "Фанера 4 мм",
    "group": "fanera",
    "laser": 48,
    "cnc": 44
  },
  {
    "label": "Фанера 4 мм (ФСФ) 2/2",
    "group": "fanera",
    "cnc": 44
  },
  {
    "label": "Фанера 5 мм",
    "group": "fanera",
    "laser": 55,
    "cnc": 44
  },
  {
    "label": "Фанера 6 мм",
    "group": "fanera",
    "laser": 81,
    "cnc": 44
  },
  {
    "label": "Фанера 6 мм (ФСФ) 2/2",
    "group": "fanera",
    "cnc": 44
  },
  {
    "label": "Фанера 8 мм",
    "group": "fanera",
    "laser": 139,
    "cnc": 44
  },
  {
    "label": "Фанера 9 мм",
    "group": "fanera",
    "laser": 165,
    "cnc": 49
  },
  {
    "label": "Фанера 9 мм (ФСФ) 2/2",
    "group": "fanera",
    "cnc": 49
  },
  {
    "label": "Фанера 10 мм",
    "group": "fanera",
    "laser": 191,
    "cnc": 55
  },
  {
    "label": "Фанера 12 мм",
    "group": "fanera",
    "laser": 261,
    "cnc": 66
  },
  {
    "label": "Фанера 12 мм (ФСФ) 2/2",
    "group": "fanera",
    "cnc": 66
  },
  {
    "label": "Фанера 15 мм",
    "group": "fanera",
    "laser": 418,
    "cnc": 82
  },
  {
    "label": "Фанера 15 мм (ФСФ) 2/2",
    "group": "fanera",
    "cnc": 82
  },
  {
    "label": "Фанера 18 мм",
    "group": "fanera",
    "cnc": 99
  },
  {
    "label": "Фанера 18 мм (ФСФ) 2/2",
    "group": "fanera",
    "cnc": 99
  },
  {
    "label": "Фанера 18 мм (ФСФ) ламинированная",
    "group": "fanera",
    "cnc": 99
  },
  {
    "label": "Фанера 20 мм",
    "group": "fanera",
    "cnc": 110
  },
  {
    "label": "Фанера 21 мм (ФСФ) 2/2",
    "group": "fanera",
    "cnc": 115
  },
  {
    "label": "Фанера 24 мм (ФСФ) 2/2",
    "group": "fanera",
    "cnc": 132
  },
  {
    "label": "Фанера 27 мм (ФСФ) 2/2",
    "group": "fanera",
    "cnc": 148
  },
  {
    "label": "Фанера 30 мм (ФСФ) 2/2",
    "group": "fanera",
    "cnc": 165
  },
  {
    "label": "Фанера 40 мм (ФСФ) 2/3",
    "group": "fanera",
    "cnc": 220
  },
  {
    "label": "Массив сосны 18 мм",
    "group": "derevo",
    "cnc": 99
  },
  {
    "label": "Массив бука 20 мм (сращенный)",
    "group": "derevo",
    "cnc": 99
  },
  {
    "label": "Массив бука 40 мм (сращенный)",
    "group": "derevo",
    "cnc": 220
  },
  {
    "label": "Массив бука 40 мм (цельноламельный)",
    "group": "derevo",
    "cnc": 220
  },
  {
    "label": "Массив дуба 20 мм (цельноламельный)",
    "group": "derevo",
    "cnc": 99
  },
  {
    "label": "Массив дуба 20 мм (сращенный)",
    "group": "derevo",
    "cnc": 99
  },
  {
    "label": "Массив дуба 40 мм (цельноламельный)",
    "group": "derevo",
    "cnc": 220
  },
  {
    "label": "Массив дуба 40 мм (сращенный)",
    "group": "derevo",
    "cnc": 220
  },
  {
    "label": "Массив ильма 20 мм (цельноламельный)",
    "group": "derevo",
    "cnc": 99
  },
  {
    "label": "Массив ильма 20 мм (сращенный)",
    "group": "derevo",
    "cnc": 99
  },
  {
    "label": "Массив ильма 40 мм (цельноламельный)",
    "group": "derevo",
    "cnc": 220
  },
  {
    "label": "Массив ильма 40 мм (сращенный)",
    "group": "derevo",
    "cnc": 220
  },
  {
    "label": "МДФ 3 мм (венге)",
    "group": "mdf",
    "laser": 36,
    "cnc": 44
  },
  {
    "label": "МДФ 6 мм",
    "group": "mdf",
    "laser": 137,
    "cnc": 44
  },
  {
    "label": "МДФ 8 мм",
    "group": "mdf",
    "laser": 260,
    "cnc": 44
  },
  {
    "label": "МДФ 10 мм",
    "group": "mdf",
    "laser": 418,
    "cnc": 55
  },
  {
    "label": "МДФ 12 мм",
    "group": "mdf",
    "cnc": 66
  },
  {
    "label": "МДФ 16 мм",
    "group": "mdf",
    "cnc": 99
  },
  {
    "label": "МДФ 18 мм",
    "group": "mdf",
    "cnc": 99
  },
  {
    "label": "МДФ 22 мм",
    "group": "mdf",
    "cnc": 121
  },
  {
    "label": "МДФ 25 мм",
    "group": "mdf",
    "cnc": 137
  },
  {
    "label": "МДФ 6 мм шпон ясень",
    "group": "mdf",
    "cnc": 44
  },
  {
    "label": "ХДФ 3 мм",
    "group": "other",
    "laser": 36
  },
  {
    "label": "ЛХДФ Белая 3 мм",
    "group": "other",
    "laser": 36
  },
  {
    "label": "ДВПО Белая 3 мм",
    "group": "other",
    "laser": 36
  },
  {
    "label": "Шпон бук 2,5 мм",
    "group": "other",
    "laser": 48
  },
  {
    "label": "Шпон дуб 3,5 мм",
    "group": "other",
    "laser": 48
  },
  {
    "label": "Акрил 2 мм",
    "group": "akril",
    "laser": 36
  },
  {
    "label": "Акрил 2 мм молочный",
    "group": "akril",
    "laser": 36
  },
  {
    "label": "Акрил 2 мм серебристый зеркальный",
    "group": "akril",
    "laser": 96
  },
  {
    "label": "Акрил 2 мм золотистый зеркальный",
    "group": "akril",
    "laser": 96
  },
  {
    "label": "Акрил 3 мм",
    "group": "akril",
    "laser": 48
  },
  {
    "label": "Акрил 3 мм молочный",
    "group": "akril",
    "laser": 48
  },
  {
    "label": "Акрил 3 мм белый",
    "group": "akril",
    "laser": 96
  },
  {
    "label": "Акрил 3 мм чёрный",
    "group": "akril",
    "laser": 48
  },
  {
    "label": "Акрил 3 мм красный",
    "group": "akril",
    "laser": 96
  },
  {
    "label": "Акрил 3 мм зеленый",
    "group": "akril",
    "laser": 96
  },
  {
    "label": "Акрил 4 мм",
    "group": "akril",
    "laser": 81
  },
  {
    "label": "Акрил 5 мм",
    "group": "akril",
    "laser": 91
  },
  {
    "label": "Акрил 5 мм молочный",
    "group": "akril",
    "laser": 91
  },
  {
    "label": "Полистирол 5 мм черный",
    "group": "polistirol",
    "cnc": 49
  },
  {
    "label": "Акрил 6 мм",
    "group": "akril",
    "laser": 132
  },
  {
    "label": "Акрил 6 мм молочный",
    "group": "akril",
    "laser": 132
  },
  {
    "label": "Поликарбонат 10 мм 1.7",
    "group": "polikarbonat",
    "cnc": 82
  },
  {
    "label": "Поликарбонат 10 мм 1.5",
    "group": "polikarbonat",
    "cnc": 82
  },
  {
    "label": "Поликарбонат 10 мм 1.25",
    "group": "polikarbonat",
    "cnc": 82
  },
  {
    "label": "Поликарбонат 10 мм 1.04",
    "group": "polikarbonat",
    "cnc": 82
  },
  {
    "label": "Поликарбонат 6 мм",
    "group": "polikarbonat",
    "cnc": 49
  },
  {
    "label": "Полистирол 6 мм",
    "group": "polistirol",
    "cnc": 49
  },
  {
    "label": "Акрил 8 мм",
    "group": "akril",
    "laser": 170
  },
  {
    "label": "Акрил 8 мм молочный",
    "group": "akril",
    "laser": 170
  },
  {
    "label": "Акрил 10 мм",
    "group": "akril",
    "laser": 418
  },
  {
    "label": "ПЭТ 0,5 мм",
    "group": "pet",
    "laser": 31
  },
  {
    "label": "ПЭТ 0,75 мм",
    "group": "pet",
    "laser": 31
  },
  {
    "label": "ПЭТ 0,8 мм золото, с клеевым слоем",
    "group": "pet",
    "laser": 31
  },
  {
    "label": "ПЭТ 1 мм",
    "group": "pet",
    "laser": 36
  },
  {
    "label": "ПЭТ 1 мм золото",
    "group": "pet",
    "laser": 36
  },
  {
    "label": "ПЭТ 1,5 мм",
    "group": "pet",
    "laser": 42
  },
  {
    "label": "ПЭТ 2 мм",
    "group": "pet",
    "laser": 48
  },
  {
    "label": "ПВХ 1 мм",
    "group": "pvh",
    "cnc": 49
  },
  {
    "label": "ПВХ 2 мм",
    "group": "pvh",
    "cnc": 49
  },
  {
    "label": "ПВХ 3 мм",
    "group": "pvh",
    "cnc": 49
  },
  {
    "label": "ПВХ 4 мм",
    "group": "pvh",
    "cnc": 49
  },
  {
    "label": "ПВХ 5 мм",
    "group": "pvh",
    "cnc": 49
  },
  {
    "label": "ПВХ 6 мм",
    "group": "pvh",
    "cnc": 49
  },
  {
    "label": "ПВХ 8 мм",
    "group": "pvh",
    "cnc": 49
  },
  {
    "label": "ПВХ 10 мм",
    "group": "pvh",
    "cnc": 55
  },
  {
    "label": "АБС 1,5 мм для грав. золот./сереб.",
    "group": "abs",
    "laser": 101
  },
  {
    "label": "Гофрокартон 3 мм",
    "group": "karton",
    "laser": 26
  },
  {
    "label": "Микрогофрокартон",
    "group": "karton",
    "laser": 26
  },
  {
    "label": "Меловка",
    "group": "karton",
    "laser": 26
  },
  {
    "label": "Золотая плёнка",
    "group": "other",
    "laser": 26
  },
  {
    "label": "Алюм. композит обыч.",
    "group": "kompozit",
    "cnc": 55
  },
  {
    "label": "Алюм. композит графит",
    "group": "kompozit",
    "cnc": 55
  },
  {
    "label": "Алюм. композит Traffic White G9016 молоч.",
    "group": "kompozit",
    "cnc": 55
  }
]
