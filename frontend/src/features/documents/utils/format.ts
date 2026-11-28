import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'

import { formatPlAmount, formatResultsRange, pluralizePl } from '@/lib/format'

export interface FormattedDocumentDate {
  /** Np. „28 paź 2026”. */
  date: string
  /** Np. „14:32”. */
  time: string
}

/** Wartość ze strefą (`Z`, `+02:00`) jest pokazywana w strefie czasowej przeglądarki. */
export function formatDocumentDate(iso: string): FormattedDocumentDate {
  const value = parseISO(iso)
  return {
    date: format(value, 'd MMM yyyy', { locale: pl }),
    time: format(value, 'HH:mm', { locale: pl }),
  }
}

/** „1 dokument”, „2 dokumenty”, „5 dokumentów”, „22 dokumenty”, „12 dokumentów”. */
export function formatDocumentCount(count: number): string {
  return `${count} ${pluralizePl(count, ['dokument', 'dokumenty', 'dokumentów'])}`
}

/** Re-eksport wspólnego formatera – istniejące importy z feature'a działają bez zmian. */
export { formatResultsRange }

const EN_DASH = '–'

/** `YYYY-MM-DD` → `[DD, MM, YYYY]` bez parsowania do `Date` (brak przesunięć stref). */
function splitIsoDate(iso: string): [string, string, string] {
  const [year = '', month = '', day = ''] = iso.split('-')
  return [day, month, year]
}

function formatShortDate(iso: string, withYear: boolean): string {
  const [day, month, year] = splitIsoDate(iso)
  return withYear ? `${day}.${month}.${year}` : `${day}.${month}`
}

/**
 * Zakres dat rejestracji do chipa: „01.10 – 31.10.2026” (ten sam rok), „01.12.2025 – 31.01.2026”,
 * „od 01.10.2026”, „do 31.10.2026”. Bez granic – pusty tekst.
 */
export function formatFilterDateRange(from: string | null, to: string | null): string {
  if (from && to) {
    const sameYear = splitIsoDate(from)[2] === splitIsoDate(to)[2]
    return `${formatShortDate(from, !sameYear)} ${EN_DASH} ${formatShortDate(to, true)}`
  }
  if (from) return `od ${formatShortDate(from, true)}`
  if (to) return `do ${formatShortDate(to, true)}`
  return ''
}

/**
 * Kwota w dokumentach: maks. 2 miejsca po przecinku bez zbędnych zer – „1 000”, „2 150,5”.
 * Ujemne kwoty z łącznikiem `-` (zachowanie sprzed wydzielenia wspólnego formatera).
 */
export function formatAmount(amount: number): string {
  return formatPlAmount(amount)
}

/** „1 000 – 5 000 PLN”, „od 1 000 PLN”, „do 5 000 PLN”; bez granic – pusty tekst. */
export function formatAmountRange(
  min: number | null,
  max: number | null,
  currency: string,
): string {
  if (min !== null && max !== null) {
    return `${formatAmount(min)} ${EN_DASH} ${formatAmount(max)} ${currency}`
  }
  if (min !== null) return `od ${formatAmount(min)} ${currency}`
  if (max !== null) return `do ${formatAmount(max)} ${currency}`
  return ''
}
