/**
 * Tryb demonstracyjny: statyczny build frontendu bez backendu (podgląd na serwerze dev).
 *
 * Włączany wyłącznie przez `npm run build:demo` (plik `.env.demo`). Build produkcyjny
 * i obraz Dockera go nie ustawiają. Funkcja zamiast stałej, żeby testy mogły
 * podmieniać zmienną przez `vi.stubEnv`.
 *
 * TODO(Faza 2): usunąć razem z bypassem logowania po wdrożeniu backend auth.
 */
export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true'
}
