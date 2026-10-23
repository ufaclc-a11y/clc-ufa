import type { Case } from '@/data/cases'
import { caseContactLinks } from '@/lib/case-contact'

export function CaseContactActions({ item, position }: {
  item: Pick<Case, 'id' | 'title'>; position: 'hero' | 'final'
}) {
  return (
    <div data-cta-position={position} className="mt-6 flex flex-wrap gap-3" aria-label="Обсудить похожую задачу">
      {caseContactLinks(item).map(link => (
        <a key={link.label} href={link.href}
          target={link.href.startsWith('https:') ? '_blank' : undefined}
          rel={link.href.startsWith('https:') ? 'noopener noreferrer' : undefined}
          className="inline-flex min-h-11 items-center rounded-xl bg-[#C94700] px-5 py-3 font-semibold text-white hover:bg-[#A83B00] active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2">
          {link.label}
        </a>
      ))}
    </div>
  )
}
