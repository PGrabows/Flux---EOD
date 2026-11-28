import type { BudgetAccessRole, BudgetListScope, BudgetViewerRole } from './types'

/** Rok pokazywany domyślnie – dane demo obejmują budżety na 2026. */
export const DEFAULT_BUDGET_YEAR = 2026

/** Dopuszczalny zakres roku z parametru `?year=` (wartości spoza zakresu są ignorowane). */
export const MIN_BUDGET_YEAR = 2000
export const MAX_BUDGET_YEAR = 2100

export const BUDGET_ACCESS_ROLE_LABELS: Record<BudgetAccessRole, string> = {
  owner: 'właściciel budżetu',
  viewer: 'wgląd w szczegóły',
}

/** Rola oglądającego w formie „Widzisz … jako <rola>”. */
export const BUDGET_VIEWER_ROLE_LABELS: Record<BudgetViewerRole, string> = {
  manager: 'przełożony',
  owner: 'właściciel budżetu',
}

/** Podtytuł widoku listy, np. „Budżety działu Finanse, z których korzystasz — …”. */
export function getBudgetsSubtitle(scope: BudgetListScope): string {
  return `Budżety działu ${scope.department}, z których korzystasz — limity, zaangażowanie i kwoty do dyspozycji.`
}

/** Notatka o zakresie widoczności nad tabelą budżetów. */
export function getBudgetScopeNote(scope: BudgetListScope): string {
  return (
    `Widzisz budżety działu ${scope.department} jako ` +
    `${BUDGET_VIEWER_ROLE_LABELS[scope.viewerRole]}. Pozostali pracownicy widzą tylko ` +
    'pozostałą kwotę przy wyborze budżetu w dokumencie.'
  )
}

/** Rok z parametru zapytania trasy (`?year=2026`); niepoprawny lub brak – rok domyślny. */
export function parseBudgetYear(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || !/^\d{4}$/.test(raw)) return DEFAULT_BUDGET_YEAR
  const year = Number(raw)
  return year >= MIN_BUDGET_YEAR && year <= MAX_BUDGET_YEAR ? year : DEFAULT_BUDGET_YEAR
}
