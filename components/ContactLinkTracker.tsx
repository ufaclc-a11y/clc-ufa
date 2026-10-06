'use client'

import { useEffect } from 'react'
import { contactGoal } from '@/lib/contact-events'
import { trackGoal } from '@/lib/analytics'

/** Один обработчик покрывает контакты в шапке, подвале и серверных страницах. */
export function ContactLinkTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!link) return
      const goal = contactGoal(link.getAttribute('href') ?? '')
      if (!goal) return
      const placement = link.closest('header') ? 'header'
        : link.closest('footer') ? 'footer' : 'content'
      trackGoal(goal, { placement })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
