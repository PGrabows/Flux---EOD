/** Twarda spacja – separator tysięcy i odstęp przed walutą (nie łamie się w wierszu). */
export const NBSP = '\u00a0'

export interface FormatPlAmountOptions {
  /** `true` – zawsze dwa miejsca po przecinku („1 000,00”); domyślnie bez zbędnych zer. */
  fixedFraction?: boolean
  /** Znak dla kwot ujemnych – domyślnie łącznik `-`; feature może wybrać minus U+2212. */
  minusSign?: string
}

/**
 * Kwota po polsku: twarda spacja co 3 cyfry, przecinek dziesiętny, maks. 2 miejsca po
 * przecinku – „1 000”, „2 150,5” albo (z `fixedFraction`) „2 150,50”. Celowo bez Intl
 * (stabilny wynik niezależny od środowiska).
 */
export function formatPlAmount(amount: number, options: FormatPlAmountOptions = {}): string {
  const { fixedFraction = false, minusSign = '-' } = options
  const rounded = Math.round(amount * 100) / 100
  const negative = rounded < 0
  let digits = Math.abs(rounded).toFixed(2)
  if (!fixedFraction) digits = digits.replace(/0+$/, '').replace(/\.$/, '')
  const [integer = '0', fraction] = digits.split('.')
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return `${negative ? minusSign : ''}${grouped}${fraction ? `,${fraction}` : ''}`
}

/**
 * Polska forma liczebnika: `[one, few, many]`, np. `['dokument', 'dokumenty', 'dokumentów']`
 * → 1 „dokument”, 2–4 / 22–24 „dokumenty”, 0, 5–21, 12–14 „dokumentów”.
 */
export function pluralizePl(
  count: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  const [one, few, many] = forms
  if (count === 1) return one
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  const isFew = lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)
  return isFew ? few : many
}

/** „Wyświetlanie 1–5 z 126” (półpauza U+2013). */
export function formatResultsRange(start: number, end: number, total: number): string {
  return `Wyświetlanie ${start}–${end} z ${total}`
}
