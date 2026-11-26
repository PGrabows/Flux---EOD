export { cn } from 'cn'

/** Inicjały z imienia i nazwiska, np. „Jan Kowalski” → „JK”. */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''

  const first = parts[0]!
  const last = parts.length > 1 ? parts[parts.length - 1]! : ''
  const initial = (word: string) => Array.from(word)[0] ?? ''

  return (initial(first) + initial(last)).toLocaleUpperCase('pl-PL')
}
