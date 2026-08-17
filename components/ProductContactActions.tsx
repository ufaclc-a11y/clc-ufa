'use client'

import { useEffect } from 'react'
import { business } from '@/data/contacts'
import { trackGoal } from '@/lib/analytics'

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
      mark: 'WA',
      href: `${business.whatsapp.split('?')[0]}?text=${message}`,
      className: 'border-[#BDEECC] bg-[#F2FCF5] text-[#177A3C] hover:border-[#78D796] hover:bg-[#E8F9ED]',
      external: true,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      mark: 'TG',
      href: `${business.telegram}?text=${message}`,
      className: 'border-[#BDE2F6] bg-[#F1F9FD] text-[#1676A7] hover:border-[#78C6EC] hover:bg-[#E7F6FD]',
      external: true,
    },
    {
      id: 'max',
      label: 'MAX',
      mark: 'MAX',
      href: business.max,
      className: 'border-[#D9CDF8] bg-[#F7F4FE] text-[#5E3BC8] hover:border-[#B9A4F2] hover:bg-[#F0EBFC]',
      external: true,
    },
    {
      id: 'email',
      label: 'Почта',
      mark: '@',
      href: `mailto:${business.email}?subject=${encodeURIComponent(`Вопрос о товаре: ${title}`)}&body=${message}`,
      className: 'border-[#DCDDE5] bg-[#FAFAFC] text-[#42444C] hover:border-[#B9BBC5] hover:bg-[#F3F3F7]',
      external: false,
    },
  ]

  return (
    <section aria-labelledby="product-contact-title" className="mb-8 rounded-2xl bg-[#F7F7FA] p-4 sm:p-5">
      <h2 id="product-contact-title" className="text-base font-extrabold tracking-[-0.015em] text-[#25262B]">
        Есть вопрос о товаре?
      </h2>
      <p className="mt-1 text-sm leading-5 text-[#6A6C75]">Напишите удобным способом — название и артикул уже будут в сообщении.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {channels.map(channel => (
          <a
            key={channel.id}
            href={channel.href}
            {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            onClick={() => trackGoal('product_contact', { channel: channel.id, product: id })}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition-[background-color,border-color,color,transform] hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] focus-visible:ring-offset-2 ${channel.className}`}
          >
            <span className="text-xs font-extrabold tracking-[-0.01em]" aria-hidden="true">{channel.mark}</span>
            <span>{channel.label}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
