import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import { notFound }      from 'next/navigation'
import { portfolioCategories, portfolioItems } from '@/data/portfolio'
import { Breadcrumbs }   from '@/components/Breadcrumbs'
import { CTASection }    from '@/components/CTASection'
import { business }      from '@/data/contacts'

type Props = { params: { category: string } }

/* ── Лучшее фото для hero каждой категории (landscape ≥ 800px ширина) ── */
const categoryHeroImage: Record<string, string> = {
  'lazernaya-rezka':     '/images/portfolio/lazernaya-rezka-009.jpg',   // 1254×1254
  'koroba-fanera':       '/images/portfolio/koroba-fanera-002.jpg',     // 1280×960
  'gravirovka':          '/images/portfolio/gravirovka-002.jpg',        // 1280×720
  'frezernaya-rezka':    '/images/portfolio/frezernaya-rezka-001.jpg',  // 1280×960
  'organajzery':         '/images/portfolio/organajzery-001.jpg',       // 1280×720
  'nagradnye-statuetki': '/images/portfolio/nagradnye-statuetki-001.jpg', // 1280×960
  'uf-pechat':           '/images/portfolio/uf-pechat-008.jpg',         // 1280×960
  'medali':              '/images/portfolio/medali-011.jpg',            // 960×1280 — «Мелодия Весны», выбрано вручную
  'tablitchki':          '/images/portfolio/tablitchki-001.jpg',        // 1280×720
  'breloki':             '/images/portfolio/breloki-011.jpg',           // 1280×960
  'kheshtegi':           '/images/portfolio/kheshtegi-001.jpg',         // 1280×720
  'shkatulki-fanera':    '/images/portfolio/shkatulki-fanera-012.jpg',  // 1280×960
  'vyveski':             '/images/portfolio/vyveski-011.jpg',           // 1204×559
  'ramki-foto':          '/images/portfolio/ramki-foto-001.jpg',        // 1280×720
  'chasy':               '/images/portfolio/chasy-001.jpg',             // 1280×720
  'medalnitsa':          '/images/portfolio/medalnitsa-004.jpg',        // 1280×960
  'nomerki-garderob':    '/images/portfolio/nomerki-garderob-001.jpg',  // portrait (единственный вариант)
  'tejbl-tenty':         '/images/portfolio/tejbl-tenty-001.jpg',       // 1280×1280
  'kormushki':           '/images/portfolio/kormushki-003.jpg',         // 1280×960
  'bejdzhi':             '/images/portfolio/bejdzhi-002.jpg',           // 1280×960
  'zagotovki':           '/images/portfolio/zagotovki-001.jpg',         // portrait (единственный вариант)
  'klyuchnitsa':         '/images/portfolio/klyuchnitsa-002.jpg',       // 600×450
}

/* ── SEO-описания для каждой категории ── */
const categoryMeta: Record<string, { title: string; description: string }> = {
  'lazernaya-rezka':     { title: 'Лазерная резка — примеры работ в Уфе',         description: 'Фото работ по лазерной резке фанеры, акрила, ПВХ, МДФ, кожи и картона. Центр лазерной резки Уфа — от 1 штуки, срок 1–3 дня.' },
  'koroba-fanera':       { title: 'Коробки и ящики из фанеры — портфолио',         description: 'Коробки, пеналы и упаковка из фанеры на заказ в Уфе. Лазерная резка, гравировка, любые размеры — от 400 ₽.' },
  'gravirovka':          { title: 'Гравировка лазером — примеры работ в Уфе',      description: 'Гравировка на дереве, металле, коже, акриле и пластике. Именные изделия, логотипы, фото — Центр лазерной резки Уфа.' },
  'frezernaya-rezka':    { title: 'Фрезерная резка ЧПУ — портфолио работ',         description: 'Фрезеровка фанеры, МДФ, акрила и ПВХ в Уфе. Менажницы, рекламные конструкции, мебельные фасады — примеры работ.' },
  'organajzery':         { title: 'Органайзеры из фанеры — портфолио в Уфе',       description: 'Настольные и настенные органайзеры из фанеры на заказ. Лазерная резка, гравировка, любые размеры и конфигурации.' },
  'nagradnye-statuetki': { title: 'Наградные статуэтки на заказ — Уфа',            description: 'Статуэтки из акрила и фанеры с гравировкой или УФ-печатью. Корпоративные награды, кубки, дипломы — от 1 штуки.' },
  'uf-pechat':           { title: 'УФ-печать — примеры работ в Уфе',               description: 'Полноцветная УФ-печать на акриле, фанере, металле, пластике. UV DTF-наклейки. Медали, таблички, сувениры с фото.' },
  'medali':              { title: 'Медали на заказ — портфолио в Уфе',             description: 'Медали из акрила и фанеры с УФ-печатью и гравировкой. Для соревнований, выпускных и корпоративных мероприятий.' },
  'tablitchki':          { title: 'Таблички на заказ — примеры работ Уфа',         description: 'Таблички из акрила, фанеры и ПВХ с гравировкой и УФ-печатью. Офисные, именные, навигационные — от 350 ₽.' },
  'breloki':             { title: 'Брелоки из акрила и дерева — Уфа',              description: 'Брелоки из акрила, фанеры и кожи с гравировкой и УФ-печатью. Именные, корпоративные, сувенирные — от 1 штуки.' },
  'kheshtegi':           { title: 'Хештеги и фотозоны из фанеры — Уфа',            description: 'Фанерные хештеги, стенды и элементы фотозон на заказ. Свадьбы, выпускные, корпоративы — лазерная резка с гравировкой.' },
  'shkatulki-fanera':    { title: 'Шкатулки из фанеры на заказ — Уфа',             description: 'Шкатулки из берёзовой фанеры с гравировкой. Подарочные, именные, для украшений — лазерная резка в Уфе.' },
  'vyveski':             { title: 'Вывески на заказ в Уфе — портфолио',            description: 'Вывески из фанеры, акрила, ПВХ и алюминиевого композита. Лазерная резка, гравировка, УФ-печать — от 700 ₽.' },
  'ramki-foto':          { title: 'Рамки для фото из фанеры — Уфа',                description: 'Рамки для фотографий из фанеры и акрила с гравировкой. Именные, подарочные — лазерная резка в Уфе от 400 ₽.' },
  'chasy':               { title: 'Настенные часы из фанеры на заказ — Уфа',       description: 'Настенные часы из берёзовой фанеры с гравировкой. Именные, с логотипом — лазерная резка в Уфе от 600 ₽.' },
  'medalnitsa':          { title: 'Медальницы из фанеры и дерева — Уфа',           description: 'Медальницы для спортивных наград из фанеры и дерева. Лазерная резка, гравировка — на заказ в Уфе от 800 ₽.' },
  'nomerki-garderob':    { title: 'Номерки для гардероба на заказ — Уфа',          description: 'Гардеробные номерки из акрила и фанеры — лазерная резка в Уфе. Любые формы и тиражи, от 50 ₽ за штуку.' },
  'tejbl-tenty':         { title: 'Тейбл тенты и менюхолдеры — Уфа',              description: 'Тейбл тенты из акрила и фанеры с гравировкой или УФ-печатью. Для кафе, ресторанов, мероприятий — от 280 ₽.' },
  'kormushki':           { title: 'Кормушки для птиц из фанеры — Уфа',             description: 'Кормушки для птиц из берёзовой фанеры — лазерная резка. Классические и дизайнерские, от 400 ₽.' },
  'bejdzhi':             { title: 'Бейджи на заказ — примеры работ Уфа',           description: 'Именные бейджи из акрила и ПВХ с гравировкой или УФ-печатью. Для конференций, персонала — от 1 дня.' },
  'zagotovki':           { title: 'Заготовки из фанеры для творчества — Уфа',      description: 'Заготовки из берёзовой фанеры для творчества, декупажа и росписи. Лазерная резка по вашим размерам.' },
  'klyuchnitsa':         { title: 'Ключницы из фанеры на заказ — Уфа',             description: 'Ключницы из берёзовой фанеры с гравировкой. Именные, с монограммой, с логотипом — от 450 ₽.' },
}

export function generateStaticParams() {
  return portfolioCategories
    .filter(c => c.id !== 'all')
    .map(c => ({ category: c.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = portfolioCategories.find(c => c.id === params.category)
  if (!cat) return {}
  const meta = categoryMeta[cat.id]
  return {
    title:       `${meta?.title ?? cat.label} | Центр лазерной резки Уфа`,
    description: meta?.description ?? `Примеры работ: ${cat.label}. Центр лазерной резки Уфа.`,
    alternates:  { canonical: `https://clc-ufa.ru/portfolio/${cat.id}` },
    openGraph: {
      title:       `${meta?.title ?? cat.label} | Центр лазерной резки Уфа`,
      description: meta?.description,
      images:      [{ url: `/images/portfolio/${cat.id}-001.jpg` }],
    },
  }
}

const PAGE = 48

export default function PortfolioCategoryPage({ params }: Props) {
  const cat = portfolioCategories.find(c => c.id === params.category)
  if (!cat || cat.id === 'all') notFound()

  const meta     = categoryMeta[cat.id]
  const items    = portfolioItems.filter(i => i.category === cat.id)
  const preview  = items.slice(0, PAGE)
  const waText   = encodeURIComponent(`Здравствуйте! Интересует заказ: ${cat.label}. Подскажите стоимость.`)

  /* соседние категории для навигации */
  const others = portfolioCategories.filter(c => c.id !== 'all' && c.id !== cat.id).slice(0, 8)

  return (
    <>
      {/* ── HERO ── */}
      <div className="relative min-h-[380px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        <div className="absolute inset-0">
          <Image
            src={categoryHeroImage[cat.id] ?? `/images/portfolio/${cat.id}-001.jpg`}
            alt={cat.label}
            fill priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/95 via-[#1A1A1A]/65 to-[#1A1A1A]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-14 w-full">
          <Breadcrumbs
            items={[{ label: 'Наши работы', href: '/portfolio' }, { label: cat.label }]}
            darkMode
          />
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Портфолио</span>
          <h1 className="font-display text-5xl sm:text-6xl text-white tracking-wider mt-2 mb-3 leading-[1]">
            {cat.label}
          </h1>
          <p className="text-white/55 text-lg max-w-xl leading-relaxed mb-8">
            {meta?.description ?? `Примеры наших работ — ${cat.label.toLowerCase()} в Уфе.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={`${business.whatsapp.split('?')[0]}?text=${waText}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1fb855] transition-colors shadow-[0_2px_12px_rgba(37,211,102,0.3)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Заказать {cat.label.toLowerCase()}
            </a>
            <a href={`${business.telegram}?text=${waText}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/20 border border-white/15 transition-colors">
              Telegram
            </a>
            <span className="flex items-center text-white/30 text-sm font-mono self-center">{cat.count} фото</span>
          </div>
        </div>
      </div>

      {/* ── СЕТКА ФОТО ── */}
      <section className="py-12 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {preview.map((item, idx) => (
              <div
                key={item.id}
                className="group relative aspect-square bg-[#1A1A1A] rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.28)] transition-shadow duration-300"
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  priority={idx < 8}
                  loading={idx < 8 ? 'eager' : 'lazy'}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            ))}
          </div>

          {items.length > PAGE && (
            <div className="mt-10 text-center">
              <p className="text-[#6E6A64] text-sm mb-4">
                Показаны первые {PAGE} из {items.length} фото
              </p>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-[#E8E6E0] text-[#1A1A1A] font-semibold rounded-full hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors"
              >
                Смотреть все {items.length} работ →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── ДРУГИЕ КАТЕГОРИИ ── */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wider mb-6">Другие категории</h2>
          <div className="flex flex-wrap gap-2">
            {others.map(c => (
              <Link
                key={c.id}
                href={`/portfolio/${c.id}`}
                className="group relative overflow-hidden rounded-xl bg-[#1A1A1A] flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <div className="relative w-36 h-24 sm:w-44 sm:h-28">
                  <Image
                    src={`/images/portfolio/${c.id}-001.jpg`}
                    alt={c.label}
                    fill
                    sizes="176px"
                    className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <p className="text-white text-xs font-semibold leading-tight">{c.label}</p>
                    <p className="text-white/50 text-[10px] font-mono">{c.count} фото</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/portfolio" className="text-sm font-semibold text-[#FF6B00] hover:underline underline-offset-4">
              Все работы →
            </Link>
          </div>
        </div>
      </section>

      <CTASection dark />
    </>
  )
}
