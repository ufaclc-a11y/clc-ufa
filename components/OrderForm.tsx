'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { business } from '@/data/contacts'
import { trackGoal } from '@/lib/analytics'

type Urgency = 'calm' | 'days' | 'today'

type FormState = {
  name:     string
  contact:  string
  urgency:  Urgency | ''
  product:  string
  size:     string
  qty:      string
  material: string
  comment:  string
  agreed:   boolean
}

const EMPTY: FormState = {
  name: '', contact: '', urgency: '',
  product: '', size: '', qty: '', material: '', comment: '', agreed: false,
}

const LS_KEY = 'clc-order-form'

const URGENCY_OPTIONS: { key: Urgency; label: string; hint: string }[] = [
  { key: 'calm',  label: 'Не горит',       hint: 'несколько дней' },
  { key: 'days',  label: '1–3 дня',        hint: 'стандартный срок' },
  { key: 'today', label: 'Срочно сегодня', hint: 'доплата за срочность' },
]

const URGENCY_LABELS: Record<Urgency, string> = {
  calm:  'Не срочно',
  days:  '1–3 дня',
  today: 'Срочно сегодня',
}

const MAX_SIZE_MB = 20

function buildMessage(form: FormState, files: File[]): string {
  const lines: string[] = ['Заявка с сайта clc-ufa.ru', '']
  if (form.name)     lines.push(`Имя: ${form.name}`)
  if (form.contact)  lines.push(`Контакт: ${form.contact}`)
  if (form.product)  lines.push(`Изделие: ${form.product}`)
  if (form.size)     lines.push(`Размер: ${form.size}`)
  if (form.qty)      lines.push(`Количество: ${form.qty}`)
  if (form.material) lines.push(`Материал: ${form.material}`)
  if (form.urgency)  lines.push(`Срочность: ${URGENCY_LABELS[form.urgency]}`)
  if (form.comment)  lines.push(`Комментарий: ${form.comment}`)
  if (files.length)  lines.push(`\nФайлы (вышлю следующим сообщением): ${files.map(f => f.name).join(', ')}`)
  return lines.join('\n')
}

type Channel = 'email' | 'max' | 'telegram' | 'whatsapp'

function buildUrl(channel: Channel, msg: string): string {
  const enc = encodeURIComponent(msg)
  switch (channel) {
    case 'email':
      return `mailto:${business.email}?subject=${encodeURIComponent('Заявка — Центр лазерной резки')}&body=${enc}`
    case 'max':
      return `${business.max}?text=${enc}`
    case 'telegram':
      return `https://t.me/clcufa?text=${enc}`
    case 'whatsapp':
      return `https://wa.me/79374838003?text=${enc}`
  }
}

const inputCls =
  'w-full border border-[#E8E6E0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] ' +
  'placeholder:text-[#6E6A64] focus:outline-none focus:border-[#FF6B00] ' +
  'transition-[border-color] bg-white'

export function OrderForm() {
  const [form,       setForm]       = useState<FormState>(EMPTY)
  const [agreedErr,  setAgreedErr]  = useState(false)
  const [files,      setFiles]      = useState<File[]>([])
  const [fileErr,    setFileErr]    = useState('')
  const [opened,     setOpened]     = useState<Channel | null>(null)
  const [emailState, setEmailState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [emailErr,   setEmailErr]   = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const honeypotRef  = useRef<HTMLInputElement>(null)

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        const timer = window.setTimeout(() => setForm(f => ({ ...f, ...parsed, agreed: false })), 0)
        return () => window.clearTimeout(timer)
      }
    } catch {}
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    try {
      const toSave = {
        name: form.name,
        contact: form.contact,
        urgency: form.urgency,
        product: form.product,
        size: form.size,
        qty: form.qty,
        material: form.material,
        comment: form.comment,
      }
      localStorage.setItem(LS_KEY, JSON.stringify(toSave))
    } catch {}
  }, [form])

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const setField = (key: keyof FormState, value: string | boolean) =>
    setForm(p => ({ ...p, [key]: value }))

  const handleFiles = (picked: FileList | null) => {
    setFileErr('')
    if (!picked) return
    for (const f of Array.from(picked)) {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setFileErr(`Файл «${f.name}» слишком большой (максимум ${MAX_SIZE_MB} МБ)`)
        return
      }
    }
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...Array.from(picked).filter(f => !names.has(f.name))].slice(0, 5)
    })
  }

  const removeFile = (name: string) => setFiles(prev => prev.filter(f => f.name !== name))

  const CHANNEL_LABELS: Record<Channel, string> = {
    email:    'Письмо отправлено!',
    max:      'Макс',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
  }

  const handleSend = useCallback(async (channel: Channel) => {
    if (!form.agreed) {
      setAgreedErr(true)
      return
    }
    setAgreedErr(false)

    if (channel === 'email') {
      // Отправляем через API — без открытия почтового клиента
      setEmailState('loading')
      setEmailErr('')
      try {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
        fd.append('company', honeypotRef.current?.value ?? '')
        files.forEach(f => fd.append('files', f))
        const res = await fetch('/api/send-email', { method: 'POST', body: fd })
        if (res.ok) {
          setEmailState('ok')
          setOpened('email')
          trackGoal('order_email')
        } else {
          const data = await res.json().catch(() => ({}))
          setEmailErr(data.error || 'Не удалось отправить письмо')
          setEmailState('error')
        }
      } catch {
        setEmailErr('Нет соединения. Попробуйте другой способ.')
        setEmailState('error')
      }
      return
    }

    // Мессенджеры — открываем ссылку с предзаполненным текстом
    const msg = buildMessage(form, files)
    const url = buildUrl(channel, msg)
    window.open(url, '_blank', 'noopener,noreferrer')
    setOpened(channel)
    trackGoal(`order_${channel}`)
  }, [form, files])

  return (
    <div id="calc" className="bg-[#F5F4F0] rounded-3xl p-8 sm:p-10">
      <h2 className="font-display text-3xl sm:text-4xl text-[#1A1A1A] tracking-wider mb-2">
        Рассчитать стоимость
      </h2>
      <p className="text-sm text-[#6E6A64] mb-8">
        Заполните форму — и отправьте нам одним нажатием в удобном мессенджере.
      </p>

      {/* Honeypot для ботов — скрыт от людей, не должен заполняться */}
      <input
        ref={honeypotRef}
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Name */}
        <Field label="Ваше имя">
          <input name="name" value={form.name} onChange={set}
            placeholder="Иван" className={inputCls} />
        </Field>

        {/* Contact */}
        <Field label="Номер или никнейм">
          <input name="contact" value={form.contact} onChange={set}
            placeholder="+7 900 000-00-00 или @username" className={inputCls} />
        </Field>

        {/* Urgency */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#6E6A64] uppercase tracking-wider mb-2">
            Срочность
          </label>
          <div className="grid grid-cols-3 gap-2">
            {URGENCY_OPTIONS.map(u => {
              const active = form.urgency === u.key
              return (
                <button
                  key={u.key}
                  type="button"
                  onClick={() => setField('urgency', active ? '' : u.key)}
                  className={[
                    'flex flex-col items-center py-3 px-2 rounded-xl border text-sm font-semibold transition-[background-color,border-color,color] duration-150',
                    active
                      ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                      : 'bg-white border-[#E8E6E0] text-[#6E6A64] hover:border-[#FF6B00]/50 hover:text-[#FF6B00]',
                  ].join(' ')}
                >
                  <span>{u.label}</span>
                  <span className={`text-[10px] font-normal mt-0.5 ${active ? 'text-white/70' : 'text-[#6E6A64]/70'}`}>
                    {u.hint}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Product */}
        <Field label="Что нужно изготовить?" span>
          <input name="product" value={form.product} onChange={set}
            placeholder="Медали, таблички, детали из фанеры..." className={inputCls} />
        </Field>

        {/* Size + Qty */}
        <Field label="Размер">
          <input name="size" value={form.size} onChange={set}
            placeholder="Например: 100 × 100 мм" className={inputCls} />
        </Field>

        <Field label="Количество">
          <input name="qty" value={form.qty} onChange={set}
            placeholder="1 шт, 50 шт..." className={inputCls} />
        </Field>

        {/* Material */}
        <Field label="Материал (если знаете)" span>
          <input name="material" value={form.material} onChange={set}
            placeholder="Акрил, фанера, ПВХ... или не знаю — подберём" className={inputCls} />
        </Field>

        {/* Comment */}
        <Field label="Комментарий" span>
          <textarea name="comment" value={form.comment} onChange={set} rows={3}
            placeholder="Любые детали, пожелания, ссылки на примеры..."
            className={inputCls + ' resize-none'} />
        </Field>

        {/* File upload */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#6E6A64] uppercase tracking-wider mb-1.5">
            Приложить макет или фото
          </label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-[border-color] cursor-pointer ${
              files.length > 0 ? 'border-[#FF6B00]/40 bg-[#FF6B00]/[0.03]' : 'border-[#E8E6E0] hover:border-[#FF6B00]/40'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
            role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            aria-label="Прикрепить файлы"
          >
            <input
              ref={fileInputRef}
              type="file" multiple
              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.ai,.eps,.svg,.dxf,.cdr,.zip"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
            {files.length === 0 ? (
              <>
                <svg className="mx-auto mb-2 text-[#6E6A64]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="text-sm text-[#6E6A64]">
                  Перетащите файлы или <span className="text-[#FF6B00] font-semibold">нажмите для выбора</span>
                </p>
                <p className="text-xs text-[#6E6A64]/60 mt-1">JPG, PNG, PDF, AI, SVG, DXF, CDR · до {MAX_SIZE_MB} МБ · до 5 файлов</p>
              </>
            ) : (
              <div className="space-y-2 text-left" onClick={e => e.stopPropagation()}>
                {files.map(f => (
                  <div key={f.name} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-[#E8E6E0]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.5" className="shrink-0">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span className="text-xs text-[#1A1A1A] truncate flex-1">{f.name}</span>
                    <span className="text-xs text-[#6E6A64] shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => removeFile(f.name)}
                      className="text-[#6E6A64] hover:text-red-500 transition-colors shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
                {files.length < 5 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#FF6B00] hover:underline underline-offset-4">
                    + Добавить ещё
                  </button>
                )}
              </div>
            )}
          </div>
          {fileErr && <p className="mt-2 text-xs text-red-500">{fileErr}</p>}
          {files.length > 0 && (
            <p className="mt-2 text-xs text-[#6E6A64]">
              Названия файлов попадут в текст сообщения. После открытия мессенджера — отправьте файлы следующим сообщением.
            </p>
          )}
        </div>

        {/* Agreement */}
        <div className="sm:col-span-2">
          <label className={`flex items-start gap-3 cursor-pointer group ${agreedErr ? 'text-red-500' : ''}`}>
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={e => { setField('agreed', e.target.checked); setAgreedErr(false) }}
                className="sr-only"
              />
              <div className={[
                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-[background-color,border-color] duration-150',
                form.agreed
                  ? 'bg-[#FF6B00] border-[#FF6B00]'
                  : agreedErr
                    ? 'border-red-400 bg-white'
                    : 'border-[#E8E6E0] bg-white group-hover:border-[#FF6B00]/50',
              ].join(' ')}>
                {form.agreed && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            </div>
            <span className={`text-xs leading-relaxed ${agreedErr ? 'text-red-500' : 'text-[#6E6A64]'}`}>
              Согласен на обработку персональных данных в соответствии с&nbsp;
              <Link href="/privacy" target="_blank" className="text-[#FF6B00] underline underline-offset-2 hover:text-[#e55e00]">политикой конфиденциальности</Link>
            </span>
          </label>
          {agreedErr && (
            <p className="mt-1 text-xs text-red-500 pl-8">Необходимо согласие для отправки</p>
          )}
        </div>
      </div>

      {/* ── Send block ── */}
      <div className="mt-8 rounded-2xl border border-[#E8E6E0] bg-white p-6">
        <p className="text-xs font-semibold text-[#6E6A64] uppercase tracking-wider mb-4">
          Отправить заявку
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* Почта */}
          <button
            type="button"
            onClick={() => handleSend('email')}
            disabled={emailState === 'loading' || emailState === 'ok'}
            className={[
              'group flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-[background-color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] disabled:cursor-not-allowed',
              emailState === 'ok'
                ? 'bg-[#059669] border-[#059669]'
                : 'border-[#E8E6E0] bg-white hover:bg-[#2D2D2D] hover:border-[#2D2D2D]',
            ].join(' ')}
          >
            {emailState === 'loading' ? (
              <svg className="animate-spin text-[#FF6B00]" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : emailState === 'ok' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8"
                className="text-[#2D2D2D] group-hover:text-white transition-colors duration-200">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 7 10 7 10-7"/>
              </svg>
            )}
            <span className={[
              'text-sm font-semibold transition-colors duration-200',
              emailState === 'ok'
                ? 'text-white'
                : 'text-[#1A1A1A] group-hover:text-white',
            ].join(' ')}>
              {emailState === 'loading' ? 'Отправка…' : emailState === 'ok' ? 'Отправлено!' : 'Почта'}
            </span>
          </button>

          {/* Макс */}
          <button
            type="button"
            onClick={() => handleSend('max')}
            className="group flex flex-col items-center gap-2 py-4 px-3 rounded-xl border border-transparent transition-[opacity] duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
            style={{ background: 'linear-gradient(135deg,#2B7FFF 0%,#9B3FE8 100%)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-sm font-semibold text-white">Макс</span>
          </button>

          {/* Telegram */}
          <button
            type="button"
            onClick={() => handleSend('telegram')}
            className="group flex flex-col items-center gap-2 py-4 px-3 rounded-xl border border-transparent bg-[#2AABEE] hover:bg-[#1a9ad9] transition-[background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <span className="text-sm font-semibold text-white">Telegram</span>
          </button>

          {/* WhatsApp */}
          <button
            type="button"
            onClick={() => handleSend('whatsapp')}
            className="group flex flex-col items-center gap-2 py-4 px-3 rounded-xl border border-transparent bg-[#25D366] hover:bg-[#1da857] transition-[background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            <span className="text-sm font-semibold text-white">WhatsApp</span>
          </button>
        </div>

        {/* Confirmation hints */}
        {emailState === 'error' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {emailErr}
          </div>
        )}
        {opened && opened !== 'email' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#059669]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Открыт {CHANNEL_LABELS[opened]} — там уже заполнен текст заявки. Нажмите «Отправить» в приложении.
          </div>
        )}

        <p className="mt-4 text-xs text-[#6E6A64] leading-relaxed">
          «Почта» — письмо отправится прямо с сайта. Мессенджеры — откроется чат с готовым текстом.
        </p>
      </div>
    </div>
  )
}

function Field({
  label, required, span, error, children,
}: {
  label: string; required?: boolean; span?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-[#6E6A64] uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-[#FF6B00] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
