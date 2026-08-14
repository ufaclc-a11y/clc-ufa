import { cdek } from './cdek'
import { ozon } from './ozon'
import { russianPost } from './russian-post'
import type { DeliveryProvider, DeliveryProviderId } from './types'

/**
 * Реестр служб доставки. Роуты /api/delivery/* работают через него, а не с
 * конкретной службой — добавление провайдера сводится к одной строке здесь.
 */
export const providers: Record<DeliveryProviderId, DeliveryProvider> = {
  cdek,
  ozon,
  russian: russianPost,
}

export function isProviderId(v: unknown): v is DeliveryProviderId {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(providers, v)
}

/**
 * Провайдер по идентификатору или null.
 *
 * Именно null, а не «служба по умолчанию»: для самовывоза или будущего способа
 * без интеграции подстановка СДЭК показала бы покупателю чужие тарифы.
 */
export function getProvider(v: unknown): DeliveryProvider | null {
  return isProviderId(v) ? providers[v] : null
}
