'use client'

import { useEffect } from 'react'

export function MotionEnhancer() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.new-home-v2-surface')
    if (!root) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealItems = Array.from(root.querySelectorAll<HTMLElement>('[data-v2-reveal]'))

    revealItems.forEach(item => {
      const delay = Math.min(Number(item.dataset.v2Delay ?? 0) * 80, 320)
      item.style.setProperty('--v2-reveal-delay', `${delay}ms`)
    })

    root.classList.add('v2-motion-ready')

    if (reducedMotion) {
      revealItems.forEach(item => item.classList.add('is-visible'))
      return () => root.classList.remove('v2-motion-ready')
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    )

    revealItems.forEach(item => observer.observe(item))

    let frame = 0
    const revealPassedItems = () => {
      const revealLine = window.innerHeight * 0.92
      revealItems.forEach(item => {
        if (item.classList.contains('is-visible')) return
        if (item.getBoundingClientRect().top > revealLine) return
        item.classList.add('is-visible')
        observer.unobserve(item)
      })
    }
    const updateProgress = () => {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
      root.style.setProperty('--v2-page-progress', String(progress))
      revealPassedItems()
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
      root.classList.remove('v2-motion-ready')
      root.style.removeProperty('--v2-page-progress')
    }
  }, [])

  return <span className="v2-scroll-progress" aria-hidden="true" />
}
