import type { Component } from 'vue'
import { Building2, FileText, Inbox, LayoutDashboard, Wallet, Workflow } from '@lucide/vue'

import type { NavFeatureFlags } from '@/config/features'
import type { Permission } from '@/config/permissions'
import type { AppRouteName } from '@/router/types'

/**
 * Klucze liczników wyświetlanych jako badge przy pozycjach nawigacji.
 *
 * Konwencja: klucze danych/DTO w camelCase (`myCenter`), natomiast `id` pozycji
 * oraz nazwy i ścieżki tras w kebab-case (`my-center`).
 */
export type SidebarCounterKey = 'dashboard' | 'documents' | 'myCenter' | 'processes'

export interface SidebarNavItem {
  id: string
  label: string
  to: { name: AppRouteName }
  icon: Component
  /** Klucz licznika (badge); brak – pozycja bez badge. */
  counterKey?: SidebarCounterKey
  /** Flaga funkcji, od której zależy widoczność pozycji. */
  feature?: keyof NavFeatureFlags
  /**
   * Uprawnienie wymagane do pokazania pozycji (kod z RBAC Matrix). Tylko UX –
   * autoryzacja zawsze odbywa się na serwerze.
   */
  requiredPermission?: Permission
}

/** Kontekst widoczności nawigacji: flagi funkcji i uprawnienia bieżącego użytkownika. */
export interface NavVisibilityContext {
  flags: Readonly<NavFeatureFlags>
  permissions: readonly string[]
}

export interface SidebarNavSection {
  id: string
  /** Nagłówek sekcji (widoczny tylko w rozwiniętym panelu). */
  label?: string
  items: readonly SidebarNavItem[]
}

export const sidebarNavSections: readonly SidebarNavSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'dashboard',
        label: 'Pulpit',
        to: { name: 'dashboard' },
        icon: LayoutDashboard,
        counterKey: 'dashboard',
      },
      {
        id: 'documents',
        label: 'Dokumenty',
        to: { name: 'documents' },
        icon: FileText,
        counterKey: 'documents',
      },
      {
        id: 'budgets',
        label: 'Budżety',
        to: { name: 'budgets' },
        icon: Wallet,
        feature: 'budgets',
      },
      {
        id: 'my-center',
        label: 'Moje centrum',
        to: { name: 'my-center' },
        icon: Inbox,
        counterKey: 'myCenter',
      },
      {
        id: 'processes',
        label: 'Procesy',
        to: { name: 'processes' },
        icon: Workflow,
        counterKey: 'processes',
      },
    ],
  },
  {
    id: 'erp',
    label: 'Portal ERP',
    items: [
      { id: 'erp-portal', label: 'Portal ERP', to: { name: 'erp-portal' }, icon: Building2 },
      // TODO: pozycja „Administracja” – dojdzie tutaj, pod Portalem ERP, z `requiredPermission`
      // (np. 'users:view' / 'roles:manage' wg RBAC Matrix), gdy backend udostępni uprawnienia
      // użytkownika (`GET /api/auth/me`) i powstanie trasa administracji.
    ],
  },
]

/**
 * Filtruje pozycje wg flag funkcji i uprawnień użytkownika.
 *
 * Ukrywanie pozycji to wyłącznie UX – nie zabezpiecza dostępu. Autoryzacja każdej
 * operacji jest sprawdzana po stronie serwera.
 */
export function getVisibleNavItems(
  items: readonly SidebarNavItem[],
  ctx: NavVisibilityContext,
): SidebarNavItem[] {
  return items.filter(
    (item) =>
      (!item.feature || ctx.flags[item.feature]) &&
      (!item.requiredPermission || ctx.permissions.includes(item.requiredPermission)),
  )
}

/** Sekcje z widocznymi pozycjami; puste sekcje są pomijane. */
export function getVisibleNavSections(
  ctx: NavVisibilityContext,
  sections: readonly SidebarNavSection[] = sidebarNavSections,
): SidebarNavSection[] {
  return sections
    .map((section) => ({ ...section, items: getVisibleNavItems(section.items, ctx) }))
    .filter((section) => section.items.length > 0)
}
