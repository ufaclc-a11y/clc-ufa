import Link  from 'next/link'
import Image from 'next/image'
import { type Service } from '@/data/services'
import { SymbolIcon } from '@/components/Icons'

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative aspect-[4/3] rounded-2xl overflow-hidden block bg-[#2D2D2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 hover:-translate-y-0.5 transition-transform duration-300"
    >
      {/* Photo */}
      <Image
        src={service.image}
        alt={service.shortTitle}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Top: icon */}
      <div className="absolute top-4 right-4 text-white/60 group-hover:text-[#FF6B00] transition-colors duration-200">
        <SymbolIcon symbol={service.icon} size={24} />
      </div>

      {/* Bottom: text */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-display text-2xl text-white tracking-wider mb-2 leading-tight group-hover:text-[#FF6B00] transition-colors duration-200">
          {service.shortTitle}
        </h3>
        <p className="text-xs text-white/60 leading-relaxed line-clamp-2 mb-3">
          {service.shortDescription}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {service.materials.slice(0, 4).map(m => (
            <span key={m} className="text-[10px] bg-white/10 backdrop-blur-sm text-white/75 px-2 py-0.5 rounded-full border border-white/10">
              {m}
            </span>
          ))}
          {service.materials.length > 4 && (
            <span className="text-[10px] text-[#FF6B00] px-1 py-0.5">
              +{service.materials.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
