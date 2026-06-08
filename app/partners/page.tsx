import type { Metadata }  from 'next'
import Image              from 'next/image'
import Link               from 'next/link'
import { Breadcrumbs }    from '@/components/Breadcrumbs'
import { CTASection }     from '@/components/CTASection'
import { business }       from '@/data/contacts'
import { SymbolIcon }     from '@/components/Icons'

export const metadata: Metadata = {
  title:       'Партнёрская программа — Центр лазерной резки Уфа',
  description:  'Партнёрская программа Центр лазерной резки: рефералные выплаты, условия для агентств, дизайнеров, ивентеров и рекламных агентств в Уфе.',
  keywords:    ['партнерская программа лазерная резка уфа', 'реферальная программа уфа', 'сотрудничество лазерная резка уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/partners' },
}

const waBase = `https://wa.me/${business.whatsapp.replace(/\D/g, '')}`

const formats = [
  {
    icon: '🎨',
    title: 'Дизайнеры',
    desc: 'Вы создаёте макеты, мы воплощаем. Берите заказы на изготовление и получайте реферальное вознаграждение с каждого клиента.',
    reward: '10%',
    rewardLabel: 'с каждого заказа',
  },
  {
    icon: '🎉',
    title: 'Ивент-агентства',
    desc: 'Организуете мероприятия? Подключите производство сувениров, медалей и декора — мы всё изготовим под ваш бриф и сроки.',
    reward: '8%',
    rewardLabel: 'постоянные клиенты',
  },
  {
    icon: '📣',
    title: 'Рекламные агентства',
    desc: 'Предлагаете клиентам брендированную продукцию? Мы производим под любой тираж с вашим логотипом и без маркировки Центр лазерной резки.',
    reward: '8%',
    rewardLabel: 'белая этикетка',
  },
  {
    icon: '🏪',
    title: 'Магазины и маркетплейсы',
    desc: 'Продаёте изделия ручной работы? Разместите нашу продукцию в своём ассортименте — оптовые цены, дропшиппинг, быстрая поставка.',
    reward: 'Опт',
    rewardLabel: 'дропшиппинг',
  },
  {
    icon: '🏢',
    title: 'Корпоративные менеджеры',
    desc: 'Организуете закупки для своей компании? Разовые рекомендации друзьям и коллегам также вознаграждаются.',
    reward: '5%',
    rewardLabel: 'разовые рефералы',
  },
  {
    icon: '📐',
    title: 'Архитекторы и прорабы',
    desc: 'Работаете над интерьером или вывесками? Мы производим навигацию, таблички, декор и интерьерные элементы под ваши проекты.',
    reward: '8%',
    rewardLabel: 'проектные заказы',
  },
]

const steps = [
  {
    num: '01',
    title: 'Напишите нам',
    desc: 'Расскажите о себе в WhatsApp, Telegram или Макс — чем вы занимаетесь, каких клиентов привлекаете.',
  },
  {
    num: '02',
    title: 'Заключим договор',
    desc: 'Подпишем партнёрское соглашение с чёткими условиями вознаграждения и выплат.',
  },
  {
    num: '03',
    title: 'Приводите клиентов',
    desc: 'Передаёте контакт клиента — мы связываемся, рассчитываем заказ и сообщаем вам о результате.',
  },
  {
    num: '04',
    title: 'Получайте вознаграждение',
    desc: 'После оплаты заказа клиентом — перечисляем ваше вознаграждение. Ежемесячно или по факту.',
  },
]

const benefits = [
  { icon: '💸', text: 'Вознаграждение 5–10% с каждого заказа вашего клиента' },
  { icon: '🔄', text: 'Повторные заказы — вы получаете вознаграждение каждый раз' },
  { icon: '📊', text: 'Отчётность — сообщаем статус каждого заказа' },
  { icon: '🏷️', text: 'Белая этикетка — производим без нашей маркировки по запросу' },
  { icon: '⚡', text: 'Приоритетное производство для партнёрских заказов' },
  { icon: '🤝', text: 'Персональный менеджер для партнёров' },
]

export default function PartnersPage() {
  const waText = encodeURIComponent('Здравствуйте! Хочу стать партнёром Центр лазерной резки. Расскажите об условиях.')

  return (
    <>
      {/* Hero */}
      <div className="relative min-h-[460px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        <div className="absolute inset-0">
          <Image
            src="/images/portfolio/organajzery-001.jpg"
            alt="Партнёрская программа Центр лазерной резки"
            fill priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/95 via-[#1A1A1A]/70 to-[#1A1A1A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 w-full">
          <Breadcrumbs
            items={[{ label: 'Партнёрам' }]}
            darkMode
          />
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Партнёрская программа</span>
          <h1 className="font-display text-5xl sm:text-6xl text-white tracking-wider mt-2 mb-6 leading-[1.05]">
            Зарабатывайте<br />вместе с нами
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mb-10 leading-[1.75]">
            Приводите клиентов — мы производим, вы получаете вознаграждение. Подходит для дизайнеров,
            ивент-агентств, рекламщиков и всех, кто работает с корпоративными клиентами.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href={`${waBase}?text=${waText}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FF6B00] text-white font-semibold px-6 py-3.5 rounded-full hover:bg-[#e05a00] transition-colors shadow-[0_4px_20px_rgba(255,107,0,0.35)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.525 5.848L.057 23.944l6.244-1.637A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.359-.213-3.706.972.988-3.612-.234-.37A9.818 9.818 0 1112 21.818z"/></svg>
              Стать партнёром
            </a>
            <a href={`${business.telegram}?text=${waText}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/20 transition-colors border border-white/10">
              Telegram
            </a>
            <a href={business.max} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2B7FFF] to-[#9B3FE8] text-white font-semibold px-6 py-3.5 rounded-full hover:brightness-110 transition-[filter]">
              MAX
            </a>
          </div>
        </div>
      </div>

      {/* Formats */}
      <section className="py-20 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Кому подойдёт</span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#1A1A1A] tracking-wider mt-2">
              Форматы сотрудничества
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {formats.map(f => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-[#E8E6E0] hover:border-[#FF6B00]/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-[border-color,box-shadow] duration-200"
              >
                <div className="text-3xl mb-4" aria-hidden="true">{f.icon}</div>
                <h3 className="font-display text-xl text-[#1A1A1A] tracking-wide mb-2">{f.title}</h3>
                <p className="text-sm text-[#8A8680] leading-relaxed mb-5">{f.desc}</p>
                <div className="flex items-end gap-1.5 pt-4 border-t border-[#F5F4F0]">
                  <span className="font-display text-2xl text-[#FF6B00] tracking-wide leading-none">{f.reward}</span>
                  <span className="text-xs text-[#8A8680] mb-0.5">{f.rewardLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Преимущества</span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#1A1A1A] tracking-wider mt-2">
              Что вы получаете
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map(b => (
              <div key={b.text} className="flex items-start gap-3 bg-[#F5F4F0] rounded-xl p-4">
                <div className="flex-shrink-0 mt-0.5 text-[#FF6B00]">
                  <SymbolIcon symbol={b.icon} size={18} />
                </div>
                <p className="text-sm text-[#2D2D2D] leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-[#F5F4F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-12 text-center">
            <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Как начать</span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#1A1A1A] tracking-wider mt-2">
              4 шага до первого вознаграждения
            </h2>
          </div>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="flex gap-6 bg-white rounded-2xl p-6 border border-[#E8E6E0]"
              >
                <div className="flex-shrink-0">
                  <span className="font-display text-4xl text-[#FF6B00]/20 tracking-wider leading-none">
                    {s.num}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-[#1A1A1A] tracking-wide mb-1">{s.title}</h3>
                  <p className="text-sm text-[#8A8680] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ mini */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-8">Частые вопросы</h2>
          <div className="space-y-5">
            {[
              {
                q: 'Есть ли минимальный порог для выплаты вознаграждения?',
                a: 'Нет минимального порога. Выплачиваем вознаграждение после каждого оплаченного заказа вашего реферала, либо суммируем за месяц — как вам удобнее.',
              },
              {
                q: 'Как я узнаю, что мой реферал сделал заказ?',
                a: 'Мы уведомим вас в момент поступления заказа и после его оплаты клиентом. Для агентств — ведём сводную таблицу по всем рефералам.',
              },
              {
                q: 'Можно ли не называть Центр лазерной резки при работе с клиентом?',
                a: 'Да, работаем по схеме белой этикетки. Отправим продукцию без нашей маркировки, счёт выставим на ваше юрлицо.',
              },
              {
                q: 'Нужно ли заключать официальный договор?',
                a: 'Для разовых рефералов — нет, достаточно договорённости. Для агентств и регулярного сотрудничества заключаем партнёрское соглашение с чёткими условиями.',
              },
            ].map(item => (
              <details key={item.q} className="group border-b border-[#E8E6E0] pb-5">
                <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                  <span className="font-semibold text-[#1A1A1A] text-sm leading-snug">{item.q}</span>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-[#E8E6E0] flex items-center justify-center text-[#8A8680] group-open:text-[#FF6B00] group-open:border-[#FF6B00]/40 transition-colors text-sm font-mono">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[#8A8680] leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#FF6B00]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wider mb-4">
            Готовы начать?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Напишите нам — расскажем об условиях и ответим на вопросы.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`${business.whatsapp.split('?')[0]}?text=${waText}`} target="_blank" rel="noopener noreferrer"
              className="bg-white text-[#FF6B00] font-semibold px-6 py-3.5 rounded-full hover:bg-white/90 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
              WhatsApp
            </a>
            <a href={`${business.telegram}?text=${waText}`} target="_blank" rel="noopener noreferrer"
              className="bg-white/20 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/30 transition-colors border border-white/30">
              Telegram
            </a>
            <a href={business.max} target="_blank" rel="noopener noreferrer"
              className="bg-white/20 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/30 transition-colors border border-white/30">
              MAX
            </a>
            <a href={`mailto:${business.email}?subject=${encodeURIComponent('Партнёрство')}`}
              className="bg-white/20 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/30 transition-colors border border-white/30">
              Написать на почту
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
