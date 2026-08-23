'use client'

import type { ReactNode } from 'react'
import { trackGoal } from '@/lib/analytics'

export function TrackedCalcLink({ children, className }: { children: ReactNode; className: string }) {
  return <a href="#new-home-order" className={className} onClick={() => trackGoal('cta_calculator')}>{children}</a>
}
