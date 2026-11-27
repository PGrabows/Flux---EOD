import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'

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
  if (count === 1) return '1 dokument'
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  const isFew = lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)
  return `${count} ${isFew ? 'dokumenty' : 'dokumentów'}`
}

/** „Wyświetlanie 1–5 z 126” (półpauza U+2013). */
export function formatResultsRange(start: number, end: number, total: number): string {
  return `Wyświetlanie ${start}–${end} z ${total}`
}
