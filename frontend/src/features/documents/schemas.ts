import { z } from 'zod'

/** Kolejność wartości = kolejność w panelu filtrów. */
export const documentStatusSchema = z.enum([
  'draft',
  'in-approval',
  'approved',
  'rejected',
  'completed',
])

export const documentTypeSchema = z.enum(['contract', 'invoice', 'regulation', 'annex', 'protocol'])

/** Podtypy mają globalnie unikalne slugi – przynależność do rodzaju opisuje mapa poniżej. */
export const documentSubtypeSchema = z.enum([
  'service-agreement',
  'lease',
  'specific-work',
  'nda',
  'vat',
  'correction',
  'proforma',
  'work-rules',
  'remuneration',
  'social-fund',
  'price-change',
  'term-extension',
  'scope-change',
  'acceptance',
  'handover',
  'meeting',
])

type DocumentTypeValue = z.infer<typeof documentTypeSchema>
type DocumentSubtypeValue = z.infer<typeof documentSubtypeSchema>

export const DOCUMENT_SUBTYPES_BY_TYPE: Readonly<
  Record<DocumentTypeValue, readonly DocumentSubtypeValue[]>
> = {
  contract: ['service-agreement', 'lease', 'specific-work', 'nda'],
  invoice: ['vat', 'correction', 'proforma'],
  regulation: ['work-rules', 'remuneration', 'social-fund'],
  annex: ['price-change', 'term-extension', 'scope-change'],
  protocol: ['acceptance', 'handover', 'meeting'],
}

export function isSubtypeOfType(subtype: DocumentSubtypeValue, type: DocumentTypeValue): boolean {
  return DOCUMENT_SUBTYPES_BY_TYPE[type].includes(subtype)
}

/** Górna granica kwot (dokumentów i filtrów) – chroni przed absurdalnymi wartościami. */
export const MAX_DOCUMENT_AMOUNT = 1e12

/** Maksymalna długość frazy kontrahenta w filtrze. */
export const CONTRACTOR_QUERY_MAX_LENGTH = 100

export const currencySchema = z.enum(['PLN', 'EUR', 'USD'])

/** NIP: dokładnie 10 cyfr, bez separatorów. */
export const nipSchema = z.string().regex(/^\d{10}$/)

export const documentListItemSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    number: z.string().regex(/^DOC-\d{4}-\d{5}$/),
    type: documentTypeSchema,
    subtype: documentSubtypeSchema,
    author: z.object({
      name: z.string().min(1),
      department: z.string().min(1),
    }),
    /**
     * ISO 8601: czas lokalny bez strefy (np. `2026-10-28T14:32:00`) albo ze strefą
     * (`…Z`, `…+02:00`). Niepoprawne daty kalendarzowe (np. 30 lutego) są odrzucane.
     */
    modifiedAt: z.iso.datetime({ local: true, offset: true }),
    /** Data rejestracji `YYYY-MM-DD`. */
    registeredAt: z.iso.date(),
    status: documentStatusSchema,
    /** Odbiorca w firmie. */
    recipient: z.object({
      name: z.string().min(1),
      department: z.string().min(1),
    }),
    /** Kontrahent zewnętrzny – brak np. dla wewnętrznych regulaminów. */
    contractor: z
      .object({
        name: z.string().min(1),
        nip: nipSchema,
      })
      .nullable(),
    value: z
      .object({
        amount: z.number().finite().nonnegative().max(MAX_DOCUMENT_AMOUNT),
        currency: currencySchema,
      })
      .nullable(),
  })
  .refine((document) => isSubtypeOfType(document.subtype, document.type), {
    message: 'Podtyp nie pasuje do rodzaju dokumentu',
    path: ['subtype'],
  })

export const documentListSchema = z.array(documentListItemSchema)

/** Format `YYYY-MM-DD` z 4-cyfrowym rokiem i istniejącym dniem (np. bez 30 lutego). */
const filterDateSchema = z.iso.date({ error: 'Podaj poprawną datę (RRRR-MM-DD)' }).nullable()
const filterAmountSchema = z
  .number({ error: 'Podaj poprawną kwotę' })
  .max(MAX_DOCUMENT_AMOUNT, { error: 'Kwota jest zbyt duża' })
  .nullable()

/**
 * Kryteria panelu filtrów (bez frazy wyszukiwania) – jedyne źródło typu `DocumentFilterCriteria`.
 * Niepoprawne wartości pól (np. nieistniejąca data, kwota nieskończona) są odrzucane z komunikatem.
 */
export const documentFilterCriteriaSchema = z
  .object({
    statuses: z.array(documentStatusSchema).readonly(),
    type: documentTypeSchema.nullable(),
    subtype: documentSubtypeSchema.nullable(),
    /** `YYYY-MM-DD`, włącznie. */
    registeredFrom: filterDateSchema,
    /** `YYYY-MM-DD`, włącznie. */
    registeredTo: filterDateSchema,
    /** Nazwa odbiorcy w firmie. */
    recipient: z.string().min(1).nullable(),
    /** Fraza dopasowywana do nazwy kontrahenta lub NIP. */
    contractorQuery: z.string().max(CONTRACTOR_QUERY_MAX_LENGTH),
    /** Waluta, której dotyczy zakres wartości. */
    currency: currencySchema,
    valueMin: filterAmountSchema,
    valueMax: filterAmountSchema,
  })
  .superRefine((criteria, ctx) => {
    const { type, subtype, valueMin, valueMax, registeredFrom, registeredTo } = criteria
    if (subtype !== null && (type === null || !isSubtypeOfType(subtype, type))) {
      ctx.addIssue({
        code: 'custom',
        path: ['subtype'],
        message: 'Podtyp nie pasuje do rodzaju dokumentu',
      })
    }
    if ((valueMin !== null && valueMin < 0) || (valueMax !== null && valueMax < 0)) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'Wartość nie może być ujemna' })
    } else if (valueMin !== null && valueMax !== null && valueMin > valueMax) {
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: 'Wartość „od” nie może być większa niż „do”',
      })
    }
    // Daty YYYY-MM-DD porównujemy tekstowo – kolejność leksykograficzna = chronologiczna.
    if (registeredFrom !== null && registeredTo !== null && registeredFrom > registeredTo) {
      ctx.addIssue({
        code: 'custom',
        path: ['registeredAt'],
        message: 'Data „od” nie może być późniejsza niż „do”',
      })
    }
  })
