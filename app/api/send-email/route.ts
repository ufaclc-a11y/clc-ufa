import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { business } from '@/data/contacts'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import {
  MAX_FILES, MAX_FIELD_LEN, isSpam, hasContact, checkAttachment, escapeHtml,
} from '@/lib/order-validation'

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

// Лимиты защиты от злоупотреблений — в lib/order-validation.ts (покрыты тестами,
// дублируют клиентскую проверку OrderForm).

// Лимит подачи заявок с одного IP: 5 запросов за 10 минут.
const RL_LIMIT  = 5
const RL_WINDOW = 10 * 60 * 1000

export async function POST(req: Request) {
  try {
    // Анти-флуд по IP — до парсинга тела, чтобы отсекать большие payload'ы.
    const rl = rateLimit(`send-email:${clientIp(req)}`, RL_LIMIT, RL_WINDOW)
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Слишком много заявок за короткое время. Попробуйте через несколько минут или напишите в мессенджер.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      )
    }

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
          const check = checkAttachment(value.name, value.size, totalBytes)
          if (!check.ok) {
            return NextResponse.json({ error: check.error }, { status: check.status })
          }
          totalBytes += value.size
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
    if (isSpam(body)) {
      return NextResponse.json({ ok: true })
    }

    // Требуем хотя бы контакт — отсекаем пустые автозапросы
    if (!hasContact(body)) {
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

    // Пользовательский ввод экранируем — иначе заявка может вставить в письмо свой HTML
    const esc = (v: string | undefined) => (v ? escapeHtml(v) : v)
    const lines = [
      body.name     && `<b>Имя:</b> ${esc(body.name)}`,
      body.contact  && `<b>Контакт:</b> ${esc(body.contact)}`,
      body.product  && `<b>Изделие:</b> ${esc(body.product)}`,
      body.size     && `<b>Размер:</b> ${esc(body.size)}`,
      body.qty      && `<b>Количество:</b> ${esc(body.qty)}`,
      body.material && `<b>Материал:</b> ${esc(body.material)}`,
      body.urgency  && `<b>Срочность:</b> ${esc(urgencyLabels[body.urgency] ?? body.urgency)}`,
      body.comment  && `<b>Комментарий:</b> ${esc(body.comment)}`,
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
          <p style="font-size:12px;color:#6E6A64;margin-top:16px">Заявка отправлена через сайт Центра лазерной резки clc-ufa.ru</p>
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
