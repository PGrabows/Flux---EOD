import { describe, expect, it } from 'vitest'

import { navFeatureFlags } from '@/config/features'
import {
  getVisibleNavItems,
  getVisibleNavSections,
  type NavVisibilityContext,
  type SidebarNavSection,
  sidebarNavSections,
} from '@/shared/components/app-sidebar/navigation'
import { createTestRouter } from '@/test/router'

const allItems = sidebarNavSections.flatMap((section) => section.items)
const defaultCtx: NavVisibilityContext = { flags: navFeatureFlags, permissions: [] }

describe('navigation', () => {
  it('domyślnie pokazuje „Budżety” (flaga budgets: true)', () => {
    expect(navFeatureFlags.budgets).toBe(true)
    const labels = getVisibleNavSections(defaultCtx).flatMap((s) => s.items.map((i) => i.label))
    expect(labels).toContain('Budżety')
  })

  it('ukrywa „Budżety” po wyłączeniu flagi', () => {
    const labels = getVisibleNavItems(sidebarNavSections[0]!.items, {
      flags: { budgets: false },
      permissions: [],
    }).map((i) => i.label)
    expect(labels).toEqual(['Pulpit', 'Dokumenty', 'Moje centrum', 'Procesy'])
  })

  it('pokazuje „Budżety” po włączeniu flagi, na pozycji z Figmy', () => {
    const labels = getVisibleNavItems(sidebarNavSections[0]!.items, {
      flags: { budgets: true },
      permissions: [],
    }).map((i) => i.label)
    expect(labels).toEqual(['Pulpit', 'Dokumenty', 'Budżety', 'Moje centrum', 'Procesy'])
  })

  it('zachowuje kolejność sekcji i pozycji', () => {
    const sections = getVisibleNavSections(defaultCtx)
    expect(sections.map((s) => s.label)).toEqual([undefined, 'Portal ERP'])
    expect(sections.map((s) => s.items.map((i) => i.label))).toEqual([
      ['Pulpit', 'Dokumenty', 'Budżety', 'Moje centrum', 'Procesy'],
      ['Portal ERP'],
    ])
  })

  it('każda widoczna pozycja wskazuje istniejącą trasę', async () => {
    const router = await createTestRouter()
    for (const section of getVisibleNavSections(defaultCtx)) {
      for (const item of section.items) {
        expect(router.hasRoute(item.to.name), item.to.name).toBe(true)
      }
    }
  })

  it('trasy pozycji ukrytych flagą są rejestrowane zgodnie z flagą', async () => {
    const router = await createTestRouter()
    for (const item of allItems.filter((i) => i.feature)) {
      expect(router.hasRoute(item.to.name)).toBe(navFeatureFlags[item.feature!])
    }
  })

  it('identyfikatory pozycji są unikalne', () => {
    const ids = allItems.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe('filtrowanie po uprawnieniach (tylko UX)', () => {
    const icon = sidebarNavSections[0]!.items[0]!.icon
    const sections: SidebarNavSection[] = [
      {
        id: 'erp',
        label: 'Portal ERP',
        items: [
          { id: 'erp-portal', label: 'Portal ERP', to: { name: 'erp-portal' }, icon },
          {
            id: 'admin',
            label: 'Administracja',
            to: { name: 'settings' },
            icon,
            requiredPermission: 'users:view',
          },
        ],
      },
      {
        id: 'admin-only',
        items: [
          {
            id: 'audit',
            label: 'Audyt',
            to: { name: 'settings' },
            icon,
            requiredPermission: 'audit:view',
          },
        ],
      },
    ]
    const labelsFor = (permissions: readonly string[]) =>
      getVisibleNavSections({ flags: navFeatureFlags, permissions }, sections).map((s) =>
        s.items.map((i) => i.label),
      )

    it('ukrywa pozycje z requiredPermission bez uprawnienia i pomija puste sekcje', () => {
      expect(labelsFor([])).toEqual([['Portal ERP']])
      expect(labelsFor(['documents:view'])).toEqual([['Portal ERP']])
    })

    it('pokazuje pozycję, gdy uprawnienie jest w kontekście', () => {
      expect(labelsFor(['users:view'])).toEqual([['Portal ERP', 'Administracja']])
      expect(labelsFor(['users:view', 'audit:view'])).toEqual([
        ['Portal ERP', 'Administracja'],
        ['Audyt'],
      ])
    })

    it('wymaga jednocześnie włączonej flagi i uprawnienia', () => {
      const gated: SidebarNavSection[] = [
        {
          id: 'x',
          items: [
            {
              id: 'budgets',
              label: 'Budżety',
              to: { name: 'budgets' },
              icon,
              feature: 'budgets',
              requiredPermission: 'documents:view',
            },
          ],
        },
      ]
      const visible = (budgets: boolean, permissions: string[]) =>
        getVisibleNavSections({ flags: { budgets }, permissions }, gated).length > 0

      expect(visible(true, ['documents:view'])).toBe(true)
      expect(visible(false, ['documents:view'])).toBe(false)
      expect(visible(true, [])).toBe(false)
    })
  })
})
