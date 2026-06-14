import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { business } from '@/data/contacts'

// Создаём транспортер один раз на весь процесс (DNS резолвится при первом sendMail)
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
    connectionTimeout: 180_000,  // 3 минуты — перекрываем медленный DNS
    greetingTimeout:   30_000,
    socketTimeout:     60_000,
  })
  return _transporter
}

// Прогреваем соединение сразу при старте модуля (не ждём первый запрос)
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  getTransporter().verify().catch(() => { /* тихая ошибка при старте */ })
}

// Лимиты защиты от злоупотреблений (дублируют клиентскую проверку OrderForm)
const MAX_FILES      = 5
const MAX_FILE_BYTES = 20 * 1024 * 1024   // 20 МБ на файл
const MAX_TOTAL_BYTES = 40 * 1024 * 1024  // 40 МБ суммарно
const MAX_FIELD_LEN  = 2000               // максимум символов в текстовом поле
const ALLOWED_EXT = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'ai', 'eps', 'svg', 'dxf', 'cdr', 'zip',
])

export async function POST(req: Request) {
  try {
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const toEmail  = process.env.SMTP_TO?.trim() || business.email

    // Парсим FormData (поддерживаем файлы) или JSON
    const contentType = req.headers.get('content-type') ?? ''
    const body: Record<string, string> = {}
    const attachments: { filename: string; content: Buffer }[] = []
    let totalBytes = 0

    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData()
      const entries = Array.from(fd.entries())
      for (const [key, value] of entries) {
        if (key === 'files' && value instanceof File && value.size > 0) {
          if (attachments.length >= MAX_FILES) continue
          const ext = value.name.split('.').pop()?.toLowerCase() ?? ''
          if (!ALLOWED_EXT.has(ext)) {
            return NextResponse.json({ error: `Недопустимый тип файла: ${value.name}` }, { status: 400 })
          }
          if (value.size > MAX_FILE_BYTES) {
            return NextResponse.json({ error: `Файл слишком большой: ${value.name}` }, { status: 413 })
          }
          totalBytes += value.size
          if (totalBytes > MAX_TOTAL_BYTES) {
            return NextResponse.json({ error: 'Суммарный размер файлов превышает лимит' }, { status: 413 })
          }
          const buf = Buffer.from(await value.arrayBuffer())
          attachments.push({ filename: value.name, content: buf })
        } else if (typeof value === 'string') {
          body[key] = value.slice(0, MAX_FIELD_LEN)
        }
      }
    } else {
      Object.assign(body, await req.json())
    }

    // Honeypot: поле скрыто от людей, заполняют только боты — тихо «успех», ничего не шлём
    if (body.company && body.company.trim() !== '') {
      return NextResponse.json({ ok: true })
    }

    // Требуем хотя бы контакт — отсекаем пустые автозапросы
    if (!body.contact || body.contact.trim() === '') {
      return NextResponse.json({ error: 'Укажите контакт для связи' }, { status: 400 })
    }

    // Dev-режим без SMTP — возвращаем успех, не логируя данные клиента
    if (!smtpUser || !smtpPass) {
      return NextResponse.json({ ok: true })
    }

    const urgencyLabels: Record<string, string> = {
      calm:  'Не срочно',
      days:  '1–3 дня',
      today: 'Срочно сегодня',
    }

    const lines = [
      body.name     && `<b>Имя:</b> ${body.name}`,
      body.contact  && `<b>Контакт:</b> ${body.contact}`,
      body.product  && `<b>Изделие:</b> ${body.product}`,
      body.size     && `<b>Размер:</b> ${body.size}`,
      body.qty      && `<b>Количество:</b> ${body.qty}`,
      body.material && `<b>Материал:</b> ${body.material}`,
      body.urgency  && `<b>Срочность:</b> ${urgencyLabels[body.urgency] ?? body.urgency}`,
      body.comment  && `<b>Комментарий:</b> ${body.comment}`,
      attachments.length && `<b>Файлов:</b> ${attachments.length}`,
    ].filter(Boolean)

    await getTransporter().sendMail({
      from:    `"Центр лазерной резки" <${smtpUser}>`,
      to:      toEmail,
      subject: `Заявка с сайта${body.name ? ` от ${body.name}` : ''}`,
      html: `
        <div style="font-family:Arial,sans-serif;font-size:15px;color:#1A1A1A;max-width:560px">
          <div style="background:#FF6B00;padding:16px 24px;border-radius:8px 8px 0 0">
            <span style="color:white;font-weight:700;font-size:17px">📋 Новая заявка — Центр лазерной резки</span>
          </div>
          <div style="background:#F5F4F0;padding:24px;border-radius:0 0 8px 8px;line-height:2">
            ${lines.join('<br/>')}
          </div>
          <p style="font-size:12px;color:#8A8680;margin-top:16px">Заявка отправлена через сайт Центра лазерной резки clc-ufa.ru</p>
        </div>
      `,
      attachments,
    })

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error('send-email error:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Не удалось отправить письмо. Попробуйте написать в мессенджер.' }, { status: 500 })
  }
}
