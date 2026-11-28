import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

import { useDocumentList } from '../composables/useDocumentList'
import { createEmptyFilterCriteria } from '../constants'
import type { DocumentListItem, DocumentStatus } from '../types'
import { makeDocument, makeDocuments } from './fixtures'

describe('useDocumentList', () => {
  it('domyślnie sortuje od najnowszych i pokazuje pierwszą stronę', () => {
    const documents = makeDocuments(12)
    const list = useDocumentList([...documents].reverse())

    expect(list.total.value).toBe(12)
    expect(list.pageCount.value).toBe(3)
    expect(list.pageItems.value).toEqual(documents.slice(0, 5))
    expect(list.rangeStart.value).toBe(1)
    expect(list.rangeEnd.value).toBe(5)
    expect(list.canPrev.value).toBe(false)
    expect(list.canNext.value).toBe(true)
  })

  it('nawigacja po stronach jest ograniczona do zakresu', () => {
    const list = useDocumentList(makeDocuments(12))

    list.nextPage()
    list.nextPage()
    list.nextPage()
    expect(list.page.value).toBe(3)
    expect(list.rangeStart.value).toBe(11)
    expect(list.rangeEnd.value).toBe(12)
    expect(list.canNext.value).toBe(false)

    list.goToPage(-4)
    expect(list.page.value).toBe(1)
    list.prevPage()
    expect(list.page.value).toBe(1)
  })

  it('goToPage obcina ułamki i ignoruje NaN oraz nieskończoność', () => {
    const list = useDocumentList(makeDocuments(12))

    list.goToPage(2.7)
    expect(list.page.value).toBe(2)
    list.goToPage(Number.NaN)
    expect(list.page.value).toBe(2)
    list.goToPage(Number.POSITIVE_INFINITY)
    expect(list.page.value).toBe(2)
    list.goToPage(Number.NEGATIVE_INFINITY)
    expect(list.page.value).toBe(2)
  })

  it('zmiana filtrów lub sortowania wraca na pierwszą stronę', async () => {
    const list = useDocumentList(makeDocuments(12))

    list.goToPage(3)
    list.toggleSortDirection()
    await nextTick()
    expect(list.sortDirection.value).toBe('asc')
    expect(list.page.value).toBe(1)

    list.goToPage(2)
    list.query.value = 'testowy'
    await nextTick()
    expect(list.page.value).toBe(1)
  })

  it('applyFilters stosuje kopię kryteriów i wraca na pierwszą stronę', async () => {
    const list = useDocumentList([
      ...makeDocuments(11),
      makeDocument({ status: 'rejected', type: 'invoice', subtype: 'vat' }),
    ])
    list.goToPage(2)

    const statuses: DocumentStatus[] = ['rejected']
    const criteria = { ...createEmptyFilterCriteria(), statuses }
    list.applyFilters(criteria)
    await nextTick()

    expect(list.page.value).toBe(1)
    expect(list.total.value).toBe(1)
    expect(list.filters.value).not.toBe(criteria)
    expect(list.filters.value.statuses).not.toBe(criteria.statuses)
    statuses.push('draft')
    expect(list.filters.value.statuses).toEqual(['rejected'])
  })

  it('applyFilters ignoruje niepoprawne kryteria i ostrzega w DEV', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const list = useDocumentList(makeDocuments(3))
    list.applyFilters({ ...createEmptyFilterCriteria(), statuses: ['draft'] })

    list.applyFilters({ ...createEmptyFilterCriteria(), valueMin: 10, valueMax: 1 })
    list.applyFilters({ ...createEmptyFilterCriteria(), subtype: 'vat' })
    list.applyFilters({ ...createEmptyFilterCriteria(), valueMin: Number.POSITIVE_INFINITY })

    expect(list.filters.value.statuses).toEqual(['draft'])
    expect(warn).toHaveBeenCalledTimes(3)
    warn.mockRestore()
  })

  it('buduje chipy aktywnych filtrów i pozwala je usuwać', () => {
    const list = useDocumentList([
      makeDocument({ status: 'in-approval', type: 'invoice', subtype: 'vat' }),
      makeDocument({ status: 'approved', type: 'contract' }),
    ])

    list.applyFilters({
      ...createEmptyFilterCriteria(),
      statuses: ['in-approval'],
      type: 'invoice',
      subtype: 'vat',
    })
    expect(list.activeFilters.value.map((filter) => filter.label)).toEqual([
      'Status: W akceptacji',
      'Rodzaj: Faktura',
      'Podtyp: VAT',
    ])
    expect(list.activeFilterCount.value).toBe(3)
    expect(list.hasActiveFilters.value).toBe(true)
    expect(list.total.value).toBe(1)

    list.removeFilter(list.activeFilters.value[0]!)
    expect(list.filters.value.statuses).toEqual([])
    expect(list.activeFilterCount.value).toBe(2)

    // Usunięcie rodzaju zdejmuje też podtyp.
    list.removeFilter(list.activeFilters.value.find((filter) => filter.kind === 'type')!)
    expect(list.activeFilterCount.value).toBe(0)
    expect(list.hasActiveFilters.value).toBe(false)
    expect(list.total.value).toBe(2)
  })

  it('clearFilters czyści także frazę wyszukiwania', () => {
    const list = useDocumentList([makeDocument({ title: 'Umowa najmu' })])

    list.query.value = 'nie ma takiego'
    list.applyFilters({ ...createEmptyFilterCriteria(), statuses: ['rejected'] })
    expect(list.isEmpty.value).toBe(true)
    expect(list.rangeStart.value).toBe(0)
    expect(list.rangeEnd.value).toBe(0)

    list.clearFilters()
    expect(list.query.value).toBe('')
    expect(list.filters.value).toEqual(createEmptyFilterCriteria())
    expect(list.isEmpty.value).toBe(false)
  })

  it('sama fraza wyszukiwania liczy się jako aktywne kryterium', () => {
    const list = useDocumentList([makeDocument()])

    list.query.value = '   '
    expect(list.hasActiveFilters.value).toBe(false)
    list.query.value = 'abc'
    expect(list.hasActiveFilters.value).toBe(true)
    expect(list.activeFilters.value).toEqual([])
  })

  it('przycina numer strony, gdy dane źródłowe się skurczą', async () => {
    const source = ref<DocumentListItem[]>(makeDocuments(12))
    const list = useDocumentList(source)

    list.goToPage(3)
    source.value = makeDocuments(6)
    await nextTick()
    expect(list.page.value).toBe(2)
  })
})
