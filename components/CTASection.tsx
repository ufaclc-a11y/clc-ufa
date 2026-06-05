import { ContactButtons } from './ContactButtons'

type Props = {
  title?:    string
  subtitle?: string
  dark?:     boolean
}

export function CTASection({
  title    = 'Есть идея или задача?',
  subtitle = 'Отправьте макет, фото или эскиз — подскажем материал, рассчитаем стоимость и срок.',
  dark     = false,
}: Props) {
  return (
    <section className={`relative overflow-hidden ${dark ? 'bg-[#1A1A1A]' : 'bg-[#FF6B00]'}`}>
      {/* Многослойные градиенты для глубины */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: dark
            ? 'radial-gradient(ellipse 70% 80% at 20% 50%, rgba(255,107,0,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 80% 30%, rgba(255,165,0,0.04) 0%, transparent 55%)'
            : 'radial-gradient(ellipse 60% 80% at 10% 50%, rgba(255,255,255,0.12) 0%, transparent 55%), radial-gradient(ellipse 40% 60% at 90% 80%, rgba(0,0,0,0.08) 0%, transparent 50%)',
        }}
      />
      {/* Зернистость */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")" }}
      />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wider mb-4 leading-tight">
          {title}
        </h2>
        <p className={`text-lg leading-[1.7] mb-10 ${dark ? 'text-white/50' : 'text-white/85'}`}>
          {subtitle}
        </p>
        <ContactButtons variant="dark" size="lg" className="justify-center" />
      </div>
    </section>
  )
}
