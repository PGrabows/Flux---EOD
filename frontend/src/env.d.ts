/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /**
   * Dev (`npm run dev`) lub build demo: `'true'` pomija żądanie logowania do backendu.
   * W zwykłym buildzie produkcyjnym ignorowane. TODO(Faza 2): usunąć po wdrożeniu backend auth.
   */
  readonly VITE_AUTH_BYPASS?: string
  /**
   * `'true'` tylko w buildzie demo (`npm run build:demo`, plik `.env.demo`): hash router,
   * etykieta „Wersja demonstracyjna” i dopuszczenie bypassu logowania bez backendu.
   */
  readonly VITE_DEMO_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
