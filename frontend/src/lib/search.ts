/** Locale porównań i zmiany wielkości liter przy wyszukiwaniu/sortowaniu tekstów. */
export const SEARCH_LOCALE = 'pl-PL'

/** Myślniki i łączniki Unicode U+2010–U+2015 (m.in. półpauza i pauza). */
const DASHES = /[‐-―]/g
const DIACRITICS = /\p{Diacritic}/gu

/**
 * Normalizuje tekst do wyszukiwania: bez znaków diakrytycznych (także „ł”), z ujednoliconymi
 * myślnikami, małymi literami i bez skrajnych spacji – „Usług – Nexora” → „uslug - nexora”.
 */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .replace(DASHES, '-')
    .toLocaleLowerCase(SEARCH_LOCALE)
    .trim()
}
