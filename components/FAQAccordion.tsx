'use client'

import { useState } from 'react'
import { selectFaqItems, faqCategories, type FAQItem } from '@/data/faq'
import { RichText } from '@/components/RichText'

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-[#E8E6E0] last:border-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 rounded-sm"
      >
        <span className="font-semibold text-[15px] text-[#1A1A1A] leading-snug group-hover:text-[#FF6B00] transition-colors">
          {item.question}
        </span>
        <span
          className={`shrink-0 w-6 h-6 rounded-full border border-[#E8E6E0] flex items-center justify-center mt-0.5 transition-[transform,background-color] duration-200 ${
            isOpen ? 'bg-[#FF6B00] border-[#FF6B00] rotate-45' : 'bg-white'
          }`}
          aria-hidden="true"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v8M1 5h8" stroke={isOpen ? 'white' : '#1A1A1A'} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <p className="pb-5 text-sm text-[#2D2D2D] leading-[1.75]"><RichText text={item.answer} /></p>
      </div>
    </div>
  )
}

type Props = {
  /** Show only specific categories. Defaults to all. */
  categories?: FAQItem['category'][]
  /** Max number of items to show */
  limit?: number
  /** If true — shows category group headers */
  grouped?: boolean
}

export function FAQAccordion({ categories, limit, grouped = false }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = selectFaqItems({ categories, limit })

  const toggle = (id: string) => setOpenId(prev => (prev === id ? null : id))

  if (grouped) {
    // Group items by category
    const grouped: Record<string, FAQItem[]> = {}
    filtered.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    })

    return (
      <div className="space-y-10">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <h3 className="font-display text-xl text-[#1A1A1A] tracking-wide mb-4">
              {faqCategories[cat as FAQItem['category']]}
            </h3>
            <div className="bg-white rounded-2xl border border-[#E8E6E0] px-6 divide-y divide-[#E8E6E0]">
              {items.map(item => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isOpen={openId === item.id}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E0] px-6 divide-y divide-[#E8E6E0]">
      {filtered.map(item => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  )
}
