import { afterEach, beforeEach, vi } from 'vitest'

// jsdom nie implementuje matchMedia – używają go useMediaQuery (sidebar) i motyw.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })),
  })
}

// Komponenty Reka UI (np. Tooltip) korzystają z ResizeObserver.
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
}

// Izolacja od lokalnego `.env*` (np. VITE_AUTH_BYPASS=true w .env.development.local).
// Testy potrzebujące innej wartości nadpisują ją własnym `vi.stubEnv` (uruchamianym później).
// TODO(Faza 2): usunąć razem z bypassem po wdrożeniu backend auth.
beforeEach(() => {
  vi.stubEnv('VITE_AUTH_BYPASS', 'false')
})

afterEach(() => {
  vi.unstubAllEnvs()
  window.localStorage.clear()
  // Prymityw SidebarProvider zapisuje też własne ciasteczko stanu.
  document.cookie = 'sidebar_state=; path=/; max-age=0'
})
