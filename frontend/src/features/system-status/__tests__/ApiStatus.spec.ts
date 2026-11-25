import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { describe, expect, it, vi } from 'vitest'

import { http } from '@/api/http'
import ApiStatus from '@/features/system-status/components/ApiStatus.vue'

function mountWithQuery() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return mount(ApiStatus, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
}

describe('ApiStatus', () => {
  it('pokazuje działające API', async () => {
    vi.spyOn(http, 'get').mockResolvedValueOnce({ data: { status: 'ok' } })
    const wrapper = mountWithQuery()
    await flushPromises()
    expect(wrapper.get('[data-testid="api-status"]').text()).toBe('API działa')
  })

  it('pokazuje błąd, gdy API nie odpowiada', async () => {
    vi.spyOn(http, 'get').mockRejectedValueOnce(new Error('Network Error'))
    const wrapper = mountWithQuery()
    await flushPromises()
    expect(wrapper.get('[data-testid="api-status"]').text()).toBe('API niedostępne')
  })
})
