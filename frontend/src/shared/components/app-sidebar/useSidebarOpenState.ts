import { useLocalStorage } from '@vueuse/core'

/** Klucz localStorage ze stanem panelu bocznego (rozwinięty/zwinięty). */
export const SIDEBAR_OPEN_STORAGE_KEY = 'fluxis-sidebar-open'

/**
 * Zapamiętany stan panelu – domyślnie rozwinięty.
 *
 * Źródłem prawdy jest localStorage (stan przekazywany do `SidebarProvider` przez
 * `v-model:open`). Ciasteczko `sidebar_state` zapisuje sam prymityw – jest ignorowane.
 */
export function useSidebarOpenState() {
  return useLocalStorage(SIDEBAR_OPEN_STORAGE_KEY, true)
}
