import type { DocumentListItem } from '../types'

let sequence = 0

/** Fikcyjny dokument do testów – pola można nadpisać. */
export function makeDocument(overrides: Partial<DocumentListItem> = {}): DocumentListItem {
  sequence += 1
  const id = String(sequence).padStart(5, '0')
  return {
    id: `doc-${id}`,
    title: `Dokument testowy ${id}`,
    number: `DOC-2026-${id}`,
    type: 'contract',
    author: { name: 'Jan Testowy', department: 'Dział testów' },
    modifiedAt: '2026-10-01T10:00:00',
    status: 'draft',
    ...overrides,
  }
}

/** `count` dokumentów z malejącymi datami (pierwszy najnowszy). */
export function makeDocuments(count: number): DocumentListItem[] {
  return Array.from({ length: count }, (_, index) =>
    makeDocument({
      modifiedAt: new Date(Date.UTC(2026, 9, 28 - index, 12, 0, 0)).toISOString().slice(0, 19),
    }),
  )
}
