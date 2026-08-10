'use client'

import { useEffect, useState } from 'react'
import { trackGoal } from '@/lib/analytics'

export function MobileOrderBar() {
  const [heroVisible, setHeroVisible] = useState(true)
  const [blocked, setBlocked] = useState(false)
  const hidden = heroVisible || blocked

  useEffect(() => {
    const hero = document.querySelector('#new-home-hero')
    const targets = [document.querySelector('#order'), document.querySelector('footer')].filter((target): target is Element => Boolean(target))
    const visible = new Set<Element>()
    const blockerObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target))
      setBlocked(visible.size > 0)
    }, { rootMargin: '0px 0px -20% 0px' })
    const heroObserver = new IntersectionObserver(entries => setHeroVisible(entries.some(entry => entry.isIntersecting)), { threshold: 0.05 })
    targets.forEach(target => blockerObserver.observe(target))
    if (hero) heroObserver.observe(hero)
    return () => {
      blockerObserver.disconnect()
      heroObserver.disconnect()
    }
  }, [])

  return (
    <div aria-hidden={hidden} className={`new-home-mobile-bar fixed inset-x-0 bottom-0 z-40 border-t border-[#C9CFD6] bg-white p-3 transition-[transform,opacity] duration-200 lg:hidden ${hidden ? 'pointer-events-none translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
      <a href="#new-home-order" tabIndex={hidden ? -1 : 0} onClick={() => trackGoal('cta_calculator')} className="flex min-h-12 items-center justify-center gap-3 bg-[#FF541F] px-5 text-sm font-bold text-[#101318] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647D8] active:scale-[0.98]">
        Рассчитать заказ <span aria-hidden="true">→</span>
      </a>
    </div>
  )
}
