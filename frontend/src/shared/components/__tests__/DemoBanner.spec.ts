import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import DemoBanner from '@/shared/components/DemoBanner.vue'

describe('DemoBanner', () => {
  it('jest ukryty poza trybem demo', () => {
    const wrapper = mount(DemoBanner)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  it('w trybie demo informuje o braku backendu', () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true')
    const wrapper = mount(DemoBanner)
    expect(wrapper.get('[role="status"]').text()).toContain('Wersja demonstracyjna')
  })
})
