import type { Metadata } from 'next'
import { services }      from '@/data/services'
import { ServiceCard }   from '@/components/ServiceCard'
import { Breadcrumbs }   from '@/components/Breadcrumbs'
import { CTASection }    from '@/components/CTASection'

export const metadata: Metadata = {
  title:       'Услуги — лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ в Уфе',
  description: 'Все услуги Центр лазерной резки: лазерная резка, УФ-печать, гравировка и фрезеровка ЧПУ в Уфе. Работаем с фанерой, акрилом, ПВХ, МДФ и другими материалами.',
  keywords:    ['услуги лазерной резки уфа', 'лазерная резка гравировка уфа', 'уф печать фрезеровка уфа', 'изготовление изделий уфа'],
  alternates:  { canonical: 'https://clc-ufa.ru/services' },
}

export default function ServicesPage() {
  return (
    <>
      <div className="pt-24 pb-20 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumbs items={[{ label: 'Услуги' }]} />

          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Что мы делаем</span>
          <h1 className="font-display text-5xl sm:text-6xl text-[#1A1A1A] tracking-wider mt-2 mb-4">
            Услуги
          </h1>
          <p className="text-lg text-[#8A8680] max-w-2xl leading-relaxed mb-14">
            Совмещаем несколько технологий в одном месте — удобно, когда изделие требует резки, гравировки и печати одновременно.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </div>
      <CTASection />
    </>
  )
}
