import Image from 'next/image'
import Link from 'next/link'
import { business } from '@/data/contacts'
import { IconWA, IconTG, IconMax } from '@/components/ContactButtons'
import styles from './HomeHero.module.css'

type HeroIconName = 'factory' | 'pencil' | 'layers' | 'calendar' | 'trophy' | 'box' | 'sign' | 'leaf' | 'gift' | 'cog' | 'image' | 'mail' | 'vk'

function HeroIcon({ name }: { name: HeroIconName }) {
  const paths: Record<HeroIconName, React.ReactNode> = {
    factory: <><path d="M3 21V10l6 3V8l6 4V3h5v18Z" /><path d="M7 17v1m5-1v1m5-1v1M15 7h5" /></>,
    pencil: <><path d="m15 4 5 5M3 21l5-1L21 7a2 2 0 0 0-5-5L3 15Z" /><path d="m3 15 5 5" /></>,
    layers: <><path d="m12 3 10 5-10 5L2 8Z" /><path d="m2 12 10 5 10-5M2 16l10 5 10-5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 2v6m10-6v6M3 11h18M7 15h2m4 0h2m-8 3h2" /></>,
    trophy: <><path d="M7 3h10v6a5 5 0 0 1-10 0ZM7 5H3v3a4 4 0 0 0 5 4m9-7h4v3a4 4 0 0 1-5 4M12 14v7m-5 0h10" /></>,
    box: <><path d="m12 2 10 5v10l-10 5L2 17V7ZM2 7l10 5 10-5M12 12v10M7 4.5l10 5" /></>,
    sign: <><path d="M12 2v20" /><path d="M3 5h15l3 3-3 3H3ZM21 14H6l-3 3 3 3h15Z" /></>,
    leaf: <><path d="M20 3C7 2 2 9 6 16s16 1 14-13ZM3 22 17 7" /></>,
    gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v9h14v-9M12 8v13" /><path d="M12 8C3 8 6 0 10 4l2 4c9 0 6-8 2-4Z" /></>,
    cog: <><path d="m10 2-.6 3-2.2 1.2L4.3 5l-2 3.5 2.3 2v3l-2.3 2L4.3 19l2.9-1.2L9.4 19l.6 3h4l.6-3 2.2-1.2 2.9 1.2 2-3.5-2.3-2v-3l2.3-2-2-3.5-2.9 1.2L14.6 5 14 2Z" /><circle cx="12" cy="12" r="3" /></>,
    image: <><rect x="2" y="3" width="20" height="18" rx="2" /><circle cx="8" cy="8" r="1.5" /><path d="m2 17 5-5 4 4 5-6 6 7" /></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m3 5 9 7 9-7M3 19l6-6m12 6-6-6" /></>,
    vk: <path d="M3 6h3c1 6 3 10 5 10V6h3v6c2-1 4-4 5-6h3c-1 3-3 5-5 7 2 1 4 3 5 5h-4c-2-3-3-4-4-4v4h-2C6 18 3 12 3 6Z" />,
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

const facts: { icon: HeroIconName; text: string }[] = [
  { icon: 'factory', text: 'Собственное производство в Уфе' },
  { icon: 'pencil', text: 'Помогаем с макетом и конструкцией' },
  { icon: 'layers', text: 'От 1 штуки до тиража' },
  { icon: 'calendar', text: 'Сроки от 1–3 дней' },
]
const makes: { icon: HeroIconName; text: string }[] = [
  { icon: 'trophy', text: 'Награды' },
  { icon: 'box', text: 'Упаковка' },
  { icon: 'sign', text: 'Таблички и указатели' },
  { icon: 'leaf', text: 'Декор и интерьер' },
  { icon: 'gift', text: 'Сувениры и подарки' },
  { icon: 'cog', text: 'Детали и элементы' },
]

export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Уфа · изделия на заказ</p>
            <h1 id="home-hero-title" className={styles.title}>
              От идеи —<br />к <span>готовому</span><br />изделию.
            </h1>
            <p className={styles.lead}>
              Изготавливаем таблички, награды, упаковку, декор, сувениры и детали по вашему макету, эскизу, фото или образцу. От одной штуки до партии.
            </p>
          </div>

          <div className={styles.visual}>
            <picture>
              <source media="(min-width: 1024px)" srcSet="/images/hero-products.jpg" />
              <Image
                src="/images/hero-products-m.jpg"
                alt="Награда из акрила, резное панно, коробка из фанеры, медаль и адресная табличка"
                width={640} height={410} priority unoptimized
                className={styles.productImage}
              />
            </picture>
          </div>

          <div className={styles.actions}>
            <div className={styles.buttons}>
              <a className={styles.primary} href={business.telegram} target="_blank" rel="noopener noreferrer">
                Обсудить задачу <span aria-hidden="true">→</span>
              </a>
              <Link className={styles.secondary} href="/products"><HeroIcon name="image" />Посмотреть изделия</Link>
            </div>
            <div className={styles.socials} aria-label="Связаться с нами">
              <a className={styles.telegram} href={business.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><IconTG /></a>
              <a className={styles.whatsapp} href={business.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><IconWA /></a>
              <a className={styles.vk} href={business.vk} target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте"><HeroIcon name="vk" /></a>
              <a className={styles.max} href={business.max} target="_blank" rel="noopener noreferrer" aria-label="MAX"><IconMax /></a>
              <a className={styles.email} href={`mailto:${business.email}`} aria-label="Написать на почту"><HeroIcon name="mail" /></a>
            </div>
          </div>

          <ul className={styles.facts}>
            {facts.map(f => <li key={f.icon}><HeroIcon name={f.icon} /><span>{f.text}</span></li>)}
          </ul>
        </div>

        <div className={styles.categories}>
          <p>Что мы изготавливаем:</p>
          <ul>{makes.map(m => <li key={m.icon}><HeroIcon name={m.icon} /><span>{m.text}</span></li>)}</ul>
        </div>
        <div className={styles.materials}>
          <p>Работаем<br />с материалами:</p>
          <ul>{['Фанера', 'Акрил', 'МДФ', 'ПВХ'].map(m => <li key={m}>{m}</li>)}</ul>
        </div>
      </div>
    </section>
  )
}
