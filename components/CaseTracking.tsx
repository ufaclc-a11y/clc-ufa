'use client'

import { useEffect, useRef } from 'react'
import { trackGoal } from '@/lib/analytics'
import { contactContext } from '@/lib/contact-events'

export function CaseTracking({ caseId }: { caseId: string }) {
  const sent = useRef<string | null>(null)
  useEffect(() => {
    const send = () => {
      if (!window.__ymLoaded || !window.ym || sent.current === caseId) return
      trackGoal('case_view', { ...contactContext(window.location.pathname, window.location.search), case_id: caseId })
      sent.current = caseId
    }
    window.addEventListener('clc:analytics-ready', send)
    send()
    return () => window.removeEventListener('clc:analytics-ready', send)
  }, [caseId])
  return null
}
