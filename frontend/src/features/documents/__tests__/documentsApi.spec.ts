import { describe, expect, it } from 'vitest'

import { fetchDocuments } from '../api/documents'
import rawDocuments from '../mocks/documents.json'
import { documentListItemSchema } from '../schemas'

describe('fetchDocuments', () => {
  it('zwraca zwalidowane dane przykładowe', async () => {
    const documents = await fetchDocuments()

    expect(documents).toHaveLength(23)
    expect(new Set(documents.map((document) => document.id)).size).toBe(documents.length)
    expect(documents[0]).toMatchObject({
      title: 'Umowa o świadczenie usług – Nexora',
      number: 'DOC-2026-00184',
      status: 'in-approval',
    })
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
