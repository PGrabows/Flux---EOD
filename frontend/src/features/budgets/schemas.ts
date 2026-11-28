import { z } from 'zod'

/** Górna granica kwot w danych budżetów – chroni przed absurdalnymi wartościami. */
const MAX_BUDGET_AMOUNT = 1e12

/** Czy wartości wybrane przez `key` są unikalne (np. kody budżetów, numery PO). */
function hasUniqueKeys<T>(items: readonly T[], key: (item: T) => string | number): boolean {
  return new Set(items.map(key)).size === items.length
}

const amountSchema = z.number().finite().min(0).max(MAX_BUDGET_AMOUNT)
const isoDateSchema = z.iso.date()

/** Kod budżetu, np. `FIN-2026-01` – używany też jako parametr trasy. */
export const budgetCodeSchema = z.string().regex(/^[A-Z]{2,10}-\d{4}-\d{2}$/)

/** Status dokumentu obciążającego budżet. */
export const budgetDocumentStatusSchema = z.enum(['in-approval', 'posted'])

export const budgetDocumentSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  /** Druga linia wiersza, np. numer faktury albo numer dokumentu w EOD. */
  reference: z.string().min(1).max(100),
  contractor: z.string().min(1).max(200),
  grossAmount: amountSchema,
  status: budgetDocumentStatusSchema,
})

/** Rola osoby z dostępem do szczegółów budżetu (etykiety składa UI). */
export const budgetAccessRoleSchema = z.enum(['owner', 'viewer'])

export const budgetAccessEntrySchema = z.object({
  name: z.string().min(1).max(100),
  role: budgetAccessRoleSchema,
})

export const purchaseOrderSchema = z.object({
  code: z.string().min(1).max(50),
  amount: amountSchema,
  remaining: amountSchema,
})

export const monthlySpendingSchema = z.object({
  month: z.number().int().min(1).max(12),
  amount: amountSchema,
})

export const budgetSummarySchema = z.object({
  code: budgetCodeSchema,
  name: z.string().min(1).max(200),
  year: z.number().int().min(2000).max(2100),
  limit: amountSchema.positive(),
  spent: amountSchema,
  committed: amountSchema,
})

export const budgetDetailsSchema = budgetSummarySchema.extend({
  department: z.string().min(1).max(100),
  costType: z.string().min(1).max(100),
  owner: z.string().min(1).max(100),
  periodStart: isoDateSchema,
  periodEnd: isoDateSchema,
  /** Data, na którą podano stan budżetu („Stan na …”). */
  asOf: isoDateSchema,
  access: z
    .array(budgetAccessEntrySchema)
    .max(50)
    .refine((items) => hasUniqueKeys(items, (item) => `${item.name}|${item.role}`), {
      message: 'Zduplikowany wpis dostępu',
    }),
  /** Zaksięgowane oraz zaangażowane kwoty w kolejnych miesiącach (do `asOf` włącznie). */
  monthlySpending: z
    .array(monthlySpendingSchema)
    .max(12)
    .refine((items) => hasUniqueKeys(items, (item) => item.month), {
      message: 'Zduplikowany miesiąc',
    }),
  documents: z
    .array(budgetDocumentSchema)
    .max(100)
    .refine((items) => hasUniqueKeys(items, (item) => item.id), {
      message: 'Zduplikowany dokument',
    }),
  purchaseOrders: z
    .array(purchaseOrderSchema)
    .max(50)
    .refine((items) => hasUniqueKeys(items, (item) => item.code), {
      message: 'Zduplikowane zamówienie PO',
    }),
})

/** Rola oglądającego listę – decyduje o treści komunikatów o zakresie widoczności. */
export const budgetViewerRoleSchema = z.enum(['manager', 'owner'])

/** Zakres listy: dział i rola, w jakiej użytkownik widzi budżety (z serwera, nie z UI). */
export const budgetListScopeSchema = z.object({
  department: z.string().min(1).max(100),
  viewerRole: budgetViewerRoleSchema,
})

export const budgetDataSchema = z.object({
  scope: budgetListScopeSchema,
  budgets: z
    .array(budgetDetailsSchema)
    .max(500)
    .refine((items) => hasUniqueKeys(items, (item) => item.code), {
      message: 'Zduplikowany kod budżetu',
    }),
})
