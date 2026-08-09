import { NextRequest, NextResponse } from 'next/server'
import { parseWbImageUrl } from '@/lib/wb-cdn'
import { rateLimit, clientIp } from '@/lib/rate-limit'

/*
 * Эндпоинт открытый и на каждый запрос ходит наружу, поэтому без лимита он
 * работает усилителем трафика: чужой скрипт может качать через сервер картинки
 * WB, а мы платим каналом в обе стороны. Ограничиваем частоту и размер ответа.
 */
const RL_LIMIT     = 120                 // запросов
const RL_WINDOW    = 60 * 1000           // за минуту с одного IP
const MAX_BYTES    = 8 * 1024 * 1024     // картинка карточки заведомо меньше

// Proxy WB CDN images to bypass hotlink protection
export async function GET(req: NextRequest) {
  const target = parseWbImageUrl(req.nextUrl.searchParams.get('url'))
  if (!target) {
    return new NextResponse('Bad request', { status: 400 })
  }

  const rl = rateLimit(`wb-img:${clientIp(req)}`, RL_LIMIT, RL_WINDOW)
  if (!rl.ok) {
    return new NextResponse('Too many requests', {
      status:  429,
      headers: { 'Retry-After': String(rl.retryAfter) },
    })
  }

  try {
    const res = await fetch(target.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.wildberries.ru/',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      next: { revalidate: 86400 }, // cache 24h on server
    })

    if (!res.ok) {
      return new NextResponse('Image not found', { status: 404 })
    }

    // Отдаём только картинки: апстрим ограничен CDN WB, но тип не наследуем вслепую.
    const upstreamType = res.headers.get('content-type') || ''
    const contentType  = upstreamType.startsWith('image/') ? upstreamType : 'image/webp'

    const declared = Number(res.headers.get('content-length') ?? 0)
    if (declared > MAX_BYTES) {
      return new NextResponse('Image too large', { status: 502 })
    }

    const buffer = await res.arrayBuffer()
    if (buffer.byteLength > MAX_BYTES) {
      return new NextResponse('Image too large', { status: 502 })
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    return new NextResponse('Failed to fetch image', { status: 502 })
  }
}
