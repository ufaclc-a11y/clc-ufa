import type { Metadata } from 'next'
import Image             from 'next/image'
import { business }      from '@/data/contacts'
import { Breadcrumbs }   from '@/components/Breadcrumbs'
import { ContactButtons } from '@/components/ContactButtons'

export const metadata: Metadata = {
  title:       'Контакты — Центр лазерной резки, Уфа, ул. Менделеева 177',
  description: 'Адрес, телефон и мессенджеры Центр лазерной резки: г. Уфа, ул. Менделеева, 177, 5 этаж, цех 509. Работаем ежедневно с 10:00 до 19:00.',
  keywords:    ['центр лазерной резки уфа адрес', 'лазерная резка менделеева уфа', 'контакты лазерная резка уфа', 'лазерная резка телефон уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/contacts' },
}

export default function ContactsPage() {
  return (
    <>
      {/* ── HERO ── */}
      <div className="relative min-h-[360px] flex items-end bg-[#1A1A1A] overflow-hidden pt-24">
        <div className="absolute inset-0">
          <Image
            src="/images/old-site/about-02.jpg"
            alt="Цех Центр лазерной резки Уфа"
            fill priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/95 via-[#1A1A1A]/70 to-[#1A1A1A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-12 w-full">
          <Breadcrumbs items={[{ label: 'Контакты' }]} darkMode />
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Где мы</span>
          <h1 className="font-display text-5xl sm:text-6xl text-white tracking-wider mt-2 mb-3 leading-[1]">
            Контакты
          </h1>
          <p className="text-white/50 text-lg">{business.address} · {business.workingHours}</p>
        </div>
      </div>

    <div className="pb-20 bg-[#F5F4F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Левая колонка */}
          <div className="space-y-8">

            <div>
              <p className="font-mono text-xs text-[#8A8680] uppercase tracking-widest mb-1">Телефон</p>
              <a
                href={`tel:${business.phone}`}
                className="font-mono text-3xl text-[#1A1A1A] hover:text-[#FF6B00] transition-colors"
              >
                {business.phoneDisplay}
              </a>
            </div>

            <div>
              <p className="font-mono text-xs text-[#8A8680] uppercase tracking-widest mb-3">Мессенджеры</p>
              <ContactButtons showCalc={false} />
              <a
                href={business.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm text-[#2AABEE] hover:underline underline-offset-4"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram-канал @clcchannel
              </a>
            </div>

            <div>
              <p className="font-mono text-xs text-[#8A8680] uppercase tracking-widest mb-1">Email</p>
              <a
                href={`mailto:${business.email}`}
                className="text-lg text-[#1A1A1A] hover:text-[#FF6B00] transition-colors"
              >
                {business.email}
              </a>
            </div>

            <div>
              <p className="font-mono text-xs text-[#8A8680] uppercase tracking-widest mb-1">Адрес</p>
              <p className="text-lg text-[#1A1A1A] leading-relaxed">{business.address}</p>
              <p className="text-sm text-[#8A8680] mt-1">{business.landmark}</p>
            </div>

            <div>
              <p className="font-mono text-xs text-[#8A8680] uppercase tracking-widest mb-1">Режим работы</p>
              <p className="font-display text-2xl text-[#FF6B00] tracking-wider">{business.workingHours}</p>
            </div>

            {/* Как нас найти */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8E6E0]">
              <h2 className="font-display text-xl text-[#1A1A1A] tracking-wider mb-5">Как нас найти</h2>
              <ol className="space-y-3">
                {business.howToFind.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#8A8680] leading-relaxed">
                    <span className="font-mono text-[#FF6B00] shrink-0 mt-0.5">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="text-sm text-[#8A8680] mt-4 pt-4 border-t border-[#E8E6E0]">
                🅿️ {business.parking}
              </p>
            </div>

            {/* Позвонить основателю */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8E6E0]">
              <h2 className="font-display text-xl text-[#1A1A1A] tracking-wider mb-4">Позвонить основателю</h2>
              <p className="text-sm text-[#8A8680] mb-1">{business.founder.name}</p>
              <p className="text-xs text-[#8A8680]/70 uppercase tracking-widest mb-3">{business.founder.role}</p>
              <a
                href={`tel:${business.founder.phone}`}
                className="font-mono text-2xl text-[#1A1A1A] hover:text-[#FF6B00] transition-colors"
              >
                {business.founder.phoneDisplay}
              </a>
            </div>

            {/* Наши реквизиты */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8E6E0]">
              <h2 className="font-display text-xl text-[#1A1A1A] tracking-wider mb-5">Наши реквизиты</h2>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8A8680]">Получатель</dt>
                  <dd className="text-[#1A1A1A] text-right">{business.requisites.ip}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8A8680]">ИНН</dt>
                  <dd className="text-[#1A1A1A] font-mono">{business.requisites.inn}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8A8680]">ОГРНИП</dt>
                  <dd className="text-[#1A1A1A] font-mono">{business.requisites.ogrn}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8A8680]">Расчётный счёт</dt>
                  <dd className="text-[#1A1A1A] font-mono">{business.requisites.account}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8A8680]">Банк</dt>
                  <dd className="text-[#1A1A1A] text-right">{business.requisites.bank}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8A8680]">ИНН банка</dt>
                  <dd className="text-[#1A1A1A] font-mono">{business.requisites.bankInn}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8A8680]">БИК</dt>
                  <dd className="text-[#1A1A1A] font-mono">{business.requisites.bik}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8A8680]">Корр. счёт</dt>
                  <dd className="text-[#1A1A1A] font-mono">{business.requisites.corrAccount}</dd>
                </div>
                <div className="flex justify-between gap-4 pt-2.5 border-t border-[#E8E6E0]">
                  <dt className="text-[#8A8680]">Адрес банка</dt>
                  <dd className="text-[#1A1A1A] text-right">{business.requisites.bankAddress}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Правая колонка — карта */}
          <div className="rounded-3xl overflow-hidden min-h-[400px] border border-[#E8E6E0] relative">
            <iframe
              src={`https://yandex.ru/map-widget/v1/?ll=${business.coords.lng},${business.coords.lat}&z=16&l=map&pt=${business.coords.lng},${business.coords.lat},org&lang=ru_RU`}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              loading="lazy"
              title="Карта — Центр лазерной резки на Яндексе"
              allowFullScreen
            />
            <a
              href={business.yandexMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 inline-flex items-center justify-center gap-1.5 bg-[#FF6B00] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#e55e00] transition-colors shadow-lg leading-none"
            >
              <span>Открыть</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
