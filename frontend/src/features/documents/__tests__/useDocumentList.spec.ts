import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import { useDocumentList } from '../composables/useDocumentList'
import type { DocumentListItem } from '../types'
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

  it('buduje chipy aktywnych filtrów i pozwala je usuwać', () => {
    const list = useDocumentList([
      makeDocument({ status: 'in-approval', type: 'invoice' }),
      makeDocument({ status: 'approved', type: 'contract' }),
    ])

    list.setStatusChecked('in-approval', true)
    list.toggleType('invoice')
    expect(list.activeFilters.value.map((filter) => filter.label)).toEqual([
      'Status: W akceptacji',
      'Rodzaj: Faktura',
    ])
    expect(list.hasActiveFilters.value).toBe(true)
    expect(list.total.value).toBe(1)

    list.removeFilter(list.activeFilters.value[0]!)
    expect(list.statuses.value).toEqual([])
    expect(list.activeFilters.value).toHaveLength(1)

    list.toggleType('invoice')
    expect(list.hasActiveFilters.value).toBe(false)
  })

  it('clearFilters czyści także frazę wyszukiwania', () => {
    const list = useDocumentList([makeDocument({ title: 'Umowa najmu' })])

    list.query.value = 'nie ma takiego'
    list.setStatusChecked('rejected', true)
    expect(list.isEmpty.value).toBe(true)
    expect(list.rangeStart.value).toBe(0)
    expect(list.rangeEnd.value).toBe(0)

    list.clearFilters()
    expect(list.query.value).toBe('')
    expect(list.statuses.value).toEqual([])
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
