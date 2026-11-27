import { currencySchema, documentStatusSchema, documentTypeSchema } from './schemas'
import type {
  Currency,
  DocumentFilterCriteria,
  DocumentStatus,
  DocumentSubtype,
  DocumentType,
  FilterOption,
} from './types'

export { CONTRACTOR_QUERY_MAX_LENGTH, DOCUMENT_SUBTYPES_BY_TYPE } from './schemas'

export const DOCUMENTS_PAGE_SIZE = 5

export const DOCUMENT_STATUSES: readonly DocumentStatus[] = documentStatusSchema.options

export const DOCUMENT_TYPES: readonly DocumentType[] = documentTypeSchema.options

export const CURRENCIES: readonly Currency[] = currencySchema.options

export const DEFAULT_CURRENCY: Currency = 'PLN'

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Wersja robocza',
  'in-approval': 'W akceptacji',
  approved: 'Zaakceptowany',
  rejected: 'Odrzucony',
  completed: 'Zrealizowany',
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  contract: 'Umowa',
  invoice: 'Faktura',
  regulation: 'Regulamin',
  annex: 'Aneks',
  protocol: 'Protokół',
}

export const DOCUMENT_SUBTYPE_LABELS: Record<DocumentSubtype, string> = {
  'service-agreement': 'O świadczenie usług',
  lease: 'Najmu',
  'specific-work': 'O dzieło',
  nda: 'O zachowaniu poufności',
  vat: 'VAT',
  correction: 'Korygująca',
  proforma: 'Proforma',
  'work-rules': 'Regulamin pracy',
  remuneration: 'Wynagradzania',
  'social-fund': 'ZFŚS',
  'price-change': 'Zmiana ceny',
  'term-extension': 'Przedłużenie terminu',
  'scope-change': 'Zmiana zakresu',
  acceptance: 'Odbioru',
  handover: 'Przekazania',
  meeting: 'Ze spotkania',
}

export const DOCUMENT_TYPE_OPTIONS: readonly FilterOption<DocumentType>[] = DOCUMENT_TYPES.map(
  (type) => ({ value: type, label: DOCUMENT_TYPE_LABELS[type] }),
)

export const CURRENCY_OPTIONS: readonly FilterOption<Currency>[] = CURRENCIES.map((currency) => ({
  value: currency,
  label: currency,
}))

/** Pełne, statyczne nazwy klas – Tailwind musi je znaleźć w kodzie źródłowym. */
export const DOCUMENT_STATUS_BADGE_CLASSES: Record<DocumentStatus, string> = {
  draft: 'bg-eod-status-draft text-eod-status-draft-foreground',
  'in-approval': 'bg-eod-status-in-approval text-eod-status-in-approval-foreground',
  approved: 'bg-eod-status-approved text-eod-status-approved-foreground',
  rejected: 'bg-eod-status-rejected text-eod-status-rejected-foreground',
  completed: 'bg-eod-status-completed text-eod-status-completed-foreground',
}

/** Puste kryteria panelu filtrów – za każdym razem nowy obiekt i nowa tablica statusów. */
export function createEmptyFilterCriteria(): DocumentFilterCriteria {
  return {
    statuses: [],
    type: null,
    subtype: null,
    registeredFrom: null,
    registeredTo: null,
    recipient: null,
    contractorQuery: '',
    currency: DEFAULT_CURRENCY,
    valueMin: null,
    valueMax: null,
  }
}

/** Kopia kryteriów (także tablicy statusów) – zmiany kopii nie wpływają na oryginał. */
export function copyFilterCriteria(criteria: DocumentFilterCriteria): DocumentFilterCriteria {
  return { ...criteria, statuses: [...criteria.statuses] }
}
