import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PlaceholderView from '@/views/PlaceholderView.vue'
import { createTestRouter } from '@/test/router'

describe('PlaceholderView', () => {
  it.each([
    ['/dashboard', 'Pulpit'],
    ['/my-center', 'Moje centrum'],
    ['/processes', 'Procesy'],
    ['/erp-portal', 'Portal ERP'],
    ['/settings', 'Ustawienia'],
  ])('%s renderuje niewidoczny nagłówek „%s”', async (path, title) => {
    const router = await createTestRouter(path)
    const wrapper = mount(PlaceholderView, { global: { plugins: [router] } })
    await flushPromises()

    const heading = wrapper.get('h1')
    expect(heading.classes()).toContain('sr-only')
    expect(heading.text()).toBe(title)
    wrapper.unmount()
  })
})
