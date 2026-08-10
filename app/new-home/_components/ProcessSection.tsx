type Step = { name: string; text: string }

export function ProcessSection({ steps }: { steps: Step[] }) {
  return (
    <section className="py-16 sm:py-28" aria-labelledby="process-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 id="process-title" className="new-home-display max-w-[15ch] text-[34px] leading-[1.04] sm:text-[48px]">Понятный маршрут от задачи до готового заказа</h2>
        <ol className="relative mt-12 grid grid-cols-2 border-l border-t border-[#C9CFD6] sm:mt-16 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.name} className="relative min-h-52 border-b border-r border-[#C9CFD6] p-4 lg:min-h-64 lg:px-6 lg:py-7">
              <span className="flex h-9 w-9 items-center justify-center bg-[#1647D8] text-sm font-bold tabular-nums text-white" aria-hidden="true">{index + 1}</span>
              <div className="mt-8 lg:mt-12">
                <h3 className="text-lg font-bold">{step.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5E6672]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-col gap-3 text-sm font-bold text-[#0D2A80] sm:flex-row sm:gap-8"><p>Можно без готового макета</p><p>От одной штуки до партии</p><p>Самовывоз в Уфе или доставка</p></div>
      </div>
    </section>
  )
}
