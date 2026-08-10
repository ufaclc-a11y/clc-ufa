import { shopItems } from '@/data/shop'
import type { Parcel } from './types'

/**
 * Сборка отправления из строк заказа.
 *
 * Считаем, что всё едет одной коробкой: товары складываются стопкой, поэтому
 * длина и ширина — максимальные среди позиций, а высоты суммируются. Это
 * завышает объём для мелочи рядом с крупным товаром, но никогда не занижает,
 * а занижение здесь опаснее: доставка окажется дороже расчёта, и разницу
 * платит магазин.
 *
 * Если хотя бы у одного товара нет веса или габаритов — расчёт невозможен,
 * возвращаем null. Подставлять «примерные» значения нельзя: покупатель увидит
 * цену, которая не совпадёт с реальной.
 */

export type ParcelLine = { id: number; qty: number }

export type ParcelResult =
  | { ok: true;  parcel: Parcel }
  | { ok: false; reason: 'empty' | 'unknown-item' | 'no-dimensions'; missing?: string[] }

export function buildParcel(lines: ParcelLine[]): ParcelResult {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { ok: false, reason: 'empty' }
  }

  let weightGrams = 0
  let lengthCm    = 0
  let widthCm     = 0
  let heightCm    = 0
  const missing: string[] = []

  for (const line of lines) {
    const item = shopItems.find(i => i.id === line.id)
    if (!item) return { ok: false, reason: 'unknown-item' }

    const p = item.packaging
    const complete =
      typeof p?.weightGrams  === 'number' &&
      typeof p?.packLengthCm === 'number' &&
      typeof p?.packWidthCm  === 'number' &&
      typeof p?.packHeightCm === 'number'

    if (!complete) {
      missing.push(item.title)
      continue
    }

    weightGrams += p!.weightGrams! * line.qty
    lengthCm     = Math.max(lengthCm, p!.packLengthCm!)
    widthCm      = Math.max(widthCm,  p!.packWidthCm!)
    heightCm    += p!.packHeightCm! * line.qty
  }

  if (missing.length) return { ok: false, reason: 'no-dimensions', missing }

  return {
    ok: true,
    parcel: {
      weightGrams: Math.round(weightGrams),
      // СДЭК ждёт целые сантиметры и не принимает нули.
      lengthCm: Math.max(1, Math.ceil(lengthCm)),
      widthCm:  Math.max(1, Math.ceil(widthCm)),
      heightCm: Math.max(1, Math.ceil(heightCm)),
    },
  }
}
