'use client'

import Link from 'next/link'
import { business } from '@/data/contacts'
import { cn } from '@/lib/utils'
import { trackGoal } from '@/lib/analytics'

type Props = {
  variant?:  'light' | 'dark'
  size?:     'sm' | 'md' | 'lg'
  showCalc?: boolean
  className?: string
}

export function ContactButtons({
  variant  = 'light',
  size     = 'md',
  showCalc = false,
  className,
}: Props) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-full transition-[background-color,box-shadow,opacity] duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 active:scale-[0.97]'
  const sz = {
    sm: 'text-sm px-4 py-2',
    md: 'text-sm px-5 py-3',
    lg: 'text-base px-6 py-3.5',
  }[size]

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {showCalc && (
        <Link
          href="/calculator"
          onClick={() => trackGoal('cta_calculator')}
          className={cn(base, sz, 'bg-[#C94700] text-white hover:bg-[#B13E00] shadow-[0_7px_18px_rgba(141,50,0,0.20)]')}
        >
          Рассчитать стоимость
        </Link>
      )}

      <a
        href={business.whatsapp}
        onClick={() => trackGoal('contact_whatsapp')}
        target="_blank" rel="noopener noreferrer"
        className={cn(base, sz, 'bg-[#117A37] text-white hover:bg-[#0E682F]')}
      >
        <IconWA /> WhatsApp
      </a>

      <a
        href={business.telegram}
        onClick={() => trackGoal('contact_telegram')}
        target="_blank" rel="noopener noreferrer"
        className={cn(base, sz, 'bg-[#1676A7] text-white hover:bg-[#11648E]')}
      >
        <IconTG /> Telegram
      </a>

      <a
        href={business.max}
        onClick={() => trackGoal('contact_max')}
        target="_blank" rel="noopener noreferrer"
        className={cn(
          base, sz,
          'bg-gradient-to-r from-[#145FC4] to-[#7130B8] text-white hover:brightness-110 transition-[filter] duration-200'
        )}
      >
        <IconMax /> MAX
      </a>

      <a
        href={`tel:${business.phone}`}
        onClick={() => trackGoal('contact_phone')}
        className={cn(
          base, sz,
          variant === 'dark'
            ? 'bg-white/10 text-white border border-white/30 hover:bg-white/20 hover:border-white/50'
            : 'bg-[#1A1A1A]/10 text-[#1A1A1A] border border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/20'
        )}
      >
        <IconPhone /> Позвонить
      </a>
    </div>
  )
}

export function IconWA() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export function IconTG() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )
}

export function IconMax() {
  // MAX messenger logo: ring with speech-bubble tail
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3a9 9 0 1 0 4.243 16.93l3.328.99-.99-3.328A9 9 0 0 0 12 3zm0 2a7 7 0 0 1 3.53 13.07l.47 1.578-1.578-.47A7 7 0 1 1 12 5z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </svg>
  )
}
