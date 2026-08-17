import Link from 'next/link'

type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items, visual = false, darkMode = false }: { items: Crumb[]; visual?: boolean; darkMode?: boolean }) {
  const all = [{ label: 'Главная', href: '/' }, ...items]

  const jsonLd = {
    '@context':       'https://schema.org',
    '@type':          'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type':  'ListItem',
      position: i + 1,
      name:     c.label,
      item:     c.href ? `https://clc-ufa.ru${c.href}` : undefined,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {visual && (
        <nav aria-label="Хлебные крошки" className="mb-5 overflow-hidden">
          <ol className={`flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm ${darkMode ? 'text-white/70' : 'text-[#62646D]'}`}>
            {all.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex shrink-0 items-center gap-1">
                {index > 0 && <span aria-hidden="true" className="px-1 text-[#9A9CA5]">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="inline-flex min-h-11 items-center rounded-md px-1 underline-offset-4 hover:text-[#25262B] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className={darkMode ? 'text-white' : 'text-[#34353B]'}>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </>
  )
}
