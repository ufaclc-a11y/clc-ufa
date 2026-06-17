import Link from 'next/link'
import { business } from '@/data/contacts'

const serviceLinks = [
  { href: '/services/lazernaya-rezka',         label: 'Лазерная резка'        },
  { href: '/services/uf-pechat',               label: 'УФ-печать'             },
  { href: '/services/gravirovka-na-metalle',   label: 'Гравировка (металл)'   },
  { href: '/services/gravirovka-na-nemetalah', label: 'Гравировка (дерево)'   },
  { href: '/services/frezernaya-rezka-chpu',   label: 'Фрезерная резка'       },
  { href: '/services/izgotovlenie-izdelij',    label: 'Изготовление изделий'  },
]

const seoLinks = [
  { href: '/lazernaya-rezka-fanery-ufa',    label: 'Резка фанеры'    },
  { href: '/lazernaya-rezka-akrila-ufa',    label: 'Резка акрила'    },
  { href: '/izgotovlenie-medaley-ufa',      label: 'Медали'          },
  { href: '/tablichki-na-zakaz-ufa',        label: 'Таблички'        },
  { href: '/gravirovka-na-dereve-ufa',      label: 'Гравировка'      },
  { href: '/fonts',                         label: 'Подбор шрифта'   },
  { href: '/materials',                     label: 'Материалы'        },
]

const companyLinks = [
  { href: '/portfolio',   label: 'Наши работы'       },
  { href: '/products',    label: 'Каталог изделий'   },
  { href: '/cases',       label: 'Кейсы с ценами'    },
  { href: '/about',       label: 'О нас'             },
  { href: '/promo',       label: 'Акции'             },
  { href: '/blog',        label: 'Блог'              },
  { href: '/faq',         label: 'Вопросы и ответы'  },
  { href: '/b2b',         label: 'Для бизнеса'       },
  { href: '/partners',    label: 'Партнёрам'         },
  { href: '/contacts',    label: 'Контакты'           },
]

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white/50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-14">

          {/* Бренд */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <span className="font-display text-3xl text-white tracking-[0.1em]">CLC</span>
              <span className="w-px h-6 bg-[#FF6B00]" />
              <span className="font-body text-[10px] text-[#6E6A64] uppercase tracking-widest leading-tight">
                Воплощаем<br />идеи
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-5">
              Небольшое производство в Уфе. Помогаем воплотить любую идею в готовое изделие.
            </p>
            <div className="flex gap-2">
              {[
                { href: business.whatsapp,        label: 'WA',  title: 'WhatsApp',       cls: 'hover:bg-[#25D366]' },
                { href: business.telegram,        label: 'TG',  title: 'Telegram',       cls: 'hover:bg-[#2AABEE]' },
                { href: business.telegramChannel, label: '📢',  title: 'Telegram-канал', cls: 'hover:bg-[#2AABEE]' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.title}
                  className={`w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-xs font-mono hover:text-white transition-colors ${s.cls}`}
                >
                  {s.label}
                </a>
              ))}
              <a
                href={business.max}
                target="_blank"
                rel="noopener noreferrer"
                title="MAX"
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono text-white transition-[filter] duration-200 hover:brightness-125"
                style={{ background: 'linear-gradient(135deg, #2B7FFF, #9B3FE8)' }}
              >
                MAX
              </a>
              <a
                href={business.vk}
                target="_blank"
                rel="noopener noreferrer"
                title="ВКонтакте"
                className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-white/70 hover:bg-[#0077FF] hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.162 18.994c.609 0 .858-.406.851-.915-.031-1.917.714-2.949 2.059-1.604 1.488 1.488 1.796 2.519 3.603 2.519h3.2c.808 0 1.126-.26 1.126-.668 0-.863-1.421-2.386-2.625-3.504-1.686-1.565-1.765-1.602-.313-3.486 1.801-2.339 4.157-5.336 2.073-5.336h-3.981c-.772 0-.828.435-1.103 1.083-.995 2.347-2.886 5.387-3.604 4.922-.751-.485-.407-2.406-.35-5.261.015-.754.011-1.271-1.141-1.539-.629-.145-1.241-.205-1.809-.205-2.273 0-3.841.953-2.95 1.119 1.571.293 1.42 3.692 1.054 5.16-.638 2.556-3.036-2.024-4.035-4.305-.241-.548-.315-.974-1.175-.974h-3.255c-.492 0-.787.16-.787.516 0 .602 2.916 6.846 5.563 9.984 2.42 2.872 4.978 2.494 6.598 2.494z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Услуги */}
          <div>
            <h3 className="font-display text-white tracking-wider mb-4 text-base">Услуги</h3>
            <ul className="space-y-2.5">
              {serviceLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Популярные направления */}
          <div>
            <h3 className="font-display text-white tracking-wider mb-4 text-base">Популярное</h3>
            <ul className="space-y-2.5">
              {seoLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Компания + контакты */}
          <div>
            <h3 className="font-display text-white tracking-wider mb-4 text-base">Компания</h3>
            <ul className="space-y-2.5 mb-6">
              {companyLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
            <a href={`tel:${business.phone}`} className="font-mono text-sm text-white/70 hover:text-white transition-colors block mb-1">
              {business.phoneDisplay}
            </a>
            <span className="text-xs text-[#FF6B00]">{business.workingHours}</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/25">
          <span>© 2025 {business.name}</span>
          <Link href="/privacy" className="hover:text-white/60 transition-colors">Политика конфиденциальности</Link>
          <span>{business.address}</span>
        </div>
      </div>
    </footer>
  )
}
