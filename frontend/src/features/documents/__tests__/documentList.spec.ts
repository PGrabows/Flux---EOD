import { describe, expect, it } from 'vitest'

import {
  filterDocuments,
  getPageCount,
  getPaginationItems,
  normalizeForSearch,
  paginate,
  sortDocuments,
} from '../utils/documentList'
import { makeDocument } from './fixtures'

const umowa = makeDocument({
  title: 'Umowa o świadczenie usług – Nexora',
  number: 'DOC-2026-00184',
  type: 'contract',
  status: 'in-approval',
  modifiedAt: '2026-10-28T14:32:00',
})
const faktura = makeDocument({
  title: 'Faktura FV/10/2026/0457',
  number: 'DOC-2026-00183',
  type: 'invoice',
  status: 'in-approval',
  modifiedAt: '2026-10-27T09:15:00',
})
const aneks = makeDocument({
  title: 'Aneks nr 2 do umowy najmu',
  number: 'DOC-2026-00171',
  type: 'annex',
  status: 'rejected',
  modifiedAt: '2026-10-22T11:03:00',
})
const documents = [faktura, aneks, umowa]
const noFilters = { query: '', statuses: [], types: [] }

describe('filterDocuments', () => {
  it('bez kryteriów zwraca wszystkie dokumenty', () => {
    expect(filterDocuments(documents, noFilters)).toEqual(documents)
  })

  it('szuka w tytule bez rozróżniania wielkości liter (także polskich znaków)', () => {
    expect(filterDocuments(documents, { ...noFilters, query: '  ŚWIADCZENIE ' })).toEqual([umowa])
  })

  it.each([
    ['swiadczenie', [umowa]],
    ['usług - nexora', [umowa]],
    ['USLUG – NEXORA', [umowa]],
    ['fv/10', [faktura]],
  ])('fraza „%s” ignoruje diakrytyki, wielkość liter i rodzaj myślnika', (query, expected) => {
    expect(filterDocuments(documents, { ...noFilters, query })).toEqual(expected)
  })

  it('szuka w numerze dokumentu', () => {
    expect(filterDocuments(documents, { ...noFilters, query: 'doc-2026-00171' })).toEqual([aneks])
  })

  it('statusy w grupie łączy przez OR', () => {
    const result = filterDocuments(documents, {
      ...noFilters,
      statuses: ['rejected', 'in-approval'],
    })
    expect(result).toEqual(documents)
  })

  it('grupy statusów, typów i frazę łączy przez AND', () => {
    expect(
      filterDocuments(documents, { ...noFilters, statuses: ['in-approval'], types: ['invoice'] }),
    ).toEqual([faktura])
    expect(
      filterDocuments(documents, {
        query: 'umowa',
        statuses: ['in-approval'],
        types: ['invoice'],
      }),
    ).toEqual([])
  })
})

describe('normalizeForSearch', () => {
  it('usuwa diakrytyki (także ł/Ł), ujednolica myślniki, zmniejsza litery i przycina', () => {
    expect(normalizeForSearch('  Łódź – Zażółć\u2010gęślą\u2014JAŹŃ ')).toBe(
      'lodz - zazolc-gesla-jazn',
    )
  })
})

describe('sortDocuments', () => {
  it('sortuje malejąco i rosnąco po dacie modyfikacji, nie mutując wejścia', () => {
    const input = [...documents]
    expect(sortDocuments(input, 'desc')).toEqual([umowa, faktura, aneks])
    expect(sortDocuments(input, 'asc')).toEqual([aneks, faktura, umowa])
    expect(input).toEqual(documents)
  })

  it('porównuje znaczniki czasu, także dla wartości ze strefą', () => {
    // 10:00Z to później niż 11:00+02:00 (09:00Z), choć tekstowo jest „wcześniej”.
    const utc = makeDocument({ modifiedAt: '2026-10-01T10:00:00Z' })
    const offset = makeDocument({ modifiedAt: '2026-10-01T11:00:00+02:00' })
    expect(sortDocuments([offset, utc], 'desc')).toEqual([utc, offset])
    expect(sortDocuments([utc, offset], 'asc')).toEqual([offset, utc])
  })

  it('zachowuje kolejność dokumentów o tej samej dacie', () => {
    const first = makeDocument({ modifiedAt: '2026-10-01T10:00:00' })
    const second = makeDocument({ modifiedAt: '2026-10-01T10:00:00' })
    expect(sortDocuments([first, second], 'desc')).toEqual([first, second])
    expect(sortDocuments([first, second], 'asc')).toEqual([first, second])
  })
})

describe('paginate / getPageCount', () => {
  it('zwraca elementy wskazanej strony', () => {
    const items = [1, 2, 3, 4, 5, 6, 7]
    expect(paginate(items, 1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(paginate(items, 2, 5)).toEqual([6, 7])
  })

  it('liczy strony z minimum jedną', () => {
    expect(getPageCount(0, 5)).toBe(1)
    expect(getPageCount(5, 5)).toBe(1)
    expect(getPageCount(6, 5)).toBe(2)
    expect(getPageCount(126, 5)).toBe(26)
  })
})

describe('getPaginationItems', () => {
  it('przy maks. 7 stronach pokazuje wszystkie', () => {
    expect(getPaginationItems(1, 1)).toEqual([1])
    expect(getPaginationItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it.each([
    [1, 26, [1, 2, 3, 'ellipsis', 26]],
    [13, 26, [1, 'ellipsis', 12, 13, 14, 'ellipsis', 26]],
    [26, 26, [1, 'ellipsis', 24, 25, 26]],
    [4, 26, [1, 2, 3, 4, 5, 'ellipsis', 26]],
  ])('strona %i z %i', (current, count, expected) => {
    expect(getPaginationItems(current, count)).toEqual(expected)
  })
})
