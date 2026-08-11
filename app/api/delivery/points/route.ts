import { NextResponse } from 'next/server'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { getProvider } from '@/lib/delivery/providers'

/** Пункты выдачи по городу. Свой список вместо стороннего виджета — CSP. */

const RL_LIMIT  = 30
const RL_WINDOW = 60 * 1000
const MAX_POINTS = 200

export async function GET(req: Request) {
  const rl = rateLimit(`delivery-points:${clientIp(req)}`, RL_LIMIT, RL_WINDOW)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Слишком много запросов, подождите немного' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  const params   = new URL(req.url).searchParams
  const provider = getProvider(params.get('provider'))

  if (!provider || !provider.isConfigured()) {
    return NextResponse.json({ configured: false, provider: provider?.id ?? null, points: [] })
  }

  const city = params.get('city')?.trim()
  if (!city) {
    return NextResponse.json({ error: 'Укажите город' }, { status: 400 })
  }

  try {
    const points = await provider.points(city)
    return NextResponse.json({ configured: true, provider: provider.id, points: points.slice(0, MAX_POINTS) })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Не удалось получить список пунктов выдачи'
    console.error('delivery points:', message)
    return NextResponse.json({ configured: true, points: [], notice: message })
  }
}
