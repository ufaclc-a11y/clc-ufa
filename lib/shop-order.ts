import { shopItems } from '@/data/shop'

/**
 * Сборка заказа на сервере.
 *
 * Клиент присылает только пары «id + количество». Цены, названия и артикулы
 * берутся из каталога здесь — присланным с клиента суммам доверять нельзя,
 * их легко подменить в браузере.
 */

export const MAX_ORDER_LINES = 50
export const MAX_LINE_QTY    = 99

export type OrderLine = {
  id:    number
  sku:   string
  title: string
  price: number
  qty:   number
  sum:   number
}

export type BuiltOrder = {
  lines:       OrderLine[]
  count:       number
  total:       number
  /** Суммарный вес с упаковкой, г. null — если хоть у одного товара веса нет. */
  weightGrams: number | null
}

export type BuildResult =
  | { ok: true;  order: BuiltOrder }
  | { ok: false; error: string }

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Собирает заказ из присланных строк, пересчитывая всё по каталогу. */
export function buildOrder(input: unknown): BuildResult {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: 'Корзина пуста' }
  }
  if (input.length > MAX_ORDER_LINES) {
    return { ok: false, error: 'Слишком много позиций в заказе' }
  }

  /*
   * Одинаковые id складываем, чтобы не плодить дубли строк в письме.
   * Порядок сохраняем отдельным массивом: цель TS в проекте не позволяет
   * итерировать Map напрямую.
   */
  const qtyById = new Map<number, number>()
  const order: number[] = []

  for (const raw of input) {
    if (!isPlainObject(raw)) return { ok: false, error: 'Некорректная позиция заказа' }

    const { id, qty } = raw
    if (typeof id !== 'number' || !Number.isInteger(id)) {
      return { ok: false, error: 'Некорректный идентификатор товара' }
    }
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > MAX_LINE_QTY) {
      return { ok: false, error: 'Некорректное количество товара' }
    }

    if (!qtyById.has(id)) order.push(id)
    const merged = (qtyById.get(id) ?? 0) + qty
    if (merged > MAX_LINE_QTY) {
      return { ok: false, error: `Максимум ${MAX_LINE_QTY} шт. одного товара` }
    }
    qtyById.set(id, merged)
  }

  const lines: OrderLine[] = []
  let weightKnown = true
  let weightGrams = 0

  for (const id of order) {
    const qty  = qtyById.get(id)!
    const item = shopItems.find(i => i.id === id)
    if (!item) return { ok: false, error: 'Товар больше не доступен — обновите корзину' }
    if (!item.inStock) return { ok: false, error: `«${item.title}» нет в наличии` }

    lines.push({
      id:    item.id,
      sku:   item.sku,
      title: item.title,
      price: item.price,
      qty,
      sum:   item.price * qty,
    })

    const w = item.packaging?.weightGrams
    if (typeof w === 'number') weightGrams += w * qty
    else weightKnown = false
  }

  return {
    ok: true,
    order: {
      lines,
      count:       lines.reduce((a, l) => a + l.qty, 0),
      total:       lines.reduce((a, l) => a + l.sum, 0),
      weightGrams: weightKnown ? weightGrams : null,
    },
  }
}

/** Короткий номер заказа для переписки: без БД он не обязан быть сквозным. */
export function orderNumber(now = new Date()): string {
  const d = now.toISOString().slice(2, 10).replace(/-/g, '')
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${d}-${rnd}`
}

/** Способы получения, которые принимает форма. */
export const DELIVERY_METHODS = {
  pickup:  'Самовывоз, Уфа',
  cdek:    'СДЭК до пункта выдачи',
  ozon:    'Ozon, пункт выдачи',
  russian: 'Почта России',
} as const

export type DeliveryMethod = keyof typeof DELIVERY_METHODS

export function isDeliveryMethod(v: unknown): v is DeliveryMethod {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(DELIVERY_METHODS, v)
}

export function deliveryDestinationError({
  delivery,
  city,
  address,
  pointAddress,
}: {
  delivery: DeliveryMethod
  city: string
  address: string
  pointAddress: string
}): string | null {
  if (delivery === 'pickup') return null
  if (!city.trim()) return 'Укажите город доставки'
  if (delivery === 'russian' && !address.trim()) return 'Укажите адрес доставки'
  if ((delivery === 'cdek' || delivery === 'ozon') && !pointAddress.trim() && !address.trim()) {
    return 'Выберите пункт выдачи или укажите его адрес'
  }
  return null
}
