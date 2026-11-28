import { describe, expect, it } from 'vitest'

import { createEmptyFilterCriteria } from '../constants'
import type { DocumentFilterCriteria, DocumentFilters } from '../types'
import {
  buildActiveFilterChips,
  countByStatus,
  filterDocuments,
  getPageCount,
  getPaginationItems,
  getRecipientOptions,
  getSubtypeOptions,
  matchesContractor,
  matchesValue,
  normalizeNip,
  paginate,
  removeChipFromCriteria,
  sortDocuments,
} from '../utils/documentList'
import { makeDocument } from './fixtures'

const umowa = makeDocument({
  title: 'Umowa o świadczenie usług – Nexora',
  number: 'DOC-2026-00184',
  type: 'contract',
  subtype: 'service-agreement',
  status: 'in-approval',
  modifiedAt: '2026-10-28T14:32:00',
  registeredAt: '2026-10-20',
  recipient: { name: 'Krzysztof Malinowski', department: 'Zarząd' },
  contractor: { name: 'Nexora sp. z o.o.', nip: '1234567890' },
  value: { amount: 48000, currency: 'PLN' },
})
const faktura = makeDocument({
  title: 'Faktura FV/10/2026/0457',
  number: 'DOC-2026-00183',
  type: 'invoice',
  subtype: 'vat',
  status: 'in-approval',
  modifiedAt: '2026-10-27T09:15:00',
  registeredAt: '2026-10-01',
  recipient: { name: 'Agnieszka Pawlak', department: 'Finanse' },
  contractor: { name: 'Łąkowa Spółdzielnia', nip: '9876543210' },
  value: { amount: 1000, currency: 'PLN' },
})
const aneks = makeDocument({
  title: 'Aneks nr 2 do umowy najmu',
  number: 'DOC-2026-00171',
  type: 'annex',
  subtype: 'price-change',
  status: 'rejected',
  modifiedAt: '2026-10-22T11:03:00',
  registeredAt: '2026-10-31',
  recipient: { name: 'Agnieszka Pawlak', department: 'Finanse' },
  contractor: null,
  value: { amount: 5000, currency: 'EUR' },
})
const documents = [faktura, aneks, umowa]
const noFilters: DocumentFilters = { ...createEmptyFilterCriteria(), query: '' }

function criteria(overrides: Partial<DocumentFilterCriteria> = {}): DocumentFilterCriteria {
  return { ...createEmptyFilterCriteria(), ...overrides }
}

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

  it('statusy, rodzaj i frazę łączy przez AND', () => {
    expect(
      filterDocuments(documents, { ...noFilters, statuses: ['in-approval'], type: 'invoice' }),
    ).toEqual([faktura])
    expect(
      filterDocuments(documents, {
        ...noFilters,
        query: 'umowa',
        statuses: ['in-approval'],
        type: 'invoice',
      }),
    ).toEqual([])
  })

  it('filtruje po podtypie i odbiorcy', () => {
    expect(filterDocuments(documents, { ...noFilters, subtype: 'vat' })).toEqual([faktura])
    expect(filterDocuments(documents, { ...noFilters, recipient: 'Agnieszka Pawlak' })).toEqual([
      faktura,
      aneks,
    ])
  })

  it('zakres dat rejestracji obejmuje obie granice', () => {
    const range = { ...noFilters, registeredFrom: '2026-10-01', registeredTo: '2026-10-31' }
    expect(filterDocuments(documents, range)).toEqual(documents)
    expect(filterDocuments(documents, { ...noFilters, registeredFrom: '2026-10-02' })).toEqual([
      aneks,
      umowa,
    ])
    expect(filterDocuments(documents, { ...noFilters, registeredTo: '2026-10-20' })).toEqual([
      faktura,
      umowa,
    ])
  })

  it('filtruje po kontrahencie (nazwa lub NIP) i wartości', () => {
    expect(filterDocuments(documents, { ...noFilters, contractorQuery: 'lakowa' })).toEqual([
      faktura,
    ])
    expect(filterDocuments(documents, { ...noFilters, contractorQuery: '123-456' })).toEqual([
      umowa,
    ])
    expect(
      filterDocuments(documents, { ...noFilters, currency: 'PLN', valueMin: 1000, valueMax: 1000 }),
    ).toEqual([faktura])
    expect(filterDocuments(documents, { ...noFilters, currency: 'EUR', valueMax: 5000 })).toEqual([
      aneks,
    ])
  })
})

describe('filterDocuments – łączenie kryteriów kontrahenta, frazy i wartości', () => {
  const bezKontrahenta = makeDocument({
    title: 'Regulamin pracy',
    contractor: null,
    value: null,
  })
  const pool = [umowa, faktura, aneks, bezKontrahenta]

  it('fraza z samych spacji nie filtruje (także dokumentów bez kontrahenta)', () => {
    expect(filterDocuments(pool, { ...noFilters, contractorQuery: '   ' })).toEqual(pool)
  })

  it('kontrahent, fraza i wartość łączy przez AND', () => {
    expect(
      filterDocuments(pool, {
        ...noFilters,
        query: 'umowa',
        contractorQuery: 'nexora',
        currency: 'PLN',
        valueMin: 40000,
      }),
    ).toEqual([umowa])
    expect(
      filterDocuments(pool, {
        ...noFilters,
        query: 'umowa',
        contractorQuery: 'nexora',
        currency: 'PLN',
        valueMax: 1000,
      }),
    ).toEqual([])
    // Dokument bez kontrahenta odpada przy niepustej frazie kontrahenta.
    expect(
      filterDocuments(pool, { ...noFilters, query: 'regulamin', contractorQuery: 'a' }),
    ).toEqual([])
  })
})

describe('normalizeNip / matchesContractor', () => {
  const contractor = { name: 'Zakład Usług Łąkowych', nip: '1234567890' }

  it('usuwa spacje i myślniki z NIP', () => {
    expect(normalizeNip(' 123-456-78 90 ')).toBe('1234567890')
    expect(normalizeNip('123\u2013456')).toBe('123456')
  })

  it('usuwa prefiks VAT-UE „PL”', () => {
    expect(normalizeNip('PL1132456798')).toBe('1132456798')
    expect(normalizeNip('pl 113-245-67-98')).toBe('1132456798')
    expect(matchesContractor(contractor, 'PL1234567890')).toBe(true)
    expect(matchesContractor(contractor, 'PL 123-456')).toBe(true)
    expect(matchesContractor(contractor, 'PL9999')).toBe(false)
  })

  it('pusta fraza pasuje zawsze, brak kontrahenta nie pasuje do frazy', () => {
    expect(matchesContractor(null, '  ')).toBe(true)
    expect(matchesContractor(null, 'abc')).toBe(false)
  })

  it.each(['zaklad uslug', 'ŁĄKOWYCH', '123-456-78-90', '456 78', '7890'])(
    'fraza „%s” pasuje',
    (query) => {
      expect(matchesContractor(contractor, query)).toBe(true)
    },
  )

  it.each(['nexora', '0000', '12a'])('fraza „%s” nie pasuje', (query) => {
    expect(matchesContractor(contractor, query)).toBe(false)
  })
})

describe('matchesValue', () => {
  const pln = { amount: 1000, currency: 'PLN' as const }

  it('bez granic pasuje zawsze, także dla braku wartości', () => {
    expect(matchesValue(null, { currency: 'PLN', valueMin: null, valueMax: null })).toBe(true)
  })

  it('z granicą odrzuca brak wartości i inną walutę', () => {
    expect(matchesValue(null, { currency: 'PLN', valueMin: 0, valueMax: null })).toBe(false)
    expect(matchesValue(pln, { currency: 'EUR', valueMin: 0, valueMax: null })).toBe(false)
  })

  it('granice są włączne', () => {
    expect(matchesValue(pln, { currency: 'PLN', valueMin: 1000, valueMax: 1000 })).toBe(true)
    expect(matchesValue(pln, { currency: 'PLN', valueMin: 1000.01, valueMax: null })).toBe(false)
    expect(matchesValue(pln, { currency: 'PLN', valueMin: null, valueMax: 999.99 })).toBe(false)
  })
})

describe('countByStatus / getRecipientOptions / getSubtypeOptions', () => {
  it('liczy dokumenty w statusach, z zerami dla pozostałych', () => {
    expect(countByStatus(documents)).toEqual({
      draft: 0,
      'in-approval': 2,
      approved: 0,
      rejected: 1,
      completed: 0,
    })
  })

  it('zwraca unikalnych odbiorców posortowanych po polsku', () => {
    const extra = makeDocument({ recipient: { name: 'Łukasz Zając', department: 'IT' } })
    const lastL = makeDocument({ recipient: { name: 'Lena Kos', department: 'IT' } })
    expect(getRecipientOptions([...documents, extra, lastL]).map((o) => o.value)).toEqual([
      'Agnieszka Pawlak',
      'Krzysztof Malinowski',
      'Lena Kos',
      'Łukasz Zając',
    ])
  })

  it('podtypy zależą od rodzaju', () => {
    expect(getSubtypeOptions(null)).toEqual([])
    expect(getSubtypeOptions('invoice')).toEqual([
      { value: 'vat', label: 'VAT' },
      { value: 'correction', label: 'Korygująca' },
      { value: 'proforma', label: 'Proforma' },
    ])
  })
})

describe('buildActiveFilterChips / removeChipFromCriteria', () => {
  const full = criteria({
    statuses: ['rejected', 'draft'],
    type: 'invoice',
    subtype: 'vat',
    registeredFrom: '2026-10-01',
    registeredTo: '2026-10-31',
    recipient: 'Agnieszka Pawlak',
    contractorQuery: '  Nexora ',
    currency: 'PLN',
    valueMin: 1000,
    valueMax: 5000,
  })

  it('buduje chipy w stałej kolejności z polskimi etykietami', () => {
    expect(buildActiveFilterChips(full).map((chip) => chip.label)).toEqual([
      'Status: Wersja robocza',
      'Status: Odrzucony',
      'Rodzaj: Faktura',
      'Podtyp: VAT',
      'Data: 01.10 \u2013 31.10.2026',
      'Odbiorca: Agnieszka Pawlak',
      'Kontrahent: Nexora',
      'Wartość: 1\u00a0000 \u2013 5\u00a0000 PLN',
    ])
    expect(new Set(buildActiveFilterChips(full).map((chip) => chip.id)).size).toBe(8)
  })

  it('pomija puste kryteria (np. sama waluta lub fraza z samych spacji)', () => {
    expect(buildActiveFilterChips(criteria({ currency: 'EUR', contractorQuery: '  ' }))).toEqual([])
  })

  it('usuwa filtr bez mutowania wejścia; rodzaj czyści też podtyp', () => {
    const chips = buildActiveFilterChips(full)
    const byKind = (kind: string) => chips.find((chip) => chip.kind === kind)!

    const withoutType = removeChipFromCriteria(full, byKind('type'))
    expect(withoutType).toMatchObject({ type: null, subtype: null })
    expect(full.type).toBe('invoice')

    const withoutStatus = removeChipFromCriteria(full, chips[0]!)
    expect(withoutStatus.statuses).toEqual(['rejected'])
    expect(full.statuses).toEqual(['rejected', 'draft'])

    expect(removeChipFromCriteria(full, byKind('registeredAt'))).toMatchObject({
      registeredFrom: null,
      registeredTo: null,
    })
    expect(removeChipFromCriteria(full, byKind('value'))).toMatchObject({
      valueMin: null,
      valueMax: null,
      currency: 'PLN',
    })
    expect(removeChipFromCriteria(full, byKind('subtype'))).toMatchObject({
      type: 'invoice',
      subtype: null,
    })
    expect(removeChipFromCriteria(full, byKind('recipient')).recipient).toBeNull()
    expect(removeChipFromCriteria(full, byKind('contractor')).contractorQuery).toBe('')
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
