'use client'

import { useEffect } from 'react'
import { contactGoal, contactContext } from '@/lib/contact-events'
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
      trackGoal(goal, { placement, ...contactContext(window.location.pathname, window.location.search,
        link.closest('[data-cta-position]')?.getAttribute('data-cta-position')) })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
