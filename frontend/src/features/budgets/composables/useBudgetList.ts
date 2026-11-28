import { computed, type MaybeRefOrGetter, ref, toValue } from 'vue'

import type { BudgetSummary } from '../types'
import { filterBudgets, getBudgetTotals, toBudgetListRow } from '../utils/budget'

/** Stan listy budżetów po stronie klienta: wyliczone wiersze, KPI i wyszukiwanie. */
export function useBudgetList(source: MaybeRefOrGetter<readonly BudgetSummary[]>) {
  const query = ref('')

  /** KPI liczone ze wszystkich budżetów – wyszukiwanie zawęża tylko tabelę. */
  const totals = computed(() => getBudgetTotals(toValue(source)))
  const filtered = computed(() => filterBudgets(toValue(source), query.value).map(toBudgetListRow))
  const total = computed(() => filtered.value.length)
  const hasQuery = computed(() => query.value.trim() !== '')

  function clearQuery() {
    query.value = ''
  }

  return { query, totals, filtered, total, hasQuery, clearQuery }
}
