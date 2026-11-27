import type { z } from 'zod'

import type { documentListItemSchema, documentStatusSchema, documentTypeSchema } from './schemas'

export type DocumentStatus = z.infer<typeof documentStatusSchema>
export type DocumentType = z.infer<typeof documentTypeSchema>
export type DocumentListItem = z.infer<typeof documentListItemSchema>

export type SortDirection = 'asc' | 'desc'

export interface DocumentFilters {
  query: string
  statuses: readonly DocumentStatus[]
  types: readonly DocumentType[]
}

export type ActiveFilterChip =
  | { kind: 'status'; value: DocumentStatus; label: string }
  | { kind: 'type'; value: DocumentType; label: string }

/** Numer strony albo wielokropek w miejscu pominiętych stron. */
export type PaginationItem = number | 'ellipsis'
