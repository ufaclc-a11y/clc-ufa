'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { YM_ID } from '@/lib/analytics'

/** Next.js App Router меняет страницы без полной перезагрузки, поэтому
 *  автоматический pageview Метрики (при init) видит только первый заход —
 *  дальнейшие переходы шлём вручную через ym(id, 'hit', url). */
export function MetrikaRouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const query = searchParams.toString()
    const url = query ? `${pathname}?${query}` : pathname
    window.ym?.(YM_ID, 'hit', url, { title: document.title })
  }, [pathname, searchParams])

  return null
}
