import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const token  = process.env.TG_BOT_TOKEN
    const chatId = process.env.TG_CHAT_ID

    // Accept both JSON and FormData
    const contentType = req.headers.get('content-type') ?? ''
    let body: Record<string, string> = {}
    let files: File[] = []

    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData()
      fd.forEach((value, key) => {
        if (key === 'files' && value instanceof File && value.size > 0) {
          files.push(value)
        } else if (typeof value === 'string') {
          body[key] = value
        }
      })
    } else {
      body = await req.json()
    }

    if (!token || !chatId) {
      // Режим разработки без переменных — логируем и возвращаем успех
      console.log('📩 Новая заявка (TG не настроен):', body, 'files:', files.map(f => f.name))
      return NextResponse.json({ ok: true })
    }

    const tgBase = `https://api.telegram.org/bot${token}`

    const contactMethodLabels: Record<string, string> = {
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      max:      'Макс',
      phone:    'Телефон',
    }
    const urgencyLabels: Record<string, string> = {
      calm:  'Не горит',
      days:  '1–3 дня',
      today: 'Срочно сегодня',
    }

    const lines = [
      '📋 *Новая заявка — Центр лазерной резки*',
      '',
      body.name          ? `👤 Имя: ${body.name}`                                                              : null,
      body.contact       ? `📞 Контакт: ${body.contact}`                                                      : null,
      body.contactMethod ? `📲 Связаться через: ${contactMethodLabels[body.contactMethod] ?? body.contactMethod}` : null,
      body.urgency       ? `⏱ Срочность: ${urgencyLabels[body.urgency] ?? body.urgency}`                     : null,
      body.product       ? `📦 Изделие: ${body.product}`                                                      : null,
      body.size          ? `📐 Размер: ${body.size}`                                                          : null,
      body.qty           ? `🔢 Количество: ${body.qty}`                                                       : null,
      body.material      ? `🪵 Материал: ${body.material}`                                                    : null,
      body.comment       ? `💬 Комментарий: ${body.comment}`                                                  : null,
      files.length       ? `📎 Файлов: ${files.length}`                                                       : null,
    ].filter(Boolean).join('\n')

    // 1. Send text message
    const msgRes = await fetch(`${tgBase}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    chatId,
        text:       lines,
        parse_mode: 'Markdown',
      }),
    })

    if (!msgRes.ok) {
      const err = await msgRes.text()
      console.error('Telegram sendMessage error:', err)
      return NextResponse.json({ error: 'Ошибка отправки в Telegram' }, { status: 502 })
    }

    // 2. Send files (if any) as a media group or individual documents
    if (files.length > 0) {
      for (const file of files) {
        const formData = new FormData()
        formData.append('chat_id', chatId)
        formData.append('document', file, file.name)
        formData.append('caption', `Файл от заявки: ${body.contact ?? 'неизвестно'}`)

        const fileRes = await fetch(`${tgBase}/sendDocument`, {
          method: 'POST',
          body:   formData,
        })

        if (!fileRes.ok) {
          console.error('Telegram sendDocument error for', file.name, await fileRes.text())
          // Don't fail the whole request if one file fails
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('send-order error:', e)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
