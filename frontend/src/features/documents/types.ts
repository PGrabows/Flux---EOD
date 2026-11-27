import type { z } from 'zod'

import type {
  currencySchema,
  documentFilterCriteriaSchema,
  documentListItemSchema,
  documentStatusSchema,
  documentSubtypeSchema,
  documentTypeSchema,
} from './schemas'

export type DocumentStatus = z.infer<typeof documentStatusSchema>
export type DocumentType = z.infer<typeof documentTypeSchema>
export type DocumentSubtype = z.infer<typeof documentSubtypeSchema>
export type Currency = z.infer<typeof currencySchema>
export type DocumentListItem = z.infer<typeof documentListItemSchema>

export type SortDirection = 'asc' | 'desc'

/** Kryteria z panelu filtrów. Puste wartości (`null`, `''`, `[]`) nie zawężają listy. */
export type DocumentFilterCriteria = z.infer<typeof documentFilterCriteriaSchema>

export interface DocumentFilters extends DocumentFilterCriteria {
  query: string
}

export type ActiveFilterChip =
  | { id: string; kind: 'status'; value: DocumentStatus; label: string }
  | {
      id: string
      kind: 'type' | 'subtype' | 'registeredAt' | 'recipient' | 'contractor' | 'value'
      label: string
    }

export interface FilterOption<T extends string = string> {
  value: T
  label: string
}

/** Numer strony albo wielokropek w miejscu pominiętych stron. */
export type PaginationItem = number | 'ellipsis'
