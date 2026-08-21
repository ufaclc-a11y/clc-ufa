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

      {/* Legibility scrim: bottom half nearly solid, fades out toward the top */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.97)_0%,rgba(0,0,0,0.94)_45%,rgba(0,0,0,0.55)_65%,rgba(0,0,0,0.10)_100%)]" />

      {/* Top: icon (own shadow so it reads on bright photos) */}
      <div className="absolute top-4 right-4 text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] group-hover:text-[#FF6B00] transition-colors duration-200">
        <SymbolIcon symbol={service.icon} size={24} />
      </div>

      {/* Bottom: text */}
      <div className="absolute inset-x-0 bottom-0 p-5 [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]">
        <h3 className="font-display text-[1.7rem] text-white tracking-wider mb-2 leading-tight group-hover:text-[#FF6B00] transition-colors duration-200">
          {service.shortTitle}
        </h3>
        <p className="text-xs text-white/85 leading-relaxed line-clamp-2 mb-3">
          {service.shortDescription}
        </p>
        <div className="flex flex-wrap gap-1.5 [text-shadow:none]">
          {service.materials.slice(0, 4).map(m => (
            <span key={m} className="text-xs bg-black/35 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded-full border border-white/15">
              {m}
            </span>
          ))}
          {service.materials.length > 4 && (
            <span className="text-xs text-[#9D3900] px-1 py-0.5">
              +{service.materials.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
