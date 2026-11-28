import { useQuery } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import rawBudgets from '../mocks/budgets.json'
import { budgetCodeSchema, budgetDataSchema } from '../schemas'
import type { BudgetDetails, BudgetListResponse } from '../types'

export function budgetsQueryKey(year: number) {
  return ['budgets', 'list', { year }] as const
}

export function budgetDetailsQueryKey(code: string) {
  return ['budgets', 'details', code] as const
}

/** Kod z trasy w postaci kanonicznej – `/budgets/fin-2026-01` działa jak `/budgets/FIN-2026-01`. */
export function normalizeBudgetCode(code: string): string {
  return code.trim().toUpperCase()
}

/**
 * Dane demo walidowane schematem – źródło traktujemy jako niezaufane.
 *
 * TODO(Faza 3): zastąpić lokalny JSON wywołaniami API (`http.get('/budgets', { params:
 * { year } })` oraz `http.get('/budgets/:code')`). Zakres widocznych budżetów i kwot
 * (przełożony vs. pracownik) oraz `scope` muszą wynikać z uprawnień sprawdzanych na serwerze.
 */
function loadBudgetData() {
  return budgetDataSchema.parse(rawBudgets)
}

/** Lista budżetów na dany rok (podsumowania wierszy) wraz z zakresem widoczności. */
export async function fetchBudgets({ year }: { year: number }): Promise<BudgetListResponse> {
  const { scope, budgets } = loadBudgetData()
  return {
    scope,
    budgets: budgets
      .filter((budget) => budget.year === year)
      .map(({ code, name, year: budgetYear, limit, spent, committed }) => ({
        code,
        name,
        year: budgetYear,
        limit,
        spent,
        committed,
      })),
  }
}

/**
 * Szczegóły budżetu; `null`, gdy kod jest niepoprawny albo budżet nie istnieje.
 *
 * TODO(Faza 3): po przejściu na API mapować 404 (brak budżetu) i 403 (brak dostępu) na `null`
 * – widok pokaże wtedy „Nie znaleziono budżetu” bez zdradzania, czy budżet istnieje.
 */
export async function fetchBudgetDetails(code: string): Promise<BudgetDetails | null> {
  const normalized = normalizeBudgetCode(code)
  if (!budgetCodeSchema.safeParse(normalized).success) return null
  return loadBudgetData().budgets.find((budget) => budget.code === normalized) ?? null
}

const MAX_RETRIES = 3

/**
 * Ponawiamy tylko błędy przejściowe: brak odpowiedzi (sieć) i 5xx – do 3 prób. Błędów 4xx
 * oraz błędów walidacji danych (np. ZodError) nie ponawiamy – nie znikną same.
 */
export function shouldRetryBudgetQuery(failureCount: number, error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const status = error.response?.status
  if (status !== undefined && status < 500) return false
  return failureCount < MAX_RETRIES
}

export function useBudgetsQuery(year: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: computed(() => budgetsQueryKey(toValue(year))),
    queryFn: () => fetchBudgets({ year: toValue(year) }),
    retry: shouldRetryBudgetQuery,
  })
}

export function useBudgetDetailsQuery(code: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => budgetDetailsQueryKey(normalizeBudgetCode(toValue(code)))),
    queryFn: () => fetchBudgetDetails(toValue(code)),
    retry: shouldRetryBudgetQuery,
  })
}
