import { parseISO } from 'date-fns'

import {
  copyFilterCriteria,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUSES,
  DOCUMENT_SUBTYPE_LABELS,
  DOCUMENT_SUBTYPES_BY_TYPE,
  DOCUMENT_TYPE_LABELS,
} from '../constants'
import type {
  ActiveFilterChip,
  DocumentFilterCriteria,
  DocumentFilters,
  DocumentListItem,
  DocumentStatus,
  DocumentSubtype,
  DocumentType,
  FilterOption,
  PaginationItem,
  SortDirection,
} from '../types'
import { formatAmountRange, formatFilterDateRange } from './format'

const SEARCH_LOCALE = 'pl-PL'

/** Po ilu stronach przestajemy pokazywać wszystkie numery i wstawiamy wielokropek. */
const MAX_PLAIN_PAGES = 7

/** Myślniki i łączniki Unicode U+2010–U+2015 (m.in. półpauza i pauza). */
const DASHES = /[\u2010-\u2015]/g
const DIACRITICS = /\p{Diacritic}/gu

/**
 * Normalizuje tekst do wyszukiwania: bez znaków diakrytycznych (także „ł”), z ujednoliconymi
 * myślnikami, małymi literami i bez skrajnych spacji – „Usług – Nexora” → „uslug - nexora”.
 */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .replace(DASHES, '-')
    .toLocaleLowerCase(SEARCH_LOCALE)
    .trim()
}

/**
 * NIP bez spacji, myślników (także półpauzy) i prefiksu VAT-UE „PL” –
 * „123-456-78-90” → „1234567890”, „PL 113 245 67 98” → „1132456798”.
 */
export function normalizeNip(value: string): string {
  return value.replace(/[\s\-\u2010-\u2015]/g, '').replace(/^pl/i, '')
}

/**
 * Kontrahent pasuje do frazy po nazwie (bez diakrytyków i wielkości liter) albo po NIP
 * (fraza bez separatorów zawarta w NIP). Pusta fraza nie zawęża; brak kontrahenta nie pasuje.
 */
export function matchesContractor(
  contractor: DocumentListItem['contractor'],
  rawQuery: string,
): boolean {
  const query = normalizeForSearch(rawQuery)
  if (!query) return true
  if (!contractor) return false
  if (normalizeForSearch(contractor.name).includes(query)) return true
  const digits = normalizeNip(query)
  return /^\d+$/.test(digits) && contractor.nip.includes(digits)
}

/**
 * Wartość mieści się w zakresie (granice włącznie) w wybranej walucie. Bez granic – zawsze
 * pasuje; dokument bez wartości lub w innej walucie – nie pasuje, gdy ustawiono granicę.
 */
export function matchesValue(
  value: DocumentListItem['value'],
  criteria: Pick<DocumentFilterCriteria, 'currency' | 'valueMin' | 'valueMax'>,
): boolean {
  const { currency, valueMin, valueMax } = criteria
  if (valueMin === null && valueMax === null) return true
  if (!value || value.currency !== currency) return false
  if (valueMin !== null && value.amount < valueMin) return false
  if (valueMax !== null && value.amount > valueMax) return false
  return true
}

/**
 * Filtruje dokumenty: fraza w tytule lub numerze, statusy w obrębie grupy łączone przez OR,
 * a pozostałe kryteria między sobą przez AND. Puste kryterium nie zawęża wyników.
 */
export function filterDocuments(
  documents: readonly DocumentListItem[],
  filters: DocumentFilters,
): DocumentListItem[] {
  const query = normalizeForSearch(filters.query)
  const { statuses, type, subtype, registeredFrom, registeredTo, recipient } = filters

  return documents.filter((document) => {
    if (statuses.length > 0 && !statuses.includes(document.status)) return false
    if (type !== null && document.type !== type) return false
    if (subtype !== null && document.subtype !== subtype) return false
    // Daty YYYY-MM-DD – porównanie tekstowe jest chronologiczne.
    if (registeredFrom !== null && document.registeredAt < registeredFrom) return false
    if (registeredTo !== null && document.registeredAt > registeredTo) return false
    if (recipient !== null && document.recipient.name !== recipient) return false
    if (!matchesContractor(document.contractor, filters.contractorQuery)) return false
    if (!matchesValue(document.value, filters)) return false
    if (!query) return true
    return (
      normalizeForSearch(document.title).includes(query) ||
      normalizeForSearch(document.number).includes(query)
    )
  })
}

/** Liczba dokumentów w każdym statusie (zero dla statusów bez dokumentów). */
export function countByStatus(
  documents: readonly DocumentListItem[],
): Record<DocumentStatus, number> {
  const counts = Object.fromEntries(DOCUMENT_STATUSES.map((status) => [status, 0])) as Record<
    DocumentStatus,
    number
  >
  for (const document of documents) counts[document.status] += 1
  return counts
}

/** Unikalni odbiorcy w firmie, posortowani alfabetycznie po polsku. */
export function getRecipientOptions(documents: readonly DocumentListItem[]): FilterOption[] {
  const names = [...new Set(documents.map((document) => document.recipient.name))]
  return names
    .sort((a, b) => a.localeCompare(b, SEARCH_LOCALE))
    .map((name) => ({ value: name, label: name }))
}

/** Podtypy dostępne dla rodzaju (pusta lista, gdy rodzaju nie wybrano). */
export function getSubtypeOptions(type: DocumentType | null): FilterOption<DocumentSubtype>[] {
  if (type === null) return []
  return DOCUMENT_SUBTYPES_BY_TYPE[type].map((value) => ({
    value,
    label: DOCUMENT_SUBTYPE_LABELS[value],
  }))
}

/** Chipy zastosowanych filtrów w stałej kolejności (statusy wg kolejności w panelu). */
export function buildActiveFilterChips(criteria: DocumentFilterCriteria): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = DOCUMENT_STATUSES.filter((status) =>
    criteria.statuses.includes(status),
  ).map((status) => ({
    id: `status:${status}`,
    kind: 'status',
    value: status,
    label: `Status: ${DOCUMENT_STATUS_LABELS[status]}`,
  }))

  if (criteria.type !== null) {
    chips.push({
      id: 'type',
      kind: 'type',
      label: `Rodzaj: ${DOCUMENT_TYPE_LABELS[criteria.type]}`,
    })
  }
  if (criteria.subtype !== null) {
    chips.push({
      id: 'subtype',
      kind: 'subtype',
      label: `Podtyp: ${DOCUMENT_SUBTYPE_LABELS[criteria.subtype]}`,
    })
  }
  const dateRange = formatFilterDateRange(criteria.registeredFrom, criteria.registeredTo)
  if (dateRange) {
    chips.push({ id: 'registeredAt', kind: 'registeredAt', label: `Data: ${dateRange}` })
  }
  if (criteria.recipient !== null) {
    chips.push({ id: 'recipient', kind: 'recipient', label: `Odbiorca: ${criteria.recipient}` })
  }
  const contractor = criteria.contractorQuery.trim()
  if (contractor) {
    chips.push({ id: 'contractor', kind: 'contractor', label: `Kontrahent: ${contractor}` })
  }
  const valueRange = formatAmountRange(criteria.valueMin, criteria.valueMax, criteria.currency)
  if (valueRange) {
    chips.push({ id: 'value', kind: 'value', label: `Wartość: ${valueRange}` })
  }
  return chips
}

/** Zwraca nowe kryteria bez filtra z chipa (wejście pozostaje niezmienione). */
export function removeChipFromCriteria(
  criteria: DocumentFilterCriteria,
  chip: ActiveFilterChip,
): DocumentFilterCriteria {
  const next = copyFilterCriteria(criteria)
  switch (chip.kind) {
    case 'status':
      next.statuses = criteria.statuses.filter((status) => status !== chip.value)
      break
    case 'type':
      // Podtyp bez rodzaju nie ma sensu.
      next.type = null
      next.subtype = null
      break
    case 'subtype':
      next.subtype = null
      break
    case 'registeredAt':
      next.registeredFrom = null
      next.registeredTo = null
      break
    case 'recipient':
      next.recipient = null
      break
    case 'contractor':
      next.contractorQuery = ''
      break
    case 'value':
      next.valueMin = null
      next.valueMax = null
      break
  }
  return next
}

/** Sortuje kopię listy po dacie modyfikacji (stabilnie – Array.prototype.sort jest stabilne). */
export function sortDocuments(
  documents: readonly DocumentListItem[],
  direction: SortDirection,
): DocumentListItem[] {
  const factor = direction === 'asc' ? 1 : -1
  // Porównanie po znaczniku czasu – poprawne także dla wartości z różnymi strefami.
  const timestamps = new Map(documents.map((d) => [d, parseISO(d.modifiedAt).getTime()]))
  return [...documents].sort((a, b) => factor * (timestamps.get(a)! - timestamps.get(b)!))
}

export function getPageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize))
}

/** Zwraca elementy strony `page` (numerowanej od 1). */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

/**
 * Numery stron do wyświetlenia: przy maks. 7 stronach wszystkie, w przeciwnym razie
 * pierwsza, ostatnia i sąsiedzi bieżącej (na pierwszej/ostatniej stronie – dwie
 * kolejne/poprzednie), a w lukach `'ellipsis'`. Luka o jedną stronę jest wypełniana jej
 * numerem – wielokropek w miejscu jednego przycisku nic nie oszczędza.
 */
export function getPaginationItems(current: number, pageCount: number): PaginationItem[] {
  if (pageCount <= MAX_PLAIN_PAGES) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, pageCount, current - 1, current, current + 1])
  if (current === 1) pages.add(3)
  if (current === pageCount) pages.add(pageCount - 2)

  const sorted = [...pages].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b)

  const items: PaginationItem[] = []
  let previous = 0
  for (const page of sorted) {
    if (page - previous === 2) items.push(previous + 1)
    else if (page - previous > 2) items.push('ellipsis')
    items.push(page)
    previous = page
  }
  return items
}
