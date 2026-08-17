'use client'

import { useEffect } from 'react'
import { business } from '@/data/contacts'
import { trackGoal } from '@/lib/analytics'
import { IconMax, IconTG, IconWA } from '@/components/ContactButtons'

type Props = {
  id: number
  title: string
  sku: string
  price: number
}

export function ProductContactActions({ id, title, sku, price }: Props) {
  useEffect(() => {
    trackGoal('view_item', { product: id, price })
  }, [id, price])

  const message = encodeURIComponent(
    `Здравствуйте! Хочу уточнить по товару: ${title} (артикул ${sku}) — ${price.toLocaleString('ru-RU')} ₽.`,
  )

  const channels = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: IconWA,
      href: `${business.whatsapp.split('?')[0]}?text=${message}`,
      className: 'bg-[#117A37] text-white hover:bg-[#0E682F]',
      external: true,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: IconTG,
      href: `${business.telegram}?text=${message}`,
      className: 'bg-[#1676A7] text-white hover:bg-[#11648E]',
      external: true,
    },
    {
      id: 'max',
      label: 'MAX',
      icon: IconMax,
      href: business.max,
      className: 'bg-gradient-to-r from-[#145FC4] to-[#7130B8] text-white hover:brightness-110',
      external: true,
    },
    {
      id: 'email',
      label: 'Почта',
      icon: IconMail,
      href: `mailto:${business.email}?subject=${encodeURIComponent(`Вопрос о товаре: ${title}`)}&body=${message}`,
      className: 'bg-[#25262B] text-white hover:bg-[#3A3B42]',
      external: false,
    },
  ]

  return (
    <details className="group mb-7 border-b border-[#E1E2E8] bg-white" aria-labelledby="product-contact-title">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-1 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] [&::-webkit-details-marker]:hidden">
        <span>
          <span id="product-contact-title" className="block text-base font-extrabold tracking-[-0.015em] text-[#25262B]">Задать вопрос о товаре</span>
          <span className="mt-0.5 block text-xs text-[#62646D]">Название и артикул уже будут в сообщении</span>
        </span>
        <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-[#62646D] transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </summary>
      <div className="grid grid-cols-2 gap-2 pb-4 pt-2 sm:grid-cols-4">
        {channels.map(channel => {
          const Icon = channel.icon
          return (
            <a
              key={channel.id}
              href={channel.href}
              {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onClick={() => trackGoal('product_contact', { channel: channel.id, product: id })}
              className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition-[background-color,filter,opacity,transform] duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] focus-visible:ring-offset-2 ${channel.className}`}
            >
              <span aria-hidden="true"><Icon /></span>
              <span>{channel.label}</span>
            </a>
          )
        })}
      </div>
    </details>
  )
}

function IconMail() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6.5h16v11H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m5 7.5 7 5 7-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
