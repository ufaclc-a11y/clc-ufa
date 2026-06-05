import type { Metadata } from 'next'
import { Breadcrumbs }  from '@/components/Breadcrumbs'
import { CTASection }   from '@/components/CTASection'
import { ProductsGrid } from '@/components/ProductsGrid'

export const metadata: Metadata = {
  title:       'Каталог изделий — медали, таблички, вывески, сувениры | Центр лазерной резки Уфа',
  description: 'Каталог изделий Центр лазерной резки: медали, таблички, вывески, бейджи, трафареты, хештеги, номерки, сувениры и детали для производств. Изготовление в Уфе.',
  alternates:  { canonical: 'https://clc-ufa.ru/products' },
}

export default function ProductsPage() {
  return (
    <>
      <div className="pt-24 pb-20 bg-[#F5F4F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumbs items={[{ label: 'Изделия' }]} />
          <span className="font-mono text-xs text-[#FF6B00] tracking-widest uppercase">Каталог</span>
          <h1 className="font-display text-5xl sm:text-6xl text-[#1A1A1A] tracking-wider mt-2 mb-4">
            Что мы изготавливаем
          </h1>
          <p className="text-lg text-[#8A8680] max-w-2xl mb-10">
            Любое изделие — по вашему макету, размеру и материалу. Отправьте запрос — рассчитаем стоимость.
          </p>

          <ProductsGrid />
        </div>
      </div>
      <CTASection />
    </>
  )
}
