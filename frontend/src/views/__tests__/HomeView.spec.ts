import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import HomeView from '@/views/HomeView.vue'

describe('HomeView', () => {
  it('renderuje nagłówek aplikacji', () => {
    const wrapper = mount(HomeView, { global: { stubs: { ApiStatus: true } } })
    expect(wrapper.get('h1').text()).toBe('Fluxis EOD')
  })
})
