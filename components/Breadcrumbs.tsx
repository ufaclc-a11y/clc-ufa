type Crumb = { label: string; href?: string }

/** Только JSON-LD для SEO — без визуального отображения */
export function Breadcrumbs({ items }: { items: Crumb[]; darkMode?: boolean }) {
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
