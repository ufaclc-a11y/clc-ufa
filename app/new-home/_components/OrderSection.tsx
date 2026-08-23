import { OrderForm } from '@/components/OrderForm'
import { business } from '@/data/contacts'

export function OrderSection() {
  return (
    <section id="order" className="scroll-mt-24 bg-[#0D2A80] py-16 text-white sm:py-28" aria-labelledby="order-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <h2 id="order-title" className="new-home-display max-w-[12ch] text-[34px] leading-[1.04] sm:text-[48px]">Покажите задачу. Ответим с ценой и сроком.</h2>
          <p className="mt-6 max-w-md text-base leading-7 text-white/75">Приложите макет, фотографию или эскиз. Если файла нет, опишите идею словами.</p>
          <address className="mt-8 border-y border-white/30 py-5 text-base not-italic leading-8">
            <a href={`tel:${business.phone}`} className="block font-bold hover:text-[#E7FF42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7FF42]">{business.phoneDisplay}</a>
            <span className="block">{business.address}</span>
            <span className="block text-white/65">{business.workingHours}</span>
          </address>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
            <a href={business.whatsapp} target="_blank" rel="noopener noreferrer" className="underline decoration-[#E7FF42] underline-offset-4 hover:text-[#E7FF42]">WhatsApp</a>
            <a href={business.telegram} target="_blank" rel="noopener noreferrer" className="underline decoration-[#E7FF42] underline-offset-4 hover:text-[#E7FF42]">Telegram</a>
            <a href={business.max} target="_blank" rel="noopener noreferrer" className="underline decoration-[#E7FF42] underline-offset-4 hover:text-[#E7FF42]">Макс</a>
          </div>
        </div>
        <div className="lg:col-span-7">
          <OrderForm />
        </div>
      </div>
    </section>
  )
}
