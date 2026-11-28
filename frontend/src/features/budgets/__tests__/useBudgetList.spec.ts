import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { fetchBudgets } from '../api/budgets'
import { useBudgetList } from '../composables/useBudgetList'
import type { BudgetSummary } from '../types'

describe('useBudgetList', () => {
  it('wyszukiwanie zawęża wiersze, ale nie zmienia KPI', async () => {
    const source = ref<BudgetSummary[]>((await fetchBudgets({ year: 2026 })).budgets)
    const list = useBudgetList(source)

    expect(list.total.value).toBe(5)
    list.query.value = 'szkolenia'

    expect(list.filtered.value.map((row) => row.code)).toEqual(['FIN-2026-03'])
    expect(list.total.value).toBe(1)
    expect(list.hasQuery.value).toBe(true)
    expect(list.totals.value.count).toBe(5)

    list.query.value = 'nic takiego'
    expect(list.total.value).toBe(0)

    list.clearQuery()
    expect(list.total.value).toBe(5)
    expect(list.hasQuery.value).toBe(false)
  })

  it('reaguje na zmianę danych źródłowych', async () => {
    const source = ref<BudgetSummary[]>([])
    const list = useBudgetList(source)
    expect(list.total.value).toBe(0)

    source.value = (await fetchBudgets({ year: 2026 })).budgets
    expect(list.total.value).toBe(5)
  })
})
