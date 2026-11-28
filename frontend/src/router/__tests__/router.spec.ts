import { describe, expect, it, vi } from 'vitest'

import { navFeatureFlags } from '@/config/features'

import AppLayout from '@/layouts/AppLayout.vue'
import { routes } from '@/router'
import { createTestRouter } from '@/test/router'

describe('router', () => {
  it('przekierowuje / na pulpit', async () => {
    const router = await createTestRouter('/')
    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('renderuje /login poza AppLayout', async () => {
    const router = await createTestRouter('/login')
    const { matched, name } = router.currentRoute.value
    expect(name).toBe('login')
    expect(matched.some((record) => record.components?.default === AppLayout)).toBe(false)
  })

  it('trasy aplikacji są w AppLayout i mają polskie tytuły', async () => {
    const router = await createTestRouter()
    const expected = {
      '/dashboard': 'Pulpit',
      '/documents': 'Dokumenty',
      '/budgets': 'Budżety',
      '/budgets/FIN-2026-01': 'Szczegóły budżetu',
      '/my-center': 'Moje centrum',
      '/processes': 'Procesy',
      '/erp-portal': 'Portal ERP',
      '/settings': 'Ustawienia',
    }
    for (const [path, title] of Object.entries(expected)) {
      const resolved = router.resolve(path)
      expect(resolved.name).not.toBe('not-found')
      expect(resolved.meta.title).toBe(title)
      expect(resolved.matched[0]?.components?.default).toBe(AppLayout)
    }
  })

  it('nieznany adres trafia do not-found', async () => {
    const router = await createTestRouter('/nie-ma-takiej-strony')
    expect(router.currentRoute.value.name).toBe('not-found')
  })

  it('przy włączonej fladze budgets rejestruje listę i szczegóły budżetu', async () => {
    expect(navFeatureFlags.budgets).toBe(true)
    const router = await createTestRouter('/budgets')
    expect(router.currentRoute.value.name).toBe('budgets')

    await router.push('/budgets/FIN-2026-01')
    expect(router.currentRoute.value.name).toBe('budget-details')
    expect(router.currentRoute.value.params.code).toBe('FIN-2026-01')
  })

  it('dzieci AppLayout mają meta.requiresAuth, a /login nie', async () => {
    const router = await createTestRouter()
    const layout = routes.find((record) => record.component === AppLayout)
    const childPaths = (layout?.children ?? [])
      .filter((child) => child.name && child.name !== 'not-found')
      .map((child) => `/${child.path}`)

    expect(childPaths.length).toBeGreaterThan(0)
    for (const path of [...childPaths, '/nie-ma-takiej-strony']) {
      const resolved = router.resolve(path)
      expect(resolved.matched[0]?.components?.default, path).toBe(AppLayout)
      expect(resolved.meta.requiresAuth, path).toBe(true)
    }
    expect(router.resolve('/login').meta.requiresAuth).toBeUndefined()
  })
})

describe('router przy wyłączonej fladze budgets', () => {
  it('trasy budżetów trafiają do not-found', async () => {
    vi.resetModules()
    vi.doMock('@/config/features', () => ({ navFeatureFlags: { budgets: false } }))
    try {
      const { routes: gatedRoutes } = await import('@/router')
      const { createMemoryHistory, createRouter } = await import('vue-router')
      const router = createRouter({ history: createMemoryHistory(), routes: gatedRoutes })

      for (const path of ['/budgets', '/budgets/FIN-2026-01']) {
        await router.push(path)
        expect(router.currentRoute.value.name, path).toBe('not-found')
      }
      expect(router.hasRoute('budgets')).toBe(false)
      expect(router.hasRoute('budget-details')).toBe(false)
    } finally {
      vi.doUnmock('@/config/features')
      vi.resetModules()
    }
  })
})

describe('createAppHistory', () => {
  it('poza trybem demo używa adresów bez #', async () => {
    const { createAppHistory } = await import('@/router')
    expect(createAppHistory().createHref('/documents')).not.toContain('#')
  })

  it('w trybie demo używa adresów z # (statyczny hosting bez fallbacku)', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true')
    const { createAppHistory } = await import('@/router')
    expect(createAppHistory().createHref('/documents')).toBe('#/documents')
  })
})
