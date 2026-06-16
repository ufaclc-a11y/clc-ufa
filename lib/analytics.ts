// Лёгкий трекинг целей Яндекс.Метрики. ym загружается только после согласия
// (см. CookieConsent), поэтому здесь — безопасный вызов через optional chaining.

export const YM_ID = 53776969

export function trackGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  try {
    window.ym?.(YM_ID, 'reachGoal', goal, params)
  } catch {
    /* ym ещё не загружен — игнорируем */
  }
}
