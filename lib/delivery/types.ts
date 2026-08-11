/**
 * Общие типы доставки. Провайдеры (СДЭК, Ozon) реализуют один интерфейс,
 * чтобы добавление второго не расползлось по страницам и роутам.
 */

/** Габариты и вес отправления, как их ждут службы доставки. */
export type Parcel = {
  weightGrams: number
  lengthCm:    number
  widthCm:     number
  heightCm:    number
}

/** Вариант доставки, пригодный для показа покупателю. */
export type DeliveryQuote = {
  /** Идентификатор тарифа у провайдера — пригодится при оформлении накладной. */
  code:        number
  name:        string
  priceRub:    number
  /** Срок в рабочих днях; min и max могут совпадать. */
  daysMin:     number | null
  daysMax:     number | null
}

/** Пункт выдачи. */
export type PickupPoint = {
  code:      string
  name:      string
  address:   string
  workTime:  string | null
}

export type DeliveryProviderId = 'cdek' | 'ozon'

/** Куда приезжает заказ: в пункт выдачи (или постамат) либо курьером до двери. */
export type DeliveryDestination = 'pickup' | 'door'

export type DeliveryProvider = {
  id: DeliveryProviderId
  /**
   * Готов ли провайдер считать доставку. False — сайт работает без расчёта:
   * покупатель видит «стоимость сообщит менеджер», оформление не ломается.
   */
  isConfigured(): boolean
  /**
   * Заполнены ли ключи. Отличается от isConfigured: провайдер может иметь
   * ключи, но не иметь реализации (см. ozon.ts) — тогда «настроен» он не
   * становится, иначе это выглядело бы как поломка.
   */
  hasCredentials?(): boolean
  /**
   * Тарифы. `destination` отсекает неподходящие направления: покупателю,
   * выбравшему пункт выдачи, не нужны тарифы «до двери» и наоборот.
   */
  quotes(city: string, parcel: Parcel, destination?: DeliveryDestination): Promise<DeliveryQuote[]>
  points(city: string): Promise<PickupPoint[]>
}
