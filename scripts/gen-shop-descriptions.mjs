/*
 * Собирает полные описания товаров магазина из data/wb-products-raw.json
 * в data/shop-descriptions.generated.ts.
 *
 * Зачем отдельным модулем: `desc` в data/shop.ts обрезан ~250 символами для
 * карточки в списке, а ShopClient — клиентский компонент. Если положить полные
 * тексты (медиана ~1500 символов × 67) в тот же массив, они уедут в браузерный
 * бандл. Этот модуль импортируют только серверные страницы товара.
 *
 * Сети не требует. Запуск: npm run gen:shop-descriptions
 */

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const RAW  = path.join(ROOT, 'data', 'wb-products-raw.json')
const OUT  = path.join(ROOT, 'data', 'shop-descriptions.generated.ts')

/** Нормализуем переводы строк и убираем висящие пробелы, абзацы сохраняем. */
function clean(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const products = JSON.parse(fs.readFileSync(RAW, 'utf8'))

const rows = []
const empty = []
for (const p of [...products].sort((a, b) => a.id - b.id)) {
  const text = clean(p.description)
  if (!text) { empty.push(`${p.id} ${p.title}`); continue }
  rows.push(`  ${p.id}: ${JSON.stringify(text)},`)
}

const out = `/* АВТОГЕНЕРАЦИЯ — не редактировать вручную.
 * Источник: data/wb-products-raw.json
 * Обновить: npm run gen:shop-descriptions
 * Собрано: ${new Date().toISOString().slice(0, 10)}
 *
 * Импортировать только из серверных компонентов: тексты объёмные и в
 * клиентский бандл им попадать не нужно.
 */

/** Полные описания товаров магазина, по id. Абзацы разделены \\n\\n. */
export const shopDescriptions: Record<number, string> = {
${rows.join('\n')}
}
`

fs.writeFileSync(OUT, out)

const chars = rows.reduce((a, r) => a + r.length, 0)
console.log(`Описаний записано: ${rows.length} (${Math.round(chars / 1024)} КБ)`)
if (empty.length) {
  console.log(`Без описания: ${empty.length}`)
  empty.forEach(e => console.log(`  · ${e}`))
}
console.log('→ data/shop-descriptions.generated.ts')
