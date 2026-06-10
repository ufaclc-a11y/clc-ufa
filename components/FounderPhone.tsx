'use client'

import { useEffect, useState } from 'react'
import { business } from '@/data/contacts'

// Номер основателя рендерится только на клиенте, чтобы не индексироваться поисковыми роботами
export function FounderPhone() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
  }, [])

  if (!show) {
    return <span className="font-mono text-2xl text-[#1A1A1A]">···</span>
  }

  return (
    <a
      href={`tel:${business.founder.phone}`}
      className="font-mono text-2xl text-[#1A1A1A] hover:text-[#FF6B00] transition-colors"
    >
      {business.founder.phoneDisplay}
    </a>
  )
}
