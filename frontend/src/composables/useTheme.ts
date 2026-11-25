import { useColorMode } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'auto'

/** Motyw aplikacji: jasny, ciemny lub zgodny z systemem (`auto`). */
export function useTheme() {
  return useColorMode({ storageKey: 'fluxis-theme', initialValue: 'auto' })
}
