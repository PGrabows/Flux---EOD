import type { z } from 'zod'

import type {
  budgetAccessEntrySchema,
  budgetAccessRoleSchema,
  budgetListScopeSchema,
  budgetViewerRoleSchema,
  budgetDetailsSchema,
  budgetDocumentSchema,
  budgetDocumentStatusSchema,
  budgetSummarySchema,
  monthlySpendingSchema,
  purchaseOrderSchema,
} from './schemas'

export type BudgetSummary = z.infer<typeof budgetSummarySchema>
export type BudgetDetails = z.infer<typeof budgetDetailsSchema>
export type BudgetDocument = z.infer<typeof budgetDocumentSchema>
export type BudgetDocumentStatus = z.infer<typeof budgetDocumentStatusSchema>
export type BudgetAccessEntry = z.infer<typeof budgetAccessEntrySchema>
export type BudgetAccessRole = z.infer<typeof budgetAccessRoleSchema>
export type BudgetViewerRole = z.infer<typeof budgetViewerRoleSchema>
export type BudgetListScope = z.infer<typeof budgetListScopeSchema>

/** Odpowiedź listy budżetów: zakres widoczności i podsumowania wierszy. */
export interface BudgetListResponse {
  scope: BudgetListScope
  budgets: BudgetSummary[]
}
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>
export type MonthlySpending = z.infer<typeof monthlySpendingSchema>

/** Status wykorzystania budżetu – wyprowadzany z kwot, nie przechowywany. */
export type BudgetUsageStatus = 'ok' | 'warning' | 'exceeded'

/** Ton plakietki statusu (kolory z tokenów `eod-status-*`). */
export type BudgetBadgeTone = 'success' | 'warning' | 'danger'

/** Wiersz listy z wyliczonymi wartościami. */
export interface BudgetListRow extends BudgetSummary {
  remaining: number
  /** Wykorzystanie w procentach (wydane + zaangażowane) / limit, zaokrąglone. */
  usagePercent: number
  status: BudgetUsageStatus
}

export interface BudgetTotals {
  count: number
  limit: number
  spent: number
  committed: number
  remaining: number
  spentPercent: number
  remainingPercent: number
}
