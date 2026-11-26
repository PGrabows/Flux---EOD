import { createMemoryHistory, createRouter } from 'vue-router'

import { routes } from '@/router'

/** Router aplikacji na historii w pamięci – izolowany dla każdego testu. */
export async function createTestRouter(initialPath = '/dashboard') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(initialPath)
  await router.isReady()
  return router
}
