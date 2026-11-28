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
 * (fraza, statusy, rodzaj, podtyp, zakres dat rejestracji, odbiorca, kontrahent/NIP, waluta
 * i zakres wartości, kierunek sortowania, strona, rozmiar strony), klucz zapytania
 * stanie się `['documents', 'list', params]`, a `useDocumentsQuery` dostanie
 * `placeholderData: keepPreviousData`, by lista nie migała przy zmianie strony/filtrów.
 *
 * Panel filtrów liczy dziś lokalnie liczniki statusów, słownik odbiorców i podgląd liczby
 * wyników szkicu („Pokaż wyniki (N)”). Po przejściu na API trafią one do osobnych zapytań:
 * fasety (liczniki statusów, odbiorcy) – np. `['documents', 'facets']`, oraz podgląd liczby –
 * `['documents', 'count', params]` z debounce zmian szkicu, by nie wysyłać zapytania
 * przy każdym znaku.
 */
export async function fetchDocuments(): Promise<DocumentListItem[]> {
  return documentListSchema.parse(rawDocuments)
}

export function useDocumentsQuery() {
  return useQuery({ queryKey: documentsQueryKey, queryFn: fetchDocuments })
}
