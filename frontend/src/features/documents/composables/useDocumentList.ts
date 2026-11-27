import { computed, type MaybeRefOrGetter, ref, toValue, watch } from 'vue'

import { copyFilterCriteria, createEmptyFilterCriteria, DOCUMENTS_PAGE_SIZE } from '../constants'
import { documentFilterCriteriaSchema } from '../schemas'
import type {
  ActiveFilterChip,
  DocumentFilterCriteria,
  DocumentListItem,
  SortDirection,
} from '../types'
import {
  buildActiveFilterChips,
  filterDocuments,
  getPageCount,
  getPaginationItems,
  paginate,
  removeChipFromCriteria,
  sortDocuments,
} from '../utils/documentList'

/** Stan listy dokumentów po stronie klienta: wyszukiwanie, filtry, sortowanie i paginacja. */
export function useDocumentList(
  source: MaybeRefOrGetter<readonly DocumentListItem[]>,
  pageSize = DOCUMENTS_PAGE_SIZE,
) {
  const query = ref('')
  /** Zastosowane kryteria panelu filtrów – zawsze podmieniane w całości (nowy obiekt). */
  const filters = ref<DocumentFilterCriteria>(createEmptyFilterCriteria())
  const sortDirection = ref<SortDirection>('desc')
  const page = ref(1)

  const filtered = computed(() =>
    filterDocuments(toValue(source), { ...filters.value, query: query.value }),
  )
  const sorted = computed(() => sortDocuments(filtered.value, sortDirection.value))
  const total = computed(() => sorted.value.length)
  const pageCount = computed(() => getPageCount(total.value, pageSize))
  const pageItems = computed(() => paginate(sorted.value, page.value, pageSize))
  const rangeStart = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize + 1))
  const rangeEnd = computed(() =>
    total.value === 0 ? 0 : Math.min(page.value * pageSize, total.value),
  )
  const paginationItems = computed(() => getPaginationItems(page.value, pageCount.value))

  const activeFilters = computed<ActiveFilterChip[]>(() => buildActiveFilterChips(filters.value))
  const activeFilterCount = computed(() => activeFilters.value.length)
  const hasActiveFilters = computed(
    () => activeFilters.value.length > 0 || query.value.trim() !== '',
  )
  const isEmpty = computed(() => total.value === 0)
  const canPrev = computed(() => page.value > 1)
  const canNext = computed(() => page.value < pageCount.value)

  /**
   * Stosuje kryteria z panelu filtrów (kopia – późniejsze zmiany szkicu nie wpływają na listę).
   * Niepoprawne kryteria są ignorowane – panel blokuje je wcześniej, to tylko zabezpieczenie.
   */
  function applyFilters(criteria: DocumentFilterCriteria) {
    const result = documentFilterCriteriaSchema.safeParse(criteria)
    if (!result.success) {
      if (import.meta.env.DEV) {
        console.warn('useDocumentList: pominięto niepoprawne kryteria filtrów', result.error.issues)
      }
      return
    }
    filters.value = copyFilterCriteria(result.data)
  }

  function removeFilter(filter: ActiveFilterChip) {
    filters.value = removeChipFromCriteria(filters.value, filter)
  }

  function clearFilters() {
    filters.value = createEmptyFilterCriteria()
    query.value = ''
  }

  function setSortDirection(direction: SortDirection) {
    sortDirection.value = direction
  }

  function toggleSortDirection() {
    sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
  }

  /** Przechodzi na stronę (ułamki obcina, wartości spoza zakresu przycina, NaN/∞ ignoruje). */
  function goToPage(target: number) {
    if (!Number.isFinite(target)) return
    page.value = Math.min(Math.max(1, Math.trunc(target)), pageCount.value)
  }

  function nextPage() {
    goToPage(page.value + 1)
  }

  function prevPage() {
    goToPage(page.value - 1)
  }

  // Zmiana kryteriów wraca na pierwszą stronę; zmiana danych źródłowych tylko przycina numer.
  watch([query, filters, sortDirection], () => {
    page.value = 1
  })
  watch(pageCount, (count) => {
    if (page.value > count) page.value = count
  })

  return {
    query,
    filters,
    sortDirection,
    page,
    filtered,
    sorted,
    total,
    pageCount,
    pageItems,
    rangeStart,
    rangeEnd,
    paginationItems,
    activeFilters,
    activeFilterCount,
    hasActiveFilters,
    isEmpty,
    canPrev,
    canNext,
    applyFilters,
    removeFilter,
    clearFilters,
    setSortDirection,
    toggleSortDirection,
    goToPage,
    nextPage,
    prevPage,
  }
}
