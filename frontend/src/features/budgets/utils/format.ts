import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'

import { formatPlAmount, NBSP, pluralizePl } from '@/lib/format'

/** Minus typograficzny (U+2212) – jak w Figmie dla ujemnych kwot budżetu. */
const MINUS = '\u2212'
const EN_DASH = '\u2013'

/**
 * Kwota budżetu zawsze z dwoma miejscami po przecinku: „120 000,00”, „−1 340,00”.
 * W odróżnieniu od kwot w dokumentach nie obcina zer (zestawienia finansowe).
 */
export function formatBudgetAmount(amount: number): string {
  return formatPlAmount(amount, { fixedFraction: true, minusSign: MINUS })
}

/** „300 000,00 PLN”. */
export function formatBudgetCurrency(amount: number, currency = 'PLN'): string {
  return `${formatBudgetAmount(amount)}${NBSP}${currency}`
}

/** Poniżej tej kwoty skrót „tys.” zaokrągliłby się do zera. */
const MIN_THOUSANDS_AMOUNT = 50

/** Skrót kwoty do wykresu: „12 tys.”, „4,5 tys.”, „22,7 tys.”; małe kwoty „<0,1 tys.”, zero „0”. */
export function formatThousands(amount: number): string {
  if (amount === 0) return '0'
  if (Math.abs(amount) < MIN_THOUSANDS_AMOUNT) return `<0,1${NBSP}tys.`
  const value = Math.round(amount / 100) / 10
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',')
  return `${text}${NBSP}tys.`
}

/** „1 budżet”, „2 budżety”, „5 budżetów”, „22 budżety”, „12 budżetów”. */
export function formatBudgetCount(count: number): string {
  return `${count} ${pluralizePl(count, ['budżet', 'budżety', 'budżetów'])}`
}

/** „1 sty – 31 gru 2026”; różne lata – „1 gru 2025 – 30 lis 2026”. */
export function formatBudgetPeriod(startIso: string, endIso: string): string {
  const start = parseISO(startIso)
  const end = parseISO(endIso)
  const sameYear = start.getFullYear() === end.getFullYear()
  const startText = format(start, sameYear ? 'd MMM' : 'd MMM yyyy', { locale: pl })
  return `${startText} ${EN_DASH} ${format(end, 'd MMM yyyy', { locale: pl })}`
}

/** „18 lis 2026”. */
export function formatBudgetDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy', { locale: pl })
}

const MONTH_LABELS = [
  'Sty',
  'Lut',
  'Mar',
  'Kwi',
  'Maj',
  'Cze',
  'Lip',
  'Sie',
  'Wrz',
  'Paź',
  'Lis',
  'Gru',
] as const

const MONTH_NAMES = [
  'styczeń',
  'luty',
  'marzec',
  'kwiecień',
  'maj',
  'czerwiec',
  'lipiec',
  'sierpień',
  'wrzesień',
  'październik',
  'listopad',
  'grudzień',
] as const

/** Skrót miesiąca na osi wykresu (1 → „Sty”). */
export function formatMonthShort(month: number): string {
  return MONTH_LABELS[month - 1] ?? ''
}

/** Pełna nazwa miesiąca dla czytników ekranu (1 → „styczeń”). */
export function formatMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? ''
}
