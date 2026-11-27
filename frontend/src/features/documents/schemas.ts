import { z } from 'zod'

export const documentStatusSchema = z.enum(['in-approval', 'draft', 'rejected', 'approved'])

export const documentTypeSchema = z.enum(['contract', 'invoice', 'regulation', 'annex', 'protocol'])

export const documentListItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  number: z.string().regex(/^DOC-\d{4}-\d{5}$/),
  type: documentTypeSchema,
  author: z.object({
    name: z.string().min(1),
    department: z.string().min(1),
  }),
  /**
   * ISO 8601: czas lokalny bez strefy (np. `2026-10-28T14:32:00`) albo ze strefą
   * (`…Z`, `…+02:00`). Niepoprawne daty kalendarzowe (np. 30 lutego) są odrzucane.
   */
  modifiedAt: z.iso.datetime({ local: true, offset: true }),
  status: documentStatusSchema,
})

export const documentListSchema = z.array(documentListItemSchema)
