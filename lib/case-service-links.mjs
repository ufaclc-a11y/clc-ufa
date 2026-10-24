// Curated existing destinations only. Existence is checked against real route data in tests.
export const caseServiceLinks = [
  { href: '/services/izgotovlenie-izdelij', title: 'Изготовление изделий' },
  { href: '/services/uf-pechat', title: 'УФ-печать' },
  { href: '/lazernaya-rezka-akrila-ufa', title: 'Лазерная резка акрила' },
  { href: '/suveniry-na-zakaz-ufa', title: 'Сувениры на заказ' },
]

export function allowedCaseServicePaths(input) {
  return Array.isArray(input) ? [...new Set(input.filter(href => caseServiceLinks.some(link => link.href === href)))] : []
}
