'use client'

import { useState } from 'react'
import { business } from '@/data/contacts'
import Link from 'next/link'
import { SymbolIcon } from '@/components/Icons'

// ── Price estimation logic ────────────────────────────────────────────────────

type ServiceKey = 'laser' | 'uv' | 'engraving-metal' | 'engraving-wood' | 'cnc' | 'product'
type MaterialKey = string

type Step = 'service' | 'material' | 'size' | 'qty' | 'result'

const services: { key: ServiceKey; label: string; icon: string; desc: string }[] = [
  { key: 'laser',          label: 'Лазерная резка',         icon: '⚡', desc: 'Фанера, акрил, МДФ, ПВХ, кожа, картон' },
  { key: 'uv',             label: 'УФ-печать',              icon: '🎨', desc: 'Печать на акриле, дереве, металле, коже' },
  { key: 'engraving-metal',label: 'Гравировка на металле',  icon: '◈', desc: 'Кружки, ножи, термосы, жетоны, медали' },
  { key: 'engraving-wood', label: 'Гравировка (дерево/кожа)',icon: '✦', desc: 'Брелоки, органайзеры, менажницы, доски' },
  { key: 'cnc',            label: 'Фрезерная резка ЧПУ',    icon: '⚙️', desc: 'Крупные детали, мебель, 3D-обработка' },
  { key: 'product',        label: 'Готовое изделие',        icon: '▣', desc: 'Часы, ключницы, шкатулки, медальницы' },
]

const materialsByService: Record<ServiceKey, { key: MaterialKey; label: string }[]> = {
  laser: [
    { key: 'fanera-3',  label: 'Фанера 3 мм'     },
    { key: 'fanera-4',  label: 'Фанера 4 мм'     },
    { key: 'fanera-6',  label: 'Фанера 6 мм'     },
    { key: 'akril',     label: 'Акрил'            },
    { key: 'pvh',       label: 'ПВХ'              },
    { key: 'mdf',       label: 'МДФ'              },
    { key: 'kozha',     label: 'Кожа / экокожа'   },
    { key: 'karton',    label: 'Картон'           },
  ],
  uv: [
    { key: 'akril',     label: 'Акрил'            },
    { key: 'fanera',    label: 'Фанера / дерево'  },
    { key: 'metall',    label: 'Металл'           },
    { key: 'pvh',       label: 'ПВХ / пластик'   },
    { key: 'steklo',    label: 'Стекло'           },
    { key: 'kozha',     label: 'Кожа'             },
  ],
  'engraving-metal': [
    { key: 'kruzhka',   label: 'Кружка'           },
    { key: 'termos',    label: 'Термос'           },
    { key: 'nozh',      label: 'Нож'              },
    { key: 'zheton',    label: 'Жетон / медаль'   },
    { key: 'list',      label: 'Листовой металл'  },
  ],
  'engraving-wood': [
    { key: 'brelok',    label: 'Брелок'           },
    { key: 'organajzer',label: 'Органайзер'       },
    { key: 'menazhnica',label: 'Менажница'        },
    { key: 'fanera',    label: 'Фанера / дерево'  },
    { key: 'kozha',     label: 'Кожа / экокожа'   },
  ],
  cnc: [
    { key: 'fanera',    label: 'Фанера'           },
    { key: 'mdf',       label: 'МДФ'              },
    { key: 'pvh',       label: 'ПВХ'              },
    { key: 'akril',     label: 'Акрил'            },
    { key: 'derevo',    label: 'Дерево'           },
    { key: 'kompozit',  label: 'Алюминиевый композит' },
  ],
  product: [
    { key: 'chasy',     label: 'Часы настенные'   },
    { key: 'klyuchnitsa',label: 'Ключница'        },
    { key: 'medalnitsa', label: 'Медальница'      },
    { key: 'shkatulka', label: 'Шкатулка'         },
    { key: 'kopilka',   label: 'Копилка'          },
    { key: 'medal',     label: 'Медаль'           },
  ],
}

const sizeOptions = [
  { key: 'xs',   label: 'Маленький',    desc: 'до 50 × 50 мм',     mult: 0.6 },
  { key: 'sm',   label: 'Небольшой',   desc: '50–150 мм',          mult: 1.0 },
  { key: 'md',   label: 'Средний',     desc: '150–300 мм',         mult: 1.6 },
  { key: 'lg',   label: 'Крупный',     desc: '300–600 мм',         mult: 2.5 },
  { key: 'xl',   label: 'Большой',     desc: 'свыше 600 мм',      mult: 4.0 },
]

const qtyOptions = [
  { key: '1',    label: '1 шт',         mult: 1.0  },
  { key: '5',    label: '2–10 шт',      mult: 0.9  },
  { key: '25',   label: '10–50 шт',     mult: 0.75 },
  { key: '100',  label: '50–200 шт',    mult: 0.6  },
  { key: '500',  label: 'от 200 шт',    mult: 0.5  },
]

// Base prices per service (₽ for single medium unit)
const basePrices: Record<ServiceKey, number> = {
  laser:            350,
  uv:               450,
  'engraving-metal':250,
  'engraving-wood': 180,
  cnc:              900,
  product:          700,
}

function estimate(service: ServiceKey, sizeMult: number, qtyMult: number, qty: number): [number, number] {
  const base = basePrices[service]
  const unitPrice = Math.round(base * sizeMult * qtyMult / 50) * 50
  const min = Math.max(100, Math.round(unitPrice * 0.8 / 50) * 50)
  const max = Math.round(unitPrice * 1.3 / 50) * 50
  return [min * qty, max * qty]
}

// ── Stepper UI ────────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
            i < current ? 'bg-[#FF6B00]' : i === current ? 'bg-[#FF6B00]/50' : 'bg-[#E8E6E0]'
          }`}
        />
      ))}
    </div>
  )
}

function OptionCard({
  label, desc, icon, selected, onClick,
}: {
  label: string; desc?: string; icon?: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
        selected
          ? 'border-[#FF6B00] bg-[#FF6B00]/5 shadow-[0_0_0_4px_rgba(255,107,0,0.08)]'
          : 'border-[#E8E6E0] bg-white hover:border-[#FF6B00]/40 hover:bg-[#FF6B00]/3'
      }`}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 shrink-0 text-[#8A8680]">
            <SymbolIcon symbol={icon} size={18} />
          </span>
        )}
        <div>
          <div className={`font-semibold text-sm ${selected ? 'text-[#FF6B00]' : 'text-[#1A1A1A]'}`}>{label}</div>
          {desc && <div className="text-xs text-[#8A8680] mt-0.5 leading-snug">{desc}</div>}
        </div>
        {selected && (
          <div className="ml-auto shrink-0 w-5 h-5 rounded-full bg-[#FF6B00] flex items-center justify-center">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        )}
      </div>
    </button>
  )
}

export default function CalculatorPage() {
  const [step,     setStep]     = useState<Step>('service')
  const [service,  setService]  = useState<ServiceKey | null>(null)
  const [material, setMaterial] = useState<MaterialKey | null>(null)
  const [sizeKey,  setSizeKey]  = useState<string | null>(null)
  const [qtyKey,   setQtyKey]   = useState<string | null>(null)

  const stepIdx: Record<Step, number> = { service: 0, material: 1, size: 2, qty: 3, result: 4 }
  const currentIdx = stepIdx[step]

  const next = (nextStep: Step) => {
    setStep(nextStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sizeOption = sizeOptions.find(s => s.key === sizeKey)
  const qtyOption  = qtyOptions.find(q => q.key === qtyKey)

  const [priceMin, priceMax] = service && sizeOption && qtyOption
    ? estimate(service, sizeOption.mult, qtyOption.mult, parseInt(qtyKey!))
    : [0, 0]

  const serviceName = services.find(s => s.key === service)?.label ?? ''

  const waMessage = encodeURIComponent(
    `Здравствуйте! Хочу узнать точную цену.\n` +
    `Услуга: ${serviceName}\n` +
    `Материал: ${material ?? 'не выбран'}\n` +
    `Размер: ${sizeOption?.desc ?? ''}\n` +
    `Количество: ${qtyOption?.label ?? ''}`
  )

  return (
    <div className="min-h-screen bg-[#F5F4F0] pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-6 h-px bg-[#FF6B00]" />
            <span className="font-mono text-xs text-[#FF6B00] tracking-[0.2em] uppercase">Калькулятор</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider mb-3">
            Рассчитать стоимость
          </h1>
          <p className="text-[#8A8680] leading-relaxed">
            Ориентировочная цена за 30 секунд. Точная цена — по вашему макету и размерам.
          </p>
        </div>

        {/* Stepper */}
        <StepIndicator current={currentIdx} total={5} />

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E6E0] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">

          {/* Step 1: Service */}
          {step === 'service' && (
            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">Что нужно сделать?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map(s => (
                  <OptionCard
                    key={s.key}
                    label={s.label}
                    desc={s.desc}
                    icon={s.icon}
                    selected={service === s.key}
                    onClick={() => { setService(s.key); setMaterial(null) }}
                  />
                ))}
              </div>
              <button
                onClick={() => next('material')}
                disabled={!service}
                className="mt-6 w-full bg-[#FF6B00] text-white font-semibold py-3.5 rounded-full hover:bg-[#e55e00] active:bg-[#cc5400] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Далее →
              </button>
            </div>
          )}

          {/* Step 2: Material */}
          {step === 'material' && service && (
            <div>
              <button onClick={() => setStep('service')} className="text-sm text-[#8A8680] hover:text-[#1A1A1A] mb-4 transition-colors">← Назад</button>
              <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">Материал или изделие</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {materialsByService[service].map(m => (
                  <OptionCard
                    key={m.key}
                    label={m.label}
                    selected={material === m.key}
                    onClick={() => setMaterial(m.key)}
                  />
                ))}
              </div>
              <button
                onClick={() => next('size')}
                disabled={!material}
                className="mt-6 w-full bg-[#FF6B00] text-white font-semibold py-3.5 rounded-full hover:bg-[#e55e00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Далее →
              </button>
            </div>
          )}

          {/* Step 3: Size */}
          {step === 'size' && (
            <div>
              <button onClick={() => setStep('material')} className="text-sm text-[#8A8680] hover:text-[#1A1A1A] mb-4 transition-colors">← Назад</button>
              <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">Примерный размер</h2>
              <div className="grid grid-cols-1 gap-3">
                {sizeOptions.map(s => (
                  <OptionCard
                    key={s.key}
                    label={s.label}
                    desc={s.desc}
                    selected={sizeKey === s.key}
                    onClick={() => setSizeKey(s.key)}
                  />
                ))}
              </div>
              <button
                onClick={() => next('qty')}
                disabled={!sizeKey}
                className="mt-6 w-full bg-[#FF6B00] text-white font-semibold py-3.5 rounded-full hover:bg-[#e55e00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Далее →
              </button>
            </div>
          )}

          {/* Step 4: Quantity */}
          {step === 'qty' && (
            <div>
              <button onClick={() => setStep('size')} className="text-sm text-[#8A8680] hover:text-[#1A1A1A] mb-4 transition-colors">← Назад</button>
              <h2 className="font-display text-2xl text-[#1A1A1A] tracking-wide mb-6">Количество</h2>
              <div className="grid grid-cols-1 gap-3">
                {qtyOptions.map(q => (
                  <OptionCard
                    key={q.key}
                    label={q.label}
                    selected={qtyKey === q.key}
                    onClick={() => setQtyKey(q.key)}
                  />
                ))}
              </div>
              <button
                onClick={() => next('result')}
                disabled={!qtyKey}
                className="mt-6 w-full bg-[#FF6B00] text-white font-semibold py-3.5 rounded-full hover:bg-[#e55e00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Узнать ориентир →
              </button>
            </div>
          )}

          {/* Step 5: Result */}
          {step === 'result' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="font-mono text-2xl text-[#FF6B00]">₽</span>
              </div>
              <p className="text-[#8A8680] text-sm mb-2">Ориентировочная стоимость</p>
              <div className="font-display text-5xl text-[#1A1A1A] tracking-wider mb-1">
                {priceMin.toLocaleString('ru-RU')} – {priceMax.toLocaleString('ru-RU')} ₽
              </div>
              <p className="text-xs text-[#8A8680] mt-2 mb-8">
                Это приблизительная оценка. Точная цена зависит от вашего макета и деталей заказа.
              </p>

              {/* Summary */}
              <div className="bg-[#F5F4F0] rounded-2xl p-5 text-left mb-8 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8680]">Услуга:</span>
                  <span className="font-semibold text-[#1A1A1A]">{serviceName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8680]">Материал:</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {materialsByService[service!].find(m => m.key === material)?.label ?? material}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8680]">Размер:</span>
                  <span className="font-semibold text-[#1A1A1A]">{sizeOption?.desc}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8680]">Количество:</span>
                  <span className="font-semibold text-[#1A1A1A]">{qtyOption?.label}</span>
                </div>
              </div>

              <a
                href={`https://wa.me/79374838003?text=${waMessage}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-semibold py-3.5 rounded-full hover:bg-[#1da857] active:opacity-80 transition-colors mb-3 shadow-[0_2px_12px_rgba(37,211,102,0.3)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.525 5.848L.057 23.944l6.244-1.637A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.359-.213-3.706.972.988-3.612-.234-.37A9.818 9.818 0 1112 21.818z"/></svg>
                Написать в WhatsApp с деталями
              </a>

              <button
                onClick={() => { setStep('service'); setService(null); setMaterial(null); setSizeKey(null); setQtyKey(null) }}
                className="text-sm text-[#8A8680] hover:text-[#1A1A1A] transition-colors"
              >
                Рассчитать другой заказ
              </button>
            </div>
          )}
        </div>

        {/* Note */}
        <p className="text-xs text-[#8A8680] text-center mt-6 leading-relaxed">
          Калькулятор даёт ориентир. Точная цена считается по вашему конкретному макету и параметрам.{' '}
          <Link href="/contacts" className="text-[#FF6B00] hover:underline">Напишите нам</Link>{' '}
          — ответим быстро.
        </p>
      </div>
    </div>
  )
}
