import { computed, type MaybeRefOrGetter, ref, toValue } from 'vue'

import {
  CONTRACTOR_QUERY_MAX_LENGTH,
  copyFilterCriteria,
  createEmptyFilterCriteria,
} from '../constants'
import {
  currencySchema,
  documentFilterCriteriaSchema,
  documentSubtypeSchema,
  documentTypeSchema,
  isSubtypeOfType,
} from '../schemas'
import type {
  DocumentFilterCriteria,
  DocumentListItem,
  DocumentStatus,
  FilterOption,
} from '../types'
import {
  countByStatus,
  filterDocuments,
  getRecipientOptions,
  getSubtypeOptions,
} from '../utils/documentList'

export interface DocumentFilterDraftErrors {
  subtype?: string
  registeredAt?: string
  value?: string
}

/** Pola schematu → sekcja panelu, pod którą pokazujemy komunikat. */
const ERROR_SECTIONS: Record<string, keyof DocumentFilterDraftErrors> = {
  subtype: 'subtype',
  registeredFrom: 'registeredAt',
  registeredTo: 'registeredAt',
  registeredAt: 'registeredAt',
  valueMin: 'value',
  valueMax: 'value',
  value: 'value',
}

/**
 * Kwota z pola liczbowego. Puste pole → `null` (brak granicy). Tekst, który nie jest liczbą
 * skończoną (np. „abc”, „1e400”), zwraca `NaN`/`Infinity` – walidacja pokaże błąd, zamiast
 * po cichu zgubić wpis. Wartości ujemne są przepuszczane z tego samego powodu.
 */
export function parseAmount(raw: string | number): number | null {
  if (typeof raw === 'number') return raw
  const trimmed = raw.trim().replace(',', '.')
  if (trimmed === '') return null
  return Number(trimmed)
}

/** Data z pola: puste → `null`, inaczej surowy tekst (walidowany schematem). */
function parseDate(raw: string): string | null {
  const trimmed = raw.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Szkic filtrów panelu: kopia zastosowanych kryteriów edytowana do czasu „Pokaż wyniki”.
 * Wartości z pól formularza traktujemy jako niezaufane – waliduje je jeden `safeParse`.
 */
export function useDocumentFilterDraft(
  documents: MaybeRefOrGetter<readonly DocumentListItem[]>,
  query: MaybeRefOrGetter<string>,
) {
  const draft = ref<DocumentFilterCriteria>(createEmptyFilterCriteria())
  /** Odbiorca z zastosowanych filtrów – pozostaje wybieralny, nawet gdy zniknął z danych. */
  const appliedRecipient = ref<string | null>(null)

  /** Liczniki statusów – statyczne, z całego źródła danych. */
  const statusCounts = computed(() => countByStatus(toValue(documents)))
  const recipientOptions = computed<FilterOption[]>(() => {
    const options = getRecipientOptions(toValue(documents))
    const extra = appliedRecipient.value
    if (extra !== null && !options.some((option) => option.value === extra)) {
      return [...options, { value: extra, label: extra }]
    }
    return options
  })
  const subtypeOptions = computed(() => getSubtypeOptions(draft.value.type))
  const previewCount = computed(
    () => filterDocuments(toValue(documents), { ...draft.value, query: toValue(query) }).length,
  )

  const validation = computed(() => documentFilterCriteriaSchema.safeParse(draft.value))
  const isValid = computed(() => validation.value.success)
  const errors = computed<DocumentFilterDraftErrors>(() => {
    const result = validation.value
    if (result.success) return {}
    const found: DocumentFilterDraftErrors = {}
    for (const issue of result.error.issues) {
      const section = ERROR_SECTIONS[String(issue.path[0])]
      if (section && !found[section]) found[section] = issue.message
    }
    return found
  })

  function update(patch: Partial<DocumentFilterCriteria>) {
    draft.value = { ...draft.value, ...patch }
  }

  function reset(applied: DocumentFilterCriteria) {
    appliedRecipient.value = applied.recipient
    draft.value = copyFilterCriteria(applied)
  }

  function clear() {
    draft.value = createEmptyFilterCriteria()
  }

  function setStatus(status: DocumentStatus, checked: boolean) {
    const without = draft.value.statuses.filter((item) => item !== status)
    update({ statuses: checked ? [...without, status] : without })
  }

  /** Zmiana rodzaju zawsze czyści podtyp (opcje podtypu zależą od rodzaju). */
  function setType(raw: string) {
    const parsed = documentTypeSchema.safeParse(raw)
    update({ type: parsed.success ? parsed.data : null, subtype: null })
  }

  function setSubtype(raw: string) {
    const parsed = documentSubtypeSchema.safeParse(raw)
    const { type } = draft.value
    const valid = parsed.success && type !== null && isSubtypeOfType(parsed.data, type)
    update({ subtype: valid ? parsed.data : null })
  }

  function setRecipient(raw: string) {
    const exists = recipientOptions.value.some((option) => option.value === raw)
    update({ recipient: exists ? raw : null })
  }

  function setRegisteredFrom(raw: string) {
    update({ registeredFrom: parseDate(raw) })
  }

  function setRegisteredTo(raw: string) {
    update({ registeredTo: parseDate(raw) })
  }

  function setContractorQuery(raw: string) {
    update({ contractorQuery: raw.slice(0, CONTRACTOR_QUERY_MAX_LENGTH) })
  }

  function setCurrency(raw: string) {
    const parsed = currencySchema.safeParse(raw)
    if (parsed.success) update({ currency: parsed.data })
  }

  function setValueMin(raw: string | number) {
    update({ valueMin: parseAmount(raw) })
  }

  function setValueMax(raw: string | number) {
    update({ valueMax: parseAmount(raw) })
  }

  return {
    draft,
    statusCounts,
    recipientOptions,
    subtypeOptions,
    previewCount,
    validation,
    errors,
    isValid,
    reset,
    clear,
    setStatus,
    setType,
    setSubtype,
    setRecipient,
    setRegisteredFrom,
    setRegisteredTo,
    setContractorQuery,
    setCurrency,
    setValueMin,
    setValueMax,
  }
}
