// Чистая логика валидации заявки с формы заказа — вынесена из
// app/api/send-email/route.ts, чтобы покрыть её тестами без SMTP.

export const MAX_FILES       = 5
export const MAX_FILE_BYTES  = 20 * 1024 * 1024   // 20 МБ на файл
export const MAX_TOTAL_BYTES = 40 * 1024 * 1024   // 40 МБ суммарно
export const MAX_FIELD_LEN   = 2000               // максимум символов в текстовом поле

export const ALLOWED_EXT = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'ai', 'eps', 'svg', 'dxf', 'cdr', 'zip',
])

/** Honeypot: поле company скрыто от людей, заполняют только боты. */
export function isSpam(body: Record<string, string>): boolean {
  return Boolean(body.company && body.company.trim() !== '')
}

/** Заявка без контакта бесполезна — отсекаем пустые автозапросы. */
export function hasContact(body: Record<string, string>): boolean {
  return Boolean(body.contact && body.contact.trim() !== '')
}

/** Отсекает случайные символы, но принимает телефон, e-mail и ник в мессенджере. */
export function isPlausibleContact(value: string): boolean {
  const normalized = value.trim()
  return normalized.length >= 3 && /[\p{L}\p{N}]/u.test(normalized)
}

export type AttachmentCheck =
  | { ok: true }
  | { ok: false; error: string; status: 400 | 413 }

/** Проверка одного файла: расширение, размер, суммарный размер с учётом уже принятых. */
export function checkAttachment(name: string, size: number, totalBytesSoFar: number): AttachmentCheck {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXT.has(ext)) {
    return { ok: false, error: `Недопустимый тип файла: ${name}`, status: 400 }
  }
  if (size > MAX_FILE_BYTES) {
    return { ok: false, error: `Файл слишком большой: ${name}`, status: 413 }
  }
  if (totalBytesSoFar + size > MAX_TOTAL_BYTES) {
    return { ok: false, error: 'Суммарный размер файлов превышает лимит', status: 413 }
  }
  return { ok: true }
}

/** Экранирование пользовательского ввода перед вставкой в HTML письма. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
