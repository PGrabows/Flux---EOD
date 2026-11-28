import { normalizeForSearch } from '@/lib/search'

import type {
  BudgetBadgeTone,
  BudgetDetails,
  BudgetListRow,
  BudgetSummary,
  BudgetTotals,
  BudgetUsageStatus,
  MonthlySpending,
} from '../types'

/** Od tego (zaokrąglonego) procentu wykorzystania budżet jest „Powyżej 80%”. */
export const BUDGET_WARNING_PERCENT = 80
/** Powyżej tego procentu budżet jest „Przekroczony”. */
export const BUDGET_LIMIT_PERCENT = 100

/** Pozostało do dyspozycji = limit − wydane − zaangażowane (może być ujemne). */
export function getBudgetRemaining(budget: Pick<BudgetSummary, 'limit' | 'spent' | 'committed'>) {
  return roundAmount(budget.limit - budget.spent - budget.committed)
}

function getUsageRatio(budget: Pick<BudgetSummary, 'limit' | 'spent' | 'committed'>): number {
  return budget.limit > 0 ? (budget.spent + budget.committed) / budget.limit : 0
}

/**
 * Wykorzystanie w procentach, zaokrąglone do liczby całkowitej (może przekraczać 100).
 * Przekroczenie limitu nigdy nie jest pokazywane jako „100%” – np. 100,4% → 101%, żeby
 * procent, status „Przekroczony” i ujemne „pozostało” były ze sobą zgodne.
 */
export function getBudgetUsagePercent(
  budget: Pick<BudgetSummary, 'limit' | 'spent' | 'committed'>,
): number {
  const ratio = getUsageRatio(budget)
  const percent = Math.round(ratio * 100)
  return ratio > 1 ? Math.max(percent, BUDGET_LIMIT_PERCENT + 1) : percent
}

/** Status liczony z wyświetlanego (zaokrąglonego) procentu – np. 79,96% → 80% → „Powyżej 80%”. */
export function getBudgetUsageStatus(
  budget: Pick<BudgetSummary, 'limit' | 'spent' | 'committed'>,
): BudgetUsageStatus {
  const percent = getBudgetUsagePercent(budget)
  if (percent > BUDGET_LIMIT_PERCENT) return 'exceeded'
  if (percent >= BUDGET_WARNING_PERCENT) return 'warning'
  return 'ok'
}

export function toBudgetListRow(budget: BudgetSummary): BudgetListRow {
  return {
    ...budget,
    remaining: getBudgetRemaining(budget),
    usagePercent: getBudgetUsagePercent(budget),
    status: getBudgetUsageStatus(budget),
  }
}

function percentOf(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

/** Sumy do kart KPI. Pozostało sumuje także ujemne pozostałości przekroczonych budżetów. */
export function getBudgetTotals(budgets: readonly BudgetSummary[]): BudgetTotals {
  const limit = roundAmount(budgets.reduce((sum, budget) => sum + budget.limit, 0))
  const spent = roundAmount(budgets.reduce((sum, budget) => sum + budget.spent, 0))
  const committed = roundAmount(budgets.reduce((sum, budget) => sum + budget.committed, 0))
  const remaining = roundAmount(limit - spent - committed)
  return {
    count: budgets.length,
    limit,
    spent,
    committed,
    remaining,
    spentPercent: percentOf(spent, limit),
    remainingPercent: percentOf(remaining, limit),
  }
}

/** Wyszukiwanie po nazwie lub kodzie – bez wielkości liter i polskich znaków diakrytycznych. */
export function filterBudgets<T extends Pick<BudgetSummary, 'name' | 'code'>>(
  budgets: readonly T[],
  query: string,
): T[] {
  const needle = normalizeForSearch(query)
  if (!needle) return [...budgets]
  return budgets.filter(
    (budget) =>
      normalizeForSearch(budget.name).includes(needle) ||
      normalizeForSearch(budget.code).includes(needle),
  )
}

export interface UsageBarSegments {
  /** Szerokość segmentu „Wydane” w % szerokości paska (0–100). */
  spent: number
  /** Szerokość segmentu „Zaangażowane” w % (spent + committed ≤ 100). */
  committed: number
}

/** Segmenty paska wykorzystania – przy przekroczeniu limitu przycinane do 100%. */
export function getUsageBarSegments(
  budget: Pick<BudgetSummary, 'limit' | 'spent' | 'committed'>,
): UsageBarSegments {
  if (budget.limit <= 0) return { spent: 0, committed: 0 }
  const spent = Math.min((budget.spent / budget.limit) * 100, 100)
  const committed = Math.min((budget.committed / budget.limit) * 100, 100 - spent)
  return { spent, committed }
}

export interface MonthlyBar extends MonthlySpending {
  /** Wysokość słupka w px. */
  height: number
  isCurrent: boolean
}

/** Maksymalna wysokość słupka wykresu miesięcznego (Figma: 22,7 tys. → 104 px). */
export const MONTHLY_BAR_MAX_HEIGHT = 104
/** Minimalna wysokość niezerowego słupka, żeby mała kwota była widoczna. */
const MONTHLY_BAR_MIN_HEIGHT = 4

/**
 * Słupki (posortowane po miesiącu) proporcjonalne do największej kwoty. Bieżący miesiąc
 * wynika z daty stanu – tylko gdy stan dotyczy roku budżetu (np. zamknięty budżet z 2025
 * oglądany w 2026 nie ma bieżącego miesiąca).
 */
export function getMonthlyBars(
  details: Pick<BudgetDetails, 'monthlySpending' | 'asOf' | 'year'>,
  maxHeight = MONTHLY_BAR_MAX_HEIGHT,
): MonthlyBar[] {
  const max = Math.max(0, ...details.monthlySpending.map((item) => item.amount))
  const asOfYear = Number(details.asOf.slice(0, 4))
  const currentMonth = asOfYear === details.year ? Number(details.asOf.slice(5, 7)) : null
  return [...details.monthlySpending]
    .sort((a, b) => a.month - b.month)
    .map((item) => ({
      ...item,
      height:
        max > 0 && item.amount > 0
          ? Math.max(MONTHLY_BAR_MIN_HEIGHT, Math.round((item.amount / max) * maxHeight))
          : 0,
      isCurrent: item.month === currentMonth,
    }))
}

export const BUDGET_STATUS_LABELS: Record<BudgetUsageStatus, string> = {
  ok: 'W normie',
  warning: 'Powyżej 80%',
  exceeded: 'Przekroczony',
}

export const BUDGET_STATUS_TONES: Record<BudgetUsageStatus, BudgetBadgeTone> = {
  ok: 'success',
  warning: 'warning',
  exceeded: 'danger',
}

/** Pełne, statyczne nazwy klas – Tailwind musi je znaleźć w kodzie źródłowym. */
export const BUDGET_PROGRESS_FILL_CLASSES: Record<BudgetUsageStatus, string> = {
  ok: 'bg-eod-primary',
  warning: 'bg-eod-chart-warning',
  exceeded: 'bg-eod-chart-danger',
}

function roundAmount(value: number): number {
  return Math.round(value * 100) / 100
}
