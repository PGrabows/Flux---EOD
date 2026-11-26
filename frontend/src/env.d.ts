/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /**
   * Tylko dev (`npm run dev`): `'true'` pomija żądanie logowania do backendu.
   * W buildzie produkcyjnym ignorowane. TODO(Faza 2): usunąć po wdrożeniu backend auth.
   */
  readonly VITE_AUTH_BYPASS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
