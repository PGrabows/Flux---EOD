import { parseISO } from 'date-fns'

import type { DocumentFilters, DocumentListItem, PaginationItem, SortDirection } from '../types'

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
 * Filtruje dokumenty: fraza w tytule lub numerze, statusy i typy w obrębie grupy łączone
 * przez OR, a grupy między sobą przez AND. Pusta grupa nie zawęża wyników.
 */
export function filterDocuments(
  documents: readonly DocumentListItem[],
  filters: DocumentFilters,
): DocumentListItem[] {
  const query = normalizeForSearch(filters.query)

  return documents.filter((document) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(document.status)) return false
    if (filters.types.length > 0 && !filters.types.includes(document.type)) return false
    if (!query) return true
    return (
      normalizeForSearch(document.title).includes(query) ||
      normalizeForSearch(document.number).includes(query)
    )
  })
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
