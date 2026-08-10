import Image from 'next/image'
import Link from 'next/link'
import { OrderForm } from '@/components/OrderForm'
import { business } from '@/data/contacts'
import { reviews, sourceLabels, sourceUrls } from '@/data/reviews'
import { MotionEnhancer } from './MotionEnhancer'

type OrderStep = {
  name: string
  text: string
}

type NewHomeV2Props = {
  orderSteps: OrderStep[]
}

const services = [
  {
    title: 'Лазерная резка',
    href: '/services/lazernaya-rezka',
    materials: 'Фанера, акрил, МДФ, кожа, картон',
    result: 'Точные детали, заготовки, трафареты и элементы изделий',
    image: '/images/hero-laser.jpg',
    alt: 'Лазер режет деталь из листового материала по заданному контуру',
  },
  {
    title: 'УФ-печать',
    href: '/services/uf-pechat',
    materials: 'Акрил, фанера, пластик, металл, стекло',
    result: 'Полноцветные таблички, панели, маркировка и изображения',
    image: '/images/portfolio/uf-pechat-025.jpg',
    alt: 'Серия изделий с полноцветной УФ-печатью',
  },
  {
    title: 'Гравировка',
    href: '/services/gravirovka-na-metalle',
    materials: 'Металл, дерево, кожа, пластик',
    result: 'Надписи, номера, логотипы, QR-коды и серийная маркировка',
    image: '/images/portfolio/gravirovka-045.jpg',
    alt: 'Металлическая бирка с лазерной гравировкой',
  },
  {
    title: 'Фрезеровка ЧПУ',
    href: '/services/frezernaya-rezka-chpu',
    materials: 'Фанера, МДФ, ПВХ, акрил, дерево',
    result: 'Крупные детали, пазы, фасады и элементы сложной формы',
    image: '/images/portfolio/frezernaya-rezka-015.jpg',
    alt: 'Фрезерный станок ЧПУ обрабатывает листовой материал',
  },
  {
    title: 'Готовые изделия',
    href: '/services/izgotovlenie-izdelij',
    materials: 'Резка, печать, гравировка, сборка и покраска',
    result: 'Таблички, вывески, рекламные изделия и продукция под задачу',
    image: '/images/portfolio/lazernaya-rezka-381.jpg',
    alt: 'Серия готовых изделий, изготовленных по одному макету',
  },
]

const works = [
  {
    image: '/images/portfolio/lazernaya-rezka-381.jpg',
    title: 'Серия наградных элементов',
    meta: 'Лазерная резка · серийное изготовление',
    href: '/portfolio/lazernaya-rezka',
  },
  {
    image: '/images/portfolio/gravirovka-045.jpg',
    title: 'Маркировка металлической бирки',
    meta: 'Металл · лазерная гравировка',
    href: '/services/gravirovka-na-metalle',
  },
  {
    image: '/images/portfolio/uf-pechat-025.jpg',
    title: 'Полноцветная печать на изделиях',
    meta: 'УФ-печать · малые серии',
    href: '/services/uf-pechat',
  },
  {
    image: '/images/portfolio/frezernaya-rezka-015.jpg',
    title: 'Раскрой листового материала',
    meta: 'Фрезеровка ЧПУ · крупный формат',
    href: '/services/frezernaya-rezka-chpu',
  },
]

const capabilities = [
  {
    value: '±0,1 мм',
    title: 'Точность лазерной резки',
    benefit: 'Контуры и посадочные размеры повторяются от детали к детали.',
    image: '/images/services/lazernaya-rezka.jpg',
    alt: 'Лазерный станок режет изделие из листового материала',
  },
  {
    value: '60 × 90 см',
    title: 'Рабочая область УФ-печати',
    benefit: 'Можно наносить полноцветное изображение на панели и готовые изделия.',
    image: '/images/services/uf-pechat.jpg',
    alt: 'Готовое изделие с полноцветной УФ-печатью',
  },
  {
    value: '2440 × 1220 мм',
    title: 'Стол фрезерного ЧПУ',
    benefit: 'Обрабатываем крупные мебельные, рекламные и производственные элементы.',
    image: '/images/services/frezernaya-rezka-chpu.jpg',
    alt: 'Фрезерный станок ЧПУ вырезает детали из листа',
  },
  {
    value: '6–40 мм',
    title: 'Фанера для фрезеровки',
    benefit: 'Работаем с толстыми заготовками, пазами и объёмными деталями.',
    image: '/images/portfolio/frezernaya-rezka-028.jpg',
    alt: 'Вырезанные на ЧПУ детали из фанеры',
  },
]

const selectedReview = reviews.find(review => review.id === 'r02')

export function NewHomeV2({ orderSteps }: NewHomeV2Props) {
  return (
    <>
      <MotionEnhancer />
      <section className="v2-hero" aria-labelledby="v2-title">
        <Image
          src="/images/hero-laser.jpg"
          alt=""
          fill
          priority
          className="v2-hero__image"
          sizes="100vw"
        />
        <div className="v2-hero__shade" aria-hidden="true" />
        <div className="v2-container v2-hero__content">
          <h1 id="v2-title">Лазерная резка и гравировка, УФ-печать и ЧПУ в Уфе</h1>
          <p className="v2-hero__lead">
            Производственный подрядчик: детали, таблички и готовые изделия по файлу, фото или описанию — от одной штуки до серии.
          </p>
          <div className="v2-actions">
            <a className="v2-button v2-button--primary" href="#new-home-v2-order">
              Получить расчёт <span aria-hidden="true">→</span>
            </a>
            <a className="v2-button v2-button--quiet" href="#new-home-v2-works">
              Посмотреть работы <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="v2-hero__proof">
          <div className="v2-container v2-proof-grid">
            <p data-v2-reveal="up"><strong>Точность до ±0,1 мм</strong><span>Лазерная резка по заданному контуру</span></p>
            <p data-v2-reveal="up" data-v2-delay="1"><strong>ЧПУ 2440 × 1220 мм</strong><span>Крупные детали из листовых материалов</span></p>
            <p data-v2-reveal="up" data-v2-delay="2"><strong>От 1 штуки до серии</strong><span>Частные и регулярные заказы</span></p>
            <p data-v2-reveal="up" data-v2-delay="3"><strong>Для ИП и ООО</strong><span>Договор и закрывающие документы</span></p>
          </div>
        </div>
      </section>

      <section className="v2-services" aria-labelledby="v2-services-title">
        <div className="v2-container">
          <div className="v2-section-head" data-v2-reveal="up">
            <h2 id="v2-services-title">Что производим и какими технологиями</h2>
            <p>Сначала определяем материал, размеры и результат. Затем выбираем способ обработки или объединяем несколько операций.</p>
          </div>
          <div className="v2-service-ledger">
            {services.map((service, index) => (
              <Link className="v2-service-row" href={service.href} key={service.title} data-v2-reveal="up" data-v2-delay={index % 3}>
                <h3>{service.title}</h3>
                <p><span>Материалы</span>{service.materials}</p>
                <p><span>Результат</span>{service.result}</p>
                <span className="v2-service-row__image">
                  <Image src={service.image} alt={service.alt} fill sizes="(min-width: 960px) 180px, 112px" />
                </span>
                <span className="v2-service-row__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="v2-works" id="new-home-v2-works" aria-labelledby="v2-works-title">
        <div className="v2-container">
          <div className="v2-section-head v2-section-head--works" data-v2-reveal="up">
            <h2 id="v2-works-title">Детали и изделия, которые можно рассмотреть</h2>
            <p>Отобрали примеры, где видны геометрия, качество поверхности, повторяемость серии и готовый результат.</p>
            <Link className="v2-text-link" href="/portfolio">Все работы <span aria-hidden="true">→</span></Link>
          </div>
          <div className="v2-work-grid">
            {works.map((work, index) => (
              <Link className="v2-work" href={work.href} key={work.image} data-v2-reveal="up" data-v2-delay={index % 2}>
                <span className="v2-work__image">
                  <Image src={work.image} alt={work.title} fill sizes="(min-width: 960px) 33vw, (min-width: 600px) 50vw, 100vw" />
                </span>
                <span className="v2-work__caption">
                  <strong>{work.title}</strong>
                  <span>{work.meta}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="v2-capabilities" aria-labelledby="v2-capabilities-title">
        <div className="v2-container">
          <div className="v2-capabilities__head" data-v2-reveal="up">
            <h2 id="v2-capabilities-title">Размеры и точность оборудования</h2>
            <p>Каждый параметр показываем рядом с реальной работой и объясняем через задачу заказчика.</p>
          </div>
          <div className="v2-capability-list">
            {capabilities.map((capability, index) => (
              <article className="v2-capability" key={capability.value} data-v2-reveal="scale" data-v2-delay={index % 2}>
                <span className="v2-capability__image">
                  <Image src={capability.image} alt={capability.alt} fill sizes="(min-width: 960px) 180px, 120px" />
                </span>
                <div>
                  <strong>{capability.value}</strong>
                  <h3>{capability.title}</h3>
                  <p>{capability.benefit}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="v2-capabilities__business" data-v2-reveal="up">Для ИП и ООО оформляем договор, счёт и закрывающие документы. Работаем без НДС. <Link href="/b2b">Условия для бизнеса →</Link></p>
        </div>
      </section>

      <section className="v2-process" aria-labelledby="v2-process-title">
        <div className="v2-container">
          <div className="v2-section-head v2-section-head--process" data-v2-reveal="up">
            <h2 id="v2-process-title">Как проходит заказ</h2>
            <p>Макет не обязателен: начните с фотографии, эскиза или короткого описания.</p>
          </div>
          <ol className="v2-process-line" data-v2-reveal="up">
            {orderSteps.map((step, index) => (
              <li key={step.name}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.name}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="v2-order" aria-label="Расчёт заказа">
        <div className="v2-container v2-order__grid">
          <div className="v2-order__copy" data-v2-reveal="left">
            <h2 className="v2-order__contact-title">Контакты цеха</h2>
            <p>Можно начать без готового макета: отправьте фотографию, эскиз или описание задачи.</p>
            <dl>
              <div><dt>Телефон</dt><dd><a href={`tel:${business.phone}`}>{business.phoneDisplay}</a></dd></div>
              <div><dt>Адрес</dt><dd>{business.address}</dd></div>
              <div><dt>Режим работы</dt><dd>{business.workingHours}</dd></div>
            </dl>
            {selectedReview && (
              <figure className="v2-order__review">
                <blockquote>«{selectedReview.text}»</blockquote>
                <figcaption><strong>{selectedReview.name}</strong><span>{selectedReview.product} · <a href={sourceUrls[selectedReview.source]} target="_blank" rel="noopener noreferrer">{sourceLabels[selectedReview.source]}</a></span></figcaption>
              </figure>
            )}
          </div>
          <div className="v2-order__form" data-v2-reveal="up" data-v2-delay="1">
            <OrderForm
              variant="new-home"
              id="new-home-v2-order"
              title="Рассчитать заказ"
              description="Свяжемся по выбранному каналу, уточним детали и сообщим стоимость и срок."
            />
          </div>
        </div>
      </section>
    </>
  )
}
