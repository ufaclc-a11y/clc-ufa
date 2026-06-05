'use client'

/**
 * RichText — работает как в серверных, так и в клиентских компонентах.
 * Превращает упоминания WhatsApp, Telegram, Макс в кликабельные ссылки.
 * Используй везде где рендерится plain-текст из data/*.ts.
 */

const MESSENGER_LINKS: Record<string, { href: string; className: string }> = {
  WhatsApp: {
    href: 'https://wa.me/79374838003',
    className: 'text-[#25D366] underline decoration-[#25D366]/40 hover:decoration-[#25D366] transition-colors',
  },
  Telegram: {
    href: 'https://t.me/clcufa',
    className: 'text-[#2AABEE] underline decoration-[#2AABEE]/40 hover:decoration-[#2AABEE] transition-colors',
  },
  Макс: {
    href: 'https://max.ru/u/f9LHodD0cOJovKYdnmZPaYaDMUKsaiKLd4XDfHDJQDiV-nyK1Csp7gqlTFk',
    className: 'font-semibold underline underline-offset-2 decoration-purple-400/60 hover:decoration-purple-400 transition-colors',
    // gradient через inline style — tailwind не поддерживает bg-clip-text без JIT
  },
}

type Segment = string | { word: keyof typeof MESSENGER_LINKS; key: number }

function parseSegments(text: string): Segment[] {
  const pattern = /(WhatsApp|Telegram|Макс)/g
  const segments: Segment[] = []
  let last = 0
  let key = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) segments.push(text.slice(last, match.index))
    segments.push({ word: match[0] as keyof typeof MESSENGER_LINKS, key: key++ })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push(text.slice(last))
  return segments
}

interface Props {
  /** Многострочный текст: абзацы разделяются через \n\n */
  text: string
  className?: string
  /** Если true — каждый абзац в отдельный <p> */
  paragraphs?: boolean
}

export function RichText({ text, className, paragraphs = false }: Props) {
  if (paragraphs) {
    return (
      <>
        {text.split('\n\n').map((para, i) => (
          <p key={i} className={className}>
            <RichLine text={para} />
          </p>
        ))}
      </>
    )
  }
  return <RichLine text={text} className={className} />
}

function RichLine({ text, className }: { text: string; className?: string }) {
  const segments = parseSegments(text)
  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (typeof seg === 'string') return seg
        const { word } = seg
        const link = MESSENGER_LINKS[word]
        if (word === 'Макс') {
          return (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={link.className}
              style={{
                background: 'linear-gradient(to right, #2B7FFF, #9B3FE8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {word}
            </a>
          )
        }
        return (
          <a
            key={i}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={link.className}
          >
            {word}
          </a>
        )
      })}
    </span>
  )
}
