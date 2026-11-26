const FALLBACK = '/'

// Znaki kontrolne C0, DEL i C1 (np. tab/nowa linia, które przeglądarki wycinają z URL).
const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f]/

function isSafePath(path: string): boolean {
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('\\') &&
    !CONTROL_CHARS.test(path)
  )
}

/**
 * Zwraca bezpieczną ścieżkę wewnętrzną z parametru `?redirect=` albo `/`.
 *
 * Dopuszcza tylko string zaczynający się od pojedynczego `/`, bez `//` na początku,
 * bez `\` i bez znaków kontrolnych – także po zdekodowaniu procentowym (np. `/%5Cevil.com`).
 * Chroni przed otwartym przekierowaniem na obce domeny.
 */
export function getSafeRedirect(raw: unknown): string {
  if (typeof raw !== 'string' || !isSafePath(raw)) return FALLBACK

  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return FALLBACK
  }
  return isSafePath(decoded) ? raw : FALLBACK
}
