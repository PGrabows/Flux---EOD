import { readonly, ref } from 'vue'

import type { SidebarCounterKey } from './navigation'

export type SidebarCounters = Record<SidebarCounterKey, number>

/**
 * Liczniki przy pozycjach nawigacji.
 *
 * TODO: zastąpić mock zapytaniem TanStack Query (`useQuery`) do endpointu
 * z licznikami, gdy backend go udostępni.
 */
export function useSidebarCounters() {
  const counters = ref<SidebarCounters>({
    dashboard: 12,
    documents: 12,
    myCenter: 8,
    processes: 6,
  })

  return { counters: readonly(counters) }
}
