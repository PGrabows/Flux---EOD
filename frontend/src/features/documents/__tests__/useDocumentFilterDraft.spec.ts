import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { parseAmount, useDocumentFilterDraft } from '../composables/useDocumentFilterDraft'
import { createEmptyFilterCriteria } from '../constants'
import { makeDocument } from './fixtures'

const documents = [
  makeDocument({
    title: 'Faktura A',
    status: 'in-approval',
    type: 'invoice',
    subtype: 'vat',
    recipient: { name: 'Zofia Nowak', department: 'Finanse' },
    value: { amount: 100, currency: 'PLN' },
  }),
  makeDocument({
    title: 'Umowa B',
    status: 'approved',
    recipient: { name: 'Adam Lis', department: 'Zarząd' },
  }),
  makeDocument({ title: 'Umowa C', status: 'approved' }),
]

function setup(query = '') {
  return useDocumentFilterDraft(documents, ref(query))
}

describe('parseAmount', () => {
  it.each([
    ['', null],
    [' ', null],
    ['1,5', 1.5],
    ['12.25', 12.25],
    ['-3', -3],
    [7, 7],
    ['1e400', Number.POSITIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
  ] as const)('„%s” → %s', (raw, expected) => {
    expect(parseAmount(raw)).toBe(expected)
  })

  it('tekst niebędący liczbą daje NaN (błąd zamiast cichego null)', () => {
    expect(parseAmount('abc')).toBeNaN()
    expect(parseAmount(Number.NaN)).toBeNaN()
  })
})

describe('useDocumentFilterDraft', () => {
  it('liczy statusy z całego źródła i podaje odbiorców', () => {
    const draft = setup()

    draft.setStatus('approved', true)
    expect(draft.statusCounts.value).toMatchObject({ 'in-approval': 1, approved: 2, rejected: 0 })
    expect(draft.recipientOptions.value.map((option) => option.value)).toEqual([
      'Adam Lis',
      'Odbiorca Testowy',
      'Zofia Nowak',
    ])
  })

  it('podgląd liczby wyników uwzględnia szkic i frazę wyszukiwania', () => {
    const draft = setup('umowa')

    expect(draft.previewCount.value).toBe(2)
    draft.setRecipient('Adam Lis')
    expect(draft.previewCount.value).toBe(1)
    draft.setRecipient('Nieznany')
    expect(draft.draft.value.recipient).toBeNull()
  })

  it('rodzaj waliduje wartość i zawsze czyści podtyp; podtyp musi pasować do rodzaju', () => {
    const draft = setup()

    draft.setSubtype('vat')
    expect(draft.draft.value.subtype).toBeNull()

    draft.setType('invoice')
    expect(draft.subtypeOptions.value.map((option) => option.value)).toEqual([
      'vat',
      'correction',
      'proforma',
    ])
    draft.setSubtype('lease')
    expect(draft.draft.value.subtype).toBeNull()
    draft.setSubtype('vat')
    expect(draft.draft.value.subtype).toBe('vat')

    draft.setType('invoice')
    expect(draft.draft.value.subtype).toBeNull()
    draft.setType('')
    expect(draft.draft.value.type).toBeNull()
    draft.setType('nieznany')
    expect(draft.draft.value.type).toBeNull()
  })

  it('niepoprawna data pokazuje błąd zamiast cicho znikać; puste pole czyści granicę', () => {
    const draft = setup()

    draft.setRegisteredFrom('2026-10-01')
    draft.setRegisteredTo('2026-02-30')
    expect(draft.draft.value).toMatchObject({
      registeredFrom: '2026-10-01',
      registeredTo: '2026-02-30',
    })
    expect(draft.errors.value.registeredAt).toBe('Podaj poprawną datę (RRRR-MM-DD)')
    expect(draft.isValid.value).toBe(false)

    draft.setRegisteredTo('275760-01-01')
    expect(draft.errors.value.registeredAt).toBe('Podaj poprawną datę (RRRR-MM-DD)')

    draft.setRegisteredTo('  ')
    expect(draft.draft.value.registeredTo).toBeNull()
    expect(draft.isValid.value).toBe(true)
  })

  it('kwota nieskończona lub nieliczbowa pokazuje błąd; zbyt duża kwota też', () => {
    const draft = setup()

    draft.setValueMin('1e400')
    expect(draft.errors.value.value).toBe('Podaj poprawną kwotę')
    expect(draft.isValid.value).toBe(false)

    draft.setValueMin('abc')
    expect(draft.errors.value.value).toBe('Podaj poprawną kwotę')

    draft.setValueMin('2e12')
    expect(draft.errors.value.value).toBe('Kwota jest zbyt duża')

    draft.setValueMin('')
    expect(draft.validation.value.success).toBe(true)
  })

  it('waluta przyjmuje tylko znane wartości', () => {
    const draft = setup()

    draft.setCurrency('GBP')
    expect(draft.draft.value.currency).toBe('PLN')
    draft.setCurrency('EUR')
    expect(draft.draft.value.currency).toBe('EUR')
  })

  it('zgłasza błędy zakresów i blokuje zastosowanie', () => {
    const draft = setup()
    expect(draft.isValid.value).toBe(true)
    expect(draft.errors.value).toEqual({})

    draft.setRegisteredFrom('2026-10-31')
    draft.setRegisteredTo('2026-10-01')
    expect(draft.errors.value.registeredAt).toBe('Data „od” nie może być późniejsza niż „do”')
    expect(draft.isValid.value).toBe(false)

    draft.setRegisteredTo('')
    draft.setValueMin('500')
    draft.setValueMax('100')
    expect(draft.errors.value).toEqual({ value: 'Wartość „od” nie może być większa niż „do”' })

    draft.setValueMin('-1')
    expect(draft.errors.value.value).toBe('Wartość nie może być ujemna')

    draft.setValueMin('')
    expect(draft.isValid.value).toBe(true)
  })

  it('zastosowany odbiorca spoza danych jest dołączany do opcji', () => {
    const draft = setup()

    draft.reset({ ...createEmptyFilterCriteria(), recipient: 'Były Pracownik' })
    expect(draft.recipientOptions.value.map((option) => option.value)).toContain('Były Pracownik')
    draft.setRecipient('Adam Lis')
    draft.setRecipient('Były Pracownik')
    expect(draft.draft.value.recipient).toBe('Były Pracownik')
    expect(draft.recipientOptions.value).toHaveLength(4)
  })

  it('podtyp niezgodny z rodzajem (np. z zastosowanych filtrów) daje błąd', () => {
    const draft = setup()

    draft.reset({ ...createEmptyFilterCriteria(), type: 'contract', subtype: 'vat' })
    expect(draft.errors.value.subtype).toBe('Podtyp nie pasuje do rodzaju dokumentu')
    draft.reset({ ...createEmptyFilterCriteria(), subtype: 'vat' })
    expect(draft.isValid.value).toBe(false)
  })

  it('reset kopiuje zastosowane kryteria, clear przywraca puste', () => {
    const draft = setup()
    const applied = { ...createEmptyFilterCriteria(), statuses: ['draft' as const] }

    draft.reset(applied)
    draft.setStatus('rejected', true)
    expect(applied.statuses).toEqual(['draft'])
    expect(draft.draft.value.statuses).toEqual(['draft', 'rejected'])

    // T8: limit długości frazy kontrahenta.
    draft.setContractorQuery('x'.repeat(150))
    expect(draft.draft.value.contractorQuery).toHaveLength(100)
    expect(draft.isValid.value).toBe(true)

    draft.clear()
    expect(draft.draft.value).toEqual(createEmptyFilterCriteria())
  })
})
