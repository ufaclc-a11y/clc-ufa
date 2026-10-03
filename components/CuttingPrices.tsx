import { cuttingGroups, cuttingRates, minimumOrder, type CuttingMethod } from '@/data/cutting-prices'

type Props = { method?: CuttingMethod; groups?: string[] }

export function CuttingPrices({ method, groups }: Props) {
  const selected = Object.entries(cuttingGroups)
    .filter(([key]) => !groups || groups.includes(key))
    .map(([key, title]) => ({ key, title, rows: cuttingRates.filter(rate =>
      rate.group === key && (!method || rate[method] !== undefined)) }))
    .filter(group => group.rows.length)
  if (!selected.length) return null

  return (
    <section id="cutting-prices" aria-labelledby="cutting-prices-title" className="scroll-mt-24">
      <h2 id="cutting-prices-title" className="font-display text-3xl sm:text-4xl text-[#1A1A1A] tracking-wide">
        {method === 'laser' ? 'Цены на лазерную резку' : method === 'cnc' ? 'Цены на фрезерную резку' : 'Стоимость резки материалов'}
      </h2>
      <p className="text-[#6E6A64] mt-3 mb-6 leading-relaxed">
        Цена за 1 метр реза, без стоимости материала. Минимальный заказ — {minimumOrder} ₽.
        {!method && ' Прочерк означает, что тариф не указан — стоимость уточняйте при расчёте.'}
        {method === 'cnc' && ' Тарифы относятся к контурной резке. Пазы, карманы и 3D-обработку рассчитываем отдельно.'}
      </p>
      <div className="space-y-4">
        {selected.map(group => (
          <div key={group.key} className="overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white shadow-[0_1px_3px_rgba(90,57,30,0.04),0_6px_18px_rgba(90,57,30,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="text-left font-display text-xl tracking-wide text-[#1A1A1A] px-4 sm:px-6 py-4 border-b border-[#E8E6E0]">{group.title}</caption>
                <thead className="bg-[#F5F4F0] text-[#6E6A64]">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 font-medium">Материал / толщина</th>
                    {(!method || method === 'laser') && <th scope="col" className="px-4 sm:px-6 py-3 text-right font-medium">Лазер<br /><span className="whitespace-nowrap">₽/м</span></th>}
                    {(!method || method === 'cnc') && <th scope="col" className="px-4 sm:px-6 py-3 text-right font-medium">Фрезер<br /><span className="whitespace-nowrap">₽/м</span></th>}
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map(rate => (
                    <tr key={rate.label} className="border-t border-[#E8E6E0]">
                      <th scope="row" className="px-4 sm:px-6 py-3 font-normal text-[#2D2D2D]">{rate.label}</th>
                      {(!method || method === 'laser') && <td className="px-4 sm:px-6 py-3 text-right font-mono font-semibold tabular-nums text-[#1A1A1A]">{rate.laser ?? '—'}</td>}
                      {(!method || method === 'cnc') && <td className="px-4 sm:px-6 py-3 text-right font-mono font-semibold tabular-nums text-[#1A1A1A]">{rate.cnc ?? '—'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
