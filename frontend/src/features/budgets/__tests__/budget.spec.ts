import { describe, expect, it } from 'vitest'

import { fetchBudgetDetails, fetchBudgets } from '../api/budgets'
import type { BudgetSummary } from '../types'
import {
  filterBudgets,
  getBudgetRemaining,
  getBudgetTotals,
  getBudgetUsagePercent,
  getBudgetUsageStatus,
  getMonthlyBars,
  getUsageBarSegments,
  toBudgetListRow,
} from '../utils/budget'

function budget(overrides: Partial<BudgetSummary> = {}): BudgetSummary {
  return {
    code: 'FIN-2026-99',
    name: 'Budżet testowy',
    year: 2026,
    limit: 100_000,
    spent: 0,
    committed: 0,
    ...overrides,
  }
}

describe('obliczenia budżetu', () => {
  it('pozostało = limit − wydane − zaangażowane (także ujemne)', () => {
    expect(getBudgetRemaining(budget({ spent: 59_250, committed: 22_693.5, limit: 120_000 }))).toBe(
      38_056.5,
    )
    expect(getBudgetRemaining(budget({ limit: 25_000, spent: 26_340 }))).toBe(-1_340)
  })

  it('wykorzystanie w % jest zaokrąglone i może przekraczać 100', () => {
    expect(
      getBudgetUsagePercent(budget({ limit: 120_000, spent: 59_250, committed: 22_693.5 })),
    ).toBe(68)
    expect(getBudgetUsagePercent(budget({ limit: 80_000, spent: 61_500, committed: 6_000 }))).toBe(
      84,
    )
    expect(getBudgetUsagePercent(budget({ limit: 25_000, spent: 26_340 }))).toBe(105)
  })

  it.each([
    [79_400, 79, 'ok'],
    [79_960, 80, 'warning'],
    [80_000, 80, 'warning'],
    [99_600, 100, 'warning'],
    [100_000, 100, 'warning'],
    [100_001, 101, 'exceeded'],
    [100_400, 101, 'exceeded'],
    [100_600, 101, 'exceeded'],
    [102_600, 103, 'exceeded'],
  ] as const)(
    'wydane %d z 100 000 → %d%%, status %s (status z wyświetlanego procentu)',
    (spent, percent, status) => {
      expect(getBudgetUsagePercent(budget({ spent }))).toBe(percent)
      expect(getBudgetUsageStatus(budget({ spent }))).toBe(status)
    },
  )

  it('segmenty paska są przycinane do 100% przy przekroczeniu', () => {
    expect(getUsageBarSegments(budget({ spent: 50_000, committed: 25_000 }))).toEqual({
      spent: 50,
      committed: 25,
    })
    expect(getUsageBarSegments(budget({ spent: 90_000, committed: 30_000 }))).toEqual({
      spent: 90,
      committed: 10,
    })
    expect(getUsageBarSegments(budget({ spent: 130_000, committed: 5_000 }))).toEqual({
      spent: 100,
      committed: 0,
    })
  })

  it('wiersz listy zawiera wyliczone pozostało, % i status', () => {
    expect(toBudgetListRow(budget({ spent: 90_000 }))).toMatchObject({
      remaining: 10_000,
      usagePercent: 90,
      status: 'warning',
    })
  })
})

describe('KPI i dane demo', () => {
  it('sumy KPI z danych demo odpowiadają Figmie', async () => {
    const totals = getBudgetTotals((await fetchBudgets({ year: 2026 })).budgets)
    expect(totals).toEqual({
      count: 5,
      limit: 300_000,
      spent: 171_590,
      committed: 34_193.5,
      remaining: 94_216.5,
      spentPercent: 57,
      remainingPercent: 31,
    })
  })

  it('statusy wierszy listy demo odpowiadają Figmie', async () => {
    const rows = (await fetchBudgets({ year: 2026 })).budgets.map(toBudgetListRow)
    expect(rows.map((row) => [row.code, row.usagePercent, row.status])).toEqual([
      ['FIN-2026-01', 68, 'ok'],
      ['FIN-2026-02', 84, 'warning'],
      ['FIN-2026-03', 40, 'ok'],
      ['FIN-2026-04', 105, 'exceeded'],
      ['FIN-2026-05', 40, 'ok'],
    ])
  })

  it('pusta lista daje zerowe sumy bez dzielenia przez zero', () => {
    expect(getBudgetTotals([])).toMatchObject({ count: 0, spentPercent: 0, remainingPercent: 0 })
  })

  it('szczegóły są spójne z listą: wydatki miesięczne = wydane + zaangażowane', async () => {
    for (const summary of (await fetchBudgets({ year: 2026 })).budgets) {
      const details = await fetchBudgetDetails(summary.code)
      expect(details, summary.code).not.toBeNull()
      const monthly = details!.monthlySpending.reduce((sum, item) => sum + item.amount, 0)
      expect(monthly, summary.code).toBeCloseTo(summary.spent + summary.committed, 2)
    }
  })

  it('lista filtruje po roku i zwraca zakres widoczności', async () => {
    const response = await fetchBudgets({ year: 2026 })
    expect(response.scope).toEqual({ department: 'Finanse', viewerRole: 'manager' })
    expect((await fetchBudgets({ year: 2025 })).budgets).toEqual([])
  })

  it('kod jest normalizowany do wielkich liter', async () => {
    expect((await fetchBudgetDetails(' fin-2026-01 '))?.code).toBe('FIN-2026-01')
  })

  it('nieznany lub niepoprawny kod zwraca null', async () => {
    expect(await fetchBudgetDetails('FIN-2026-99')).toBeNull()
    expect(await fetchBudgetDetails('../etc/passwd')).toBeNull()
  })
})

describe('filterBudgets', () => {
  const budgets = [
    budget({ code: 'FIN-2026-01', name: 'Oprogramowanie i licencje' }),
    budget({ code: 'FIN-2026-04', name: 'Wyposażenie biurowe' }),
    budget({ code: 'FIN-2026-05', name: 'Podróże służbowe' }),
  ]

  it('pusta fraza zwraca wszystko', () => {
    expect(filterBudgets(budgets, '   ')).toHaveLength(3)
  })

  it('szuka po nazwie bez wielkości liter i polskich znaków', () => {
    expect(filterBudgets(budgets, 'PODROZE').map((b) => b.code)).toEqual(['FIN-2026-05'])
    expect(filterBudgets(budgets, 'wyposaż').map((b) => b.code)).toEqual(['FIN-2026-04'])
    expect(filterBudgets(budgets, 'sluzbowe').map((b) => b.code)).toEqual(['FIN-2026-05'])
  })

  it('szuka po kodzie', () => {
    expect(filterBudgets(budgets, 'fin-2026-01').map((b) => b.code)).toEqual(['FIN-2026-01'])
    expect(filterBudgets(budgets, 'xyz')).toEqual([])
  })
})

describe('getMonthlyBars', () => {
  it('wysokości są proporcjonalne do maksimum, bieżący miesiąc wg daty stanu', async () => {
    const details = await fetchBudgetDetails('FIN-2026-01')
    const bars = getMonthlyBars(details!)

    expect(bars).toHaveLength(11)
    expect(bars.at(-1)).toMatchObject({ month: 11, height: 104, isCurrent: true })
    expect(bars[0]).toMatchObject({ month: 1, height: 55, isCurrent: false })
    expect(bars.filter((bar) => bar.isCurrent)).toHaveLength(1)
  })

  it('sortuje miesiące i nie oznacza bieżącego miesiąca dla innego roku', () => {
    const monthlySpending = [
      { month: 3, amount: 300 },
      { month: 1, amount: 100 },
      { month: 2, amount: 200 },
    ]
    const sameYear = getMonthlyBars({ year: 2026, asOf: '2026-02-15', monthlySpending })
    expect(sameYear.map((bar) => bar.month)).toEqual([1, 2, 3])
    expect(sameYear.map((bar) => bar.isCurrent)).toEqual([false, true, false])

    const otherYear = getMonthlyBars({ year: 2025, asOf: '2026-02-15', monthlySpending })
    expect(otherYear.some((bar) => bar.isCurrent)).toBe(false)
  })

  it('zerowa kwota ma zerową wysokość, mała – minimalną', () => {
    const bars = getMonthlyBars({
      year: 2026,
      asOf: '2026-03-10',
      monthlySpending: [
        { month: 1, amount: 0 },
        { month: 2, amount: 10 },
        { month: 3, amount: 100_000 },
      ],
    })
    expect(bars.map((bar) => bar.height)).toEqual([0, 4, 104])
  })
})

describe('schemat danych', () => {
  it('odrzuca zduplikowane miesiące, kody budżetów i zamówienia PO', async () => {
    const { budgetDataSchema } = await import('../schemas')
    const raw = (await import('../mocks/budgets.json')).default
    const first = raw.budgets[0]!

    const duplicatedMonth = structuredClone(raw)
    duplicatedMonth.budgets[0]!.monthlySpending.push({ month: 1, amount: 1 })
    expect(budgetDataSchema.safeParse(duplicatedMonth).success).toBe(false)

    const duplicatedBudget = structuredClone(raw)
    duplicatedBudget.budgets.push(structuredClone(first))
    expect(budgetDataSchema.safeParse(duplicatedBudget).success).toBe(false)

    const duplicatedPo = structuredClone(raw)
    duplicatedPo.budgets[0]!.purchaseOrders.push(structuredClone(first.purchaseOrders[0]!))
    expect(budgetDataSchema.safeParse(duplicatedPo).success).toBe(false)

    expect(budgetDataSchema.safeParse(raw).success).toBe(true)
  })
})
