'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { shopItems, type ShopItem } from '@/data/shop'
import { trackGoal } from '@/lib/analytics'

/**
 * Корзина живёт в localStorage. Хранится ТОЛЬКО id и количество — цена, название
 * и фото всегда берутся из каталога при отрисовке. Иначе у покупателя со старой
 * корзиной осталась бы неактуальная цена, а на сервере всё равно пересчитываем.
 */
const STORAGE_KEY = 'clc-cart-v1'
const MAX_QTY = 99

export type CartLine = { id: number; qty: number }

/** Строка корзины, дополненная данными товара из каталога. */
export type CartEntry = { item: ShopItem; qty: number; sum: number }

type CartContextValue = {
  lines:      CartLine[]
  entries:    CartEntry[]
  count:      number
  total:      number
  /** Гидратация завершена — до неё счётчик не показываем, чтобы не мигал. */
  ready:      boolean
  add:        (id: number, qty?: number) => void
  setQty:     (id: number, qty: number) => void
  remove:     (id: number) => void
  clear:      () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Чужие/устаревшие записи молча отбрасываем — корзина не критичные данные.
    return parsed
      .filter((l): l is CartLine =>
        !!l && typeof l === 'object' &&
        typeof (l as CartLine).id === 'number' &&
        typeof (l as CartLine).qty === 'number')
      .map(l => ({ id: l.id, qty: clampQty(l.qty) }))
      .filter(l => shopItems.some(i => i.id === l.id))
  } catch {
    return []
  }
}

const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(n) || 1))

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)

  /*
   * localStorage доступен только в браузере, поэтому читаем после монтирования.
   * Правило react-hooks предупреждает о setState внутри эффекта, но здесь это
   * оправдано: на сервере корзина неизвестна, а инициализация состояния из
   * localStorage напрямую дала бы расхождение разметки при гидратации.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readStorage())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* приватный режим или переполнение — корзина просто не переживёт перезагрузку */
    }
  }, [lines, ready])

  const add = useCallback((id: number, qty = 1) => {
    setLines(prev => {
      const existing = prev.find(l => l.id === id)
      if (existing) {
        return prev.map(l => l.id === id ? { ...l, qty: clampQty(l.qty + qty) } : l)
      }
      return [...prev, { id, qty: clampQty(qty) }]
    })
    trackGoal('add_to_cart', { id })
  }, [])

  const setQty = useCallback((id: number, qty: number) => {
    setLines(prev => qty <= 0
      ? prev.filter(l => l.id !== id)
      : prev.map(l => l.id === id ? { ...l, qty: clampQty(qty) } : l))
  }, [])

  const remove = useCallback((id: number) => {
    setLines(prev => prev.filter(l => l.id !== id))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const entries = useMemo<CartEntry[]>(() => {
    return lines.flatMap(l => {
      const item = shopItems.find(i => i.id === l.id)
      // Товар мог исчезнуть из каталога между визитами — пропускаем.
      return item ? [{ item, qty: l.qty, sum: item.price * l.qty }] : []
    })
  }, [lines])

  const value = useMemo<CartContextValue>(() => ({
    lines,
    entries,
    count: entries.reduce((a, e) => a + e.qty, 0),
    total: entries.reduce((a, e) => a + e.sum, 0),
    ready,
    add, setQty, remove, clear,
  }), [lines, entries, ready, add, setQty, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart вызван вне <CartProvider>')
  return ctx
}
