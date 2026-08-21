import Link from 'next/link'
import { business } from '@/data/contacts'
import { IconMax, IconTG, IconWA } from '@/components/ContactButtons'

const shopLinks = [
  { href: '/shop', label: 'Каталог' },
  { href: '/shop/cart', label: 'Корзина' },
  { href: '/products', label: 'Изготовление на заказ' },
  { href: '/dostavka-i-oplata', label: 'Доставка и оплата' },
  { href: '/vozvrat', label: 'Возврат' },
]

const companyLinks = [
  { href: '/about', label: 'О компании' },
  { href: '/contacts', label: 'Контакты' },
  { href: '/oferta', label: 'Оферта' },
  { href: '/privacy', label: 'Конфиденциальность' },
]

export function ShopFooter() {
  return (
    <footer className="shop-marketplace border-t border-[#E1E2E8] bg-[#F5F6F9] text-[#34353B]">
      <div className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/shop" className="inline-flex min-h-11 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">
              <span className="text-3xl font-extrabold leading-none tracking-[-0.04em] text-[#C94700]">CLC</span>
              <span className="text-xs font-extrabold uppercase leading-tight tracking-[0.06em] text-[#25262B]">Центр<br />лазерной резки</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#62646D]">Готовые изделия и изготовление по вашему макету. Отправляем заказы по всей России.</p>
          </div>

          <FooterColumn title="Покупателям" links={shopLinks} />
          <FooterColumn title="Компания" links={companyLinks} />

          <div>
            <h2 className="text-sm font-extrabold text-[#25262B]">Связаться</h2>
            <a href={`tel:${business.phone}`} className="mt-2 inline-flex min-h-11 items-center rounded text-sm font-bold text-[#25262B] hover:text-[#9D3900] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">{business.phoneDisplay}</a>
            <p className="text-xs text-[#62646D]">{business.workingHours}</p>
            <div className="mt-4 flex gap-2">
              <SocialLink href={business.whatsapp} label="WhatsApp" className="bg-[#117A37]"><IconWA /></SocialLink>
              <SocialLink href={business.telegram} label="Telegram" className="bg-[#1676A7]"><IconTG /></SocialLink>
              <SocialLink href={business.max} label="MAX" className="bg-gradient-to-r from-[#145FC4] to-[#7130B8]"><IconMax /></SocialLink>
              <SocialLink href={`mailto:${business.email}`} label="Почта" className="bg-[#25262B]"><MailIcon /></SocialLink>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-[#DCDDE5] pt-5 text-xs text-[#62646D] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {business.name}</span>
          <span>{business.address}</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h2 className="text-sm font-extrabold text-[#25262B]">{title}</h2>
      <ul className="mt-2">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className="inline-flex min-h-11 items-center rounded text-sm text-[#62646D] hover:text-[#25262B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialLink({ href, label, className, children }: { href: string; label: string; className: string; children: React.ReactNode }) {
  return (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} aria-label={label} className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-[filter,transform] hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 ${className}`}>
      {children}
    </a>
  )
}

function MailIcon() {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6.5h16v11H4z" /><path d="m5 7.5 7 5 7-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
