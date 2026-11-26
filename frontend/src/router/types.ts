import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Tytuł widoku (po polsku) – używany m.in. w niewidocznym nagłówku `h1`. */
    title?: string
    /**
     * Znacznik tras wymagających zalogowania. Na razie NIE jest egzekwowany
     * (brak sesji i guarda) – guard bez prawdziwej sesji udawałby zabezpieczenie.
     * Autoryzacja i tak zawsze odbywa się po stronie serwera.
     */
    requiresAuth?: boolean
  }
}

/** Nazwy tras aplikacji – używane w nawigacji zamiast surowych ścieżek. */
export type AppRouteName =
  | 'login'
  | 'dashboard'
  | 'documents'
  | 'budgets'
  | 'my-center'
  | 'processes'
  | 'erp-portal'
  | 'settings'
  | 'not-found'
