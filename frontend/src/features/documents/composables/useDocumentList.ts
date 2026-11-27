import { computed, type MaybeRefOrGetter, ref, toValue, watch } from 'vue'

import { DOCUMENT_STATUS_LABELS, DOCUMENT_TYPE_LABELS, DOCUMENTS_PAGE_SIZE } from '../constants'
import type {
  ActiveFilterChip,
  DocumentListItem,
  DocumentStatus,
  DocumentType,
  SortDirection,
} from '../types'
import {
  filterDocuments,
  getPageCount,
  getPaginationItems,
  paginate,
  sortDocuments,
} from '../utils/documentList'

function withValue<T>(list: readonly T[], value: T, checked: boolean): T[] {
  const without = list.filter((item) => item !== value)
  return checked ? [...without, value] : without
}

/** Stan listy dokumentów po stronie klienta: wyszukiwanie, filtry, sortowanie i paginacja. */
export function useDocumentList(
  source: MaybeRefOrGetter<readonly DocumentListItem[]>,
  pageSize = DOCUMENTS_PAGE_SIZE,
) {
  const query = ref('')
  const statuses = ref<DocumentStatus[]>([])
  const types = ref<DocumentType[]>([])
  const sortDirection = ref<SortDirection>('desc')
  const page = ref(1)

  const filtered = computed(() =>
    filterDocuments(toValue(source), {
      query: query.value,
      statuses: statuses.value,
      types: types.value,
    }),
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

  const activeFilters = computed<ActiveFilterChip[]>(() => [
    ...statuses.value.map((value): ActiveFilterChip => ({
      kind: 'status',
      value,
      label: `Status: ${DOCUMENT_STATUS_LABELS[value]}`,
    })),
    ...types.value.map((value): ActiveFilterChip => ({
      kind: 'type',
      value,
      label: `Rodzaj: ${DOCUMENT_TYPE_LABELS[value]}`,
    })),
  ])
  const hasActiveFilters = computed(
    () => activeFilters.value.length > 0 || query.value.trim() !== '',
  )
  const isEmpty = computed(() => total.value === 0)
  const canPrev = computed(() => page.value > 1)
  const canNext = computed(() => page.value < pageCount.value)

  function setStatusChecked(status: DocumentStatus, checked: boolean) {
    statuses.value = withValue(statuses.value, status, checked)
  }

  function setTypeChecked(type: DocumentType, checked: boolean) {
    types.value = withValue(types.value, type, checked)
  }

  function toggleStatus(status: DocumentStatus) {
    setStatusChecked(status, !statuses.value.includes(status))
  }

  function toggleType(type: DocumentType) {
    setTypeChecked(type, !types.value.includes(type))
  }

  function removeFilter(filter: ActiveFilterChip) {
    if (filter.kind === 'status') setStatusChecked(filter.value, false)
    else setTypeChecked(filter.value, false)
  }

  function clearFilters() {
    statuses.value = []
    types.value = []
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
  watch([query, statuses, types, sortDirection], () => {
    page.value = 1
  })
  watch(pageCount, (count) => {
    if (page.value > count) page.value = count
  })

  return {
    query,
    statuses,
    types,
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
    hasActiveFilters,
    isEmpty,
    canPrev,
    canNext,
    setStatusChecked,
    setTypeChecked,
    toggleStatus,
    toggleType,
    removeFilter,
    clearFilters,
    setSortDirection,
    toggleSortDirection,
    goToPage,
    nextPage,
    prevPage,
  }
}
