import { describe, expect, it } from 'vitest'

import { fetchDocuments } from '../api/documents'
import rawDocuments from '../mocks/documents.json'
import { DOCUMENT_STATUSES } from '../constants'
import { documentListItemSchema } from '../schemas'

describe('fetchDocuments', () => {
  it('zwraca zwalidowane dane przykładowe', async () => {
    const documents = await fetchDocuments()

    expect(documents).toHaveLength(26)
    expect(new Set(documents.map((document) => document.id)).size).toBe(documents.length)
    expect(documents[0]).toMatchObject({
      title: 'Umowa o świadczenie usług – Nexora',
      number: 'DOC-2026-00184',
      status: 'in-approval',
    })
    expect(documents.some((document) => document.status === 'completed')).toBe(true)
  })

  it('mock pokrywa wszystkie przypadki filtrów', async () => {
    const documents = await fetchDocuments()

    for (const status of DOCUMENT_STATUSES) {
      expect(
        documents.some((document) => document.status === status),
        status,
      ).toBe(true)
    }
    expect(documents.some((document) => document.contractor === null)).toBe(true)
    expect(documents.some((document) => document.value === null)).toBe(true)
    expect(
      documents.some((document) => document.value !== null && document.value.currency !== 'PLN'),
    ).toBe(true)
  })

  it('rok w numerze zgadza się z rokiem rejestracji', async () => {
    const documents = await fetchDocuments()
    for (const document of documents) {
      expect(document.number.slice(4, 8), document.id).toBe(document.registeredAt.slice(0, 4))
    }
  })

  it('data rejestracji nie jest późniejsza niż data modyfikacji', async () => {
    const documents = await fetchDocuments()
    for (const document of documents) {
      expect(document.registeredAt <= document.modifiedAt.slice(0, 10)).toBe(true)
    }
  })

  it('schemat waliduje podtyp, kontrahenta i wartość', () => {
    const valid = rawDocuments[0]!
    const parse = (overrides: Record<string, unknown>) =>
      documentListItemSchema.safeParse({ ...valid, ...overrides }).success

    expect(parse({ subtype: 'vat' })).toBe(false)
    expect(parse({ subtype: 'nieznany' })).toBe(false)
    expect(parse({ registeredAt: '2026-02-30' })).toBe(false)
    expect(parse({ contractor: null, value: null })).toBe(true)
    expect(parse({ contractor: { name: 'Firma', nip: '123-456-78-90' } })).toBe(false)
    expect(parse({ value: { amount: -1, currency: 'PLN' } })).toBe(false)
    expect(parse({ value: { amount: 10, currency: 'GBP' } })).toBe(false)
    expect(parse({ value: { amount: 1e12, currency: 'PLN' } })).toBe(true)
    expect(parse({ value: { amount: 1e12 + 1, currency: 'PLN' } })).toBe(false)
  })

  it.each(['2026-10-28T14:32:00', '2026-10-28T14:32:00Z', '2026-10-28T14:32:00+02:00'])(
    'schemat akceptuje modifiedAt „%s”',
    (modifiedAt) => {
      expect(documentListItemSchema.safeParse({ ...rawDocuments[0], modifiedAt }).success).toBe(
        true,
      )
    },
  )

  it('schemat odrzuca nieistniejącą datę i typ spoza listy', () => {
    const valid = rawDocuments[0]
    expect(
      documentListItemSchema.safeParse({ ...valid, modifiedAt: '2026-02-30T10:00:00' }).success,
    ).toBe(false)
    expect(documentListItemSchema.safeParse({ ...valid, type: 'Umowa' }).success).toBe(false)
  })

  it('schemat odrzuca niepoprawny numer, status i datę', () => {
    const valid = rawDocuments[0]
    expect(documentListItemSchema.safeParse(valid).success).toBe(true)
    expect(documentListItemSchema.safeParse({ ...valid, number: '../etc' }).success).toBe(false)
    expect(documentListItemSchema.safeParse({ ...valid, status: 'unknown' }).success).toBe(false)
    expect(documentListItemSchema.safeParse({ ...valid, modifiedAt: 'wczoraj' }).success).toBe(
      false,
    )
  })
})
