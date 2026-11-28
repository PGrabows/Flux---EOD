import { readonly, ref } from 'vue'

import type { CurrentUser } from '../types'

/**
 * Dane zalogowanego użytkownika.
 *
 * TODO: zastąpić mock zapytaniem TanStack Query do `GET /api/auth/me`
 * po wdrożeniu sesji w backendzie.
 */
export function useCurrentUser() {
  // Mock: administrator systemu (rola SysAdmin wg RBAC Matrix) – uprawnienia administracyjne.
  const user = ref<CurrentUser>({
    id: 'mock-user',
    fullName: 'Jan Kowalski',
    roleLabel: 'Administrator',
    roles: ['SysAdmin'],
    permissions: [
      'users:view',
      'users:create',
      'users:edit',
      'users:delete',
      'roles:assign',
      'roles:manage',
      'permissions:manage',
      'profile:edit',
      'integrations:view',
      'integrations:configure',
      'integrations:sync',
      'audit:view',
      'audit:export',
      'dashboard:view',
      'settings:manage',
    ],
  })

  return { user: readonly(user) }
}
