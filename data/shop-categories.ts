export type ShopCategory = {
  id: string
  name: string
  emoji: string
}

export const shopCategories: ShopCategory[] = [
  { id: 'all', name: 'Все товары', emoji: '🛍️' },
  { id: 'dekor', name: 'Декорации настенные', emoji: '🏄' },
  { id: 'runy', name: 'Руны и алтари', emoji: '🔮' },
  { id: 'konstruktory', name: 'Конструкторы', emoji: '🧩' },
  { id: 'lustry', name: 'Люстры', emoji: '💡' },
  { id: 'kormushki', name: 'Кормушки', emoji: '🐦' },
  { id: 'zagotovki', name: 'Заготовки', emoji: '🪵' },
  { id: 'stellazhi', name: 'Стеллажи', emoji: '📚' },
  { id: 'organajzery', name: 'Органайзеры', emoji: '🔧' },
  { id: 'klyuchnitsy', name: 'Ключницы', emoji: '🗝️' },
  { id: 'kopilki', name: 'Копилки', emoji: '🐷' },
  { id: 'orgsteklo', name: 'Оргстекло', emoji: '💎' },
]
