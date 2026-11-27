import { useQuery } from '@tanstack/vue-query'

import rawDocuments from '../mocks/documents.json'
import { documentListSchema } from '../schemas'
import type { DocumentListItem } from '../types'

export const documentsQueryKey = ['documents', 'list'] as const

/**
 * Lista dokumentów. Dane są walidowane schematem – źródło traktujemy jako niezaufane.
 *
 * TODO(Faza 3): zastąpić lokalny JSON wywołaniem `http.get('/documents', { params })`.
 * Filtry, sortowanie i paginacja przejdą wtedy na serwer jako parametry zapytania
 * (fraza, statusy, rodzaje, kierunek sortowania, strona, rozmiar strony), klucz zapytania
 * stanie się `['documents', 'list', params]`, a `useDocumentsQuery` dostanie
 * `placeholderData: keepPreviousData`, by lista nie migała przy zmianie strony/filtrów.
 */
export async function fetchDocuments(): Promise<DocumentListItem[]> {
  return documentListSchema.parse(rawDocuments)
}

export function useDocumentsQuery() {
  return useQuery({ queryKey: documentsQueryKey, queryFn: fetchDocuments })
}
