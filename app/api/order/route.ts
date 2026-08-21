import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { business } from '@/data/contacts'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { escapeHtml, isPlausibleContact, MAX_FIELD_LEN } from '@/lib/order-validation'
import {
  buildOrder, orderNumber, DELIVERY_METHODS, deliveryDestinationError, isDeliveryMethod,
} from '@/lib/shop-order'

/*
 * Заказ из магазина. Отличается от /api/send-email тем, что состав и сумма
 * пересчитываются на сервере по каталогу — присланным ценам не доверяем.
 * Оплата не принимается: менеджер согласовывает заказ и присылает ссылку.
 */

let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null

function getTransporter() {
  if (_transporter) return _transporter
  _transporter = nodemailer.createTransport({
    host:              process.env.SMTP_HOST ?? 'smtp.mail.ru',
    port:              Number(process.env.SMTP_PORT ?? 465),
    secure:            Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 180_000,
    greetingTimeout:   30_000,
    socketTimeout:     60_000,
  })
  return _transporter
}

const RL_LIMIT  = 5
const RL_WINDOW = 10 * 60 * 1000

const str = (v: unknown) =>
  typeof v === 'string' ? v.trim().slice(0, MAX_FIELD_LEN) : ''

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`order:${clientIp(req)}`, RL_LIMIT, RL_WINDOW)
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Слишком много заказов за короткое время. Попробуйте через несколько минут или напишите в мессенджер.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })
    }

    const b = body as Record<string, unknown>

    // Honeypot: поле скрыто от людей. Заполнено — тихо отвечаем «ок», письмо не шлём.
    if (str(b.company)) return NextResponse.json({ ok: true, order: orderNumber() })

    const name     = str(b.name)
    const contact  = str(b.contact)
    const comment  = str(b.comment)
    const city     = str(b.city)
    const address  = str(b.address)
    const delivery = isDeliveryMethod(b.delivery) ? b.delivery : null

    if (!isPlausibleContact(contact)) {
      return NextResponse.json({ error: 'Укажите телефон, e-mail или ник в мессенджере' }, { status: 400 })
    }
    if (!delivery) {
      return NextResponse.json({ error: 'Выберите способ получения' }, { status: 400 })
    }
    const pointAddr = str(b.pointAddress)
    const destinationError = deliveryDestinationError({ delivery, city, address, pointAddress: pointAddr })
    if (destinationError) {
      return NextResponse.json({ error: destinationError }, { status: 400 })
    }

    const built = buildOrder(b.lines)
    if (!built.ok) {
      return NextResponse.json({ error: built.error }, { status: 400 })
    }
    const { lines, count, total, weightGrams } = built.order

    const number = orderNumber()
    const esc = (v: string) => escapeHtml(v)

    const rows = lines.map(l => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E0">${esc(l.title)}<br>
          <span style="color:#6E6A64;font-size:12px">арт. ${esc(l.sku)}</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E0;text-align:center;white-space:nowrap">${l.qty} шт.</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E6E0;text-align:right;white-space:nowrap">${l.sum.toLocaleString('ru-RU')} ₽</td>
      </tr>`).join('')

    /*
     * Тариф и пункт выдачи покупатель выбирает в браузере, поэтому пометим их
     * как выбор клиента: сумму доставки перед выставлением счёта менеджер
     * должен сверить, а не принимать на веру.
     */
    const quoteName   = str(b.quoteName)
    const quotePrice  = typeof b.quotePrice === 'number' && b.quotePrice > 0 ? Math.ceil(b.quotePrice) : null
    const pointCode   = str(b.pointCode)
    const details = [
      name    && `<b>Имя:</b> ${esc(name)}`,
      `<b>Контакт:</b> ${esc(contact)}`,
      `<b>Получение:</b> ${DELIVERY_METHODS[delivery]}`,
      city    && `<b>Город:</b> ${esc(city)}`,
      pointAddr && `<b>Пункт выдачи:</b> ${esc(pointAddr)}${pointCode ? ` (${esc(pointCode)})` : ''}`,
      address && `<b>Адрес:</b> ${esc(address)}`,
      quoteName && `<b>Тариф (выбор покупателя):</b> ${esc(quoteName)}${
        quotePrice !== null ? ` — ${quotePrice.toLocaleString('ru-RU')} ₽, сверьте перед счётом` : ''}`,
      weightGrams !== null && `<b>Вес с упаковкой:</b> ${(weightGrams / 1000).toFixed(2)} кг`,
      comment && `<b>Комментарий:</b> ${esc(comment)}`,
    ].filter(Boolean).join('<br/>')

    await getTransporter().sendMail({
      from:    `"Центр лазерной резки" <${process.env.SMTP_USER}>`,
      to:      process.env.SMTP_TO?.trim() || business.email,
      subject: `Заказ ${number} на ${total.toLocaleString('ru-RU')} ₽ — магазин`,
      html: `
        <div style="font-family:Arial,sans-serif;font-size:15px;color:#1A1A1A;max-width:620px">
          <div style="background:#FF6B00;padding:16px 24px;border-radius:8px 8px 0 0">
            <span style="color:white;font-weight:700;font-size:17px">🛒 Заказ ${number} — Центр лазерной резки</span>
          </div>
          <div style="background:#F5F4F0;padding:24px;border-radius:0 0 8px 8px">
            <div style="line-height:2;margin-bottom:16px">${details}</div>
            <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden">
              ${rows}
              <tr>
                <td style="padding:12px;font-weight:700">Итого (${count} шт.)</td>
                <td></td>
                <td style="padding:12px;text-align:right;font-weight:700;white-space:nowrap">${total.toLocaleString('ru-RU')} ₽</td>
              </tr>
            </table>
            <p style="font-size:13px;color:#6E6A64;margin-top:16px">
              Оплата не принята. Свяжитесь с покупателем, согласуйте доставку и вышлите ссылку на оплату.
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true, order: number, total })
  } catch (e: unknown) {
    console.error('order error:', e instanceof Error ? e.message : e)
    return NextResponse.json(
      { error: 'Не удалось оформить заказ. Попробуйте ещё раз или напишите в мессенджер.' },
      { status: 500 },
    )
  }
}
