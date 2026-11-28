import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { http } from '@/api/http'
import LoginView from '@/views/LoginView.vue'
import { createTestRouter } from '@/test/router'

// Lekki zamiennik widoku listy dokumentów – ten test nie sprawdza jego treści,
// a prawdziwy widok wymaga TanStack Query i spowalnia leniwe ładowanie trasy.
vi.mock('@/views/DocumentsView.vue', async () => {
  const { defineComponent, h } = await import('vue')
  return {
    default: defineComponent({ name: 'DocumentsViewStub', render: () => h('h1', 'Dokumenty') }),
  }
})

vi.mock('vue-sonner', () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}))

let wrapper: ReturnType<typeof mount> | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.restoreAllMocks()
})

async function submitWithRedirect(redirect?: string) {
  vi.spyOn(http, 'post').mockResolvedValue({ data: {} })
  const router = await createTestRouter('/dashboard')
  await router.push({ path: '/login', query: redirect === undefined ? {} : { redirect } })

  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  wrapper = mount(LoginView, {
    global: { plugins: [router, [VueQueryPlugin, { queryClient }]] },
  })
  await wrapper.get('#login-username').setValue('akowalska')
  await wrapper.get('#login-password').setValue('tajne-haslo')
  await wrapper.get('form').trigger('submit')

  await vi.waitFor(() => expect(router.currentRoute.value.name).not.toBe('login'))
  await flushPromises()
  return router
}

describe('LoginView', () => {
  it('po zalogowaniu przechodzi na poprawny wewnętrzny redirect', async () => {
    const router = await submitWithRedirect('/documents')
    expect(router.currentRoute.value.fullPath).toBe('/documents')
  })

  it.each([
    ['brak redirectu', undefined],
    ['//evil.com', '//evil.com'],
    ['https://evil.com', 'https://evil.com'],
    ['javascript:alert(1)', 'javascript:alert(1)'],
    ['/\\evil.com', '/\\evil.com'],
    ['/%5Cevil.com', '/%5Cevil.com'],
  ])('dla %s przechodzi na pulpit', async (_label, redirect) => {
    const router = await submitWithRedirect(redirect)
    expect(router.currentRoute.value.fullPath).toBe('/dashboard')
  })
})
