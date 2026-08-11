import { NextResponse } from 'next/server'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { buildParcel } from '@/lib/delivery/packaging'
import { getProvider } from '@/lib/delivery/providers'

/*
 * Расчёт доставки. Браузер ходит только сюда: CSP запрещает обращения к
 * сторонним хостам, а ключи СДЭК не должны покидать сервер.
 *
 * Если ключей нет — отвечаем 200 с configured:false, а не ошибкой: магазин
 * должен работать и без интеграции, стоимость тогда называет менеджер.
 */

const RL_LIMIT  = 30
const RL_WINDOW = 60 * 1000

export async function POST(req: Request) {
  const rl = rateLimit(`delivery:${clientIp(req)}`, RL_LIMIT, RL_WINDOW)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Слишком много запросов, подождите немного' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })
  }

  const { city, lines, provider: providerId } = body as
    { city?: unknown; lines?: unknown; provider?: unknown }

  const provider = getProvider(providerId)
  if (!provider || !provider.isConfigured()) {
    return NextResponse.json({ configured: false, provider: provider?.id ?? null, quotes: [] })
  }
  if (typeof city !== 'string' || !city.trim()) {
    return NextResponse.json({ error: 'Укажите город' }, { status: 400 })
  }

  const parcel = buildParcel(
    Array.isArray(lines)
      ? lines.filter((l): l is { id: number; qty: number } =>
          !!l && typeof l === 'object' &&
          typeof (l as { id?: unknown }).id === 'number' &&
          typeof (l as { qty?: unknown }).qty === 'number')
      : [],
  )

  if (!parcel.ok) {
    const message = parcel.reason === 'no-dimensions'
      ? 'Для части товаров не заданы габариты — стоимость доставки сообщит менеджер'
      : parcel.reason === 'empty'
        ? 'Корзина пуста'
        : 'Товар недоступен — обновите корзину'
    // Не ошибка сервера: корзину показываем дальше, просто без расчёта.
    return NextResponse.json({ configured: true, quotes: [], notice: message })
  }

  try {
    /*
     * В оформлении обе службы предлагаются только «до пункта выдачи», поэтому
     * тарифы до двери отсекаем: покупателю, выбравшему ПВЗ, они не нужны и
     * лишь путают более высокой ценой.
     */
    const quotes = await provider.quotes(city, parcel.parcel, 'pickup')
    return NextResponse.json({ configured: true, provider: provider.id, quotes, parcel: parcel.parcel })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Не удалось рассчитать доставку'
    console.error('delivery calculate:', message)
    return NextResponse.json({ configured: true, quotes: [], notice: message })
  }
}
