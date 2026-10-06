// Лёгкий трекинг целей Яндекс.Метрики. Инициализация — в CookieConsent;
// отсутствие счётчика не должно мешать работе сайта.

export const YM_ID = 53776969

export function trackGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  try {
    window.ym?.(YM_ID, 'reachGoal', goal, { ...params, page_path: window.location.pathname })
  } catch {
    /* ym ещё не загружен — игнорируем */
  }
}
