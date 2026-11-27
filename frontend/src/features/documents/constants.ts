import { documentStatusSchema, documentTypeSchema } from './schemas'
import type { DocumentStatus, DocumentType } from './types'

export const DOCUMENTS_PAGE_SIZE = 5

export const DOCUMENT_STATUSES: readonly DocumentStatus[] = documentStatusSchema.options

export const DOCUMENT_TYPES: readonly DocumentType[] = documentTypeSchema.options

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  'in-approval': 'W akceptacji',
  draft: 'Wersja robocza',
  rejected: 'Odrzucony',
  approved: 'Zaakceptowany',
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  contract: 'Umowa',
  invoice: 'Faktura',
  regulation: 'Regulamin',
  annex: 'Aneks',
  protocol: 'Protokół',
}

/** Pełne, statyczne nazwy klas – Tailwind musi je znaleźć w kodzie źródłowym. */
export const DOCUMENT_STATUS_BADGE_CLASSES: Record<DocumentStatus, string> = {
  'in-approval': 'bg-eod-status-in-approval text-eod-status-in-approval-foreground',
  draft: 'bg-eod-status-draft text-eod-status-draft-foreground',
  rejected: 'bg-eod-status-rejected text-eod-status-rejected-foreground',
  approved: 'bg-eod-status-approved text-eod-status-approved-foreground',
}
