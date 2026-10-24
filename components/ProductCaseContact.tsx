'use client'

import { createContext, useContext, useId, useRef, useState, type ReactNode } from 'react'
import type { Case } from '@/data/cases'
import { caseContactLinks, productCaseMessage } from '@/lib/case-contact'
import { trackGoal } from '@/lib/analytics'

const ContactContext = createContext<(trigger: HTMLButtonElement, position: 'hero' | 'final') => void>(() => {})
export function ProductCaseContactTrigger({ position }: { position: 'hero' | 'final' }) {
  const open = useContext(ContactContext)
  return <div data-cta-position={position} className={position === 'final' ? 'my-6 border-t border-[#DDDAD3] pt-6' : undefined}>
    <button data-primary-cta={position === 'hero' ? '' : undefined} data-case-calculation-trigger={position} type="button" aria-haspopup="dialog" onClick={event => open(event.currentTarget, position)} className={position === 'hero' ? 'inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#C94700] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#A83B00] active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] sm:w-auto' : 'inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#9D3900] px-4 py-2 text-sm font-semibold text-[#9D3900] hover:bg-[#EEE8DF] active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]'}>Рассчитать похожее изделие</button>
    {position === 'hero' && <p className="mt-2 text-xs leading-relaxed text-white/65">Выберите удобный канал — без заполнения формы.</p>}
  </div>
}
export function ProductCaseContact({ item, children }: { item: Pick<Case, 'id' | 'title'>; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const [position, setPosition] = useState<'hero' | 'final'>('hero')
  const id = useId()
  const message = productCaseMessage(item)
  return <ContactContext.Provider value={(button, origin) => {
    trigger.current = button
    setPosition(origin)
    dialog.current?.showModal()
    trackGoal('case_calculation_open', { case_id: item.id, cta_position: origin })
  }}>
    {children}
    <dialog ref={dialog} data-cta-position={position} aria-labelledby={`${id}-title`} onClose={() => trigger.current?.focus()} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-[#DDDAD3] bg-[#F5F4F0] p-5 text-[#1A1A1A] shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop:bg-black/70">
      <div className="flex items-start justify-between gap-3">
        <h2 id={`${id}-title`} className="font-display text-3xl">Обсудить изделие</h2>
        <button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Закрыть выбор канала" className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded text-xl hover:bg-[#DDDAD3] active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">×</button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#4F4B45]">{item.title}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {caseContactLinks(item, message).map(link => <a key={link.label} href={link.href} target={link.href.startsWith('https:') ? '_blank' : undefined} rel={link.href.startsWith('https:') ? 'noopener noreferrer' : undefined} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#BBB7AF] px-3 text-sm font-semibold transition-colors hover:border-[#9D3900] hover:text-[#9D3900] active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">{link.label}</a>)}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[#4F4B45]">В WhatsApp и Telegram передаём сообщение и ссылку на кейс. В MAX текст автоматически не подставляется — скопируйте контекст ниже. Сообщение отправляете только вы.</p>
      <label htmlFor={`${id}-context`} className="mt-4 block text-xs font-semibold">Контекст для копирования</label>
      <textarea id={`${id}-context`} readOnly rows={4} value={message} onFocus={event => event.currentTarget.select()} className="mt-2 w-full resize-none rounded-lg border border-[#BBB7AF] bg-white p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]" />
    </dialog>
  </ContactContext.Provider>
}
