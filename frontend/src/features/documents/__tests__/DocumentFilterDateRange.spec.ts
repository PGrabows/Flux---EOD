import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DocumentFilterDateRange from '../components/DocumentFilterDateRange.vue'

describe('DocumentFilterDateRange', () => {
  it('emituje surowe wartości obu pól i wiąże wzajemne min/max', async () => {
    const wrapper = mount(DocumentFilterDateRange, {
      props: { from: '2026-10-01', to: '2026-10-31' },
    })

    const from = wrapper.get('input[aria-label="Data rejestracji od"]')
    const to = wrapper.get('input[aria-label="Data rejestracji do"]')
    expect(wrapper.get('legend').text()).toBe('Data rejestracji')
    expect((from.element as HTMLInputElement).value).toBe('2026-10-01')
    expect(from.attributes('max')).toBe('2026-10-31')
    expect(from.attributes('min')).toBeUndefined()
    expect(to.attributes('min')).toBe('2026-10-01')
    expect(to.attributes('max')).toBe('9999-12-31')

    await from.setValue('2026-09-15')
    await to.setValue('')
    expect(wrapper.emitted('update:from')).toEqual([['2026-09-15']])
    expect(wrapper.emitted('update:to')).toEqual([['']])
  })

  it('niepoprawna data nie trafia do min/max, a błąd jest powiązany z polami', () => {
    const wrapper = mount(DocumentFilterDateRange, {
      props: { from: '2026-02-30x', to: null, error: 'Podaj poprawną datę (RRRR-MM-DD)' },
    })

    const from = wrapper.get('input[aria-label="Data rejestracji od"]')
    const to = wrapper.get('input[aria-label="Data rejestracji do"]')
    expect(from.attributes('max')).toBe('9999-12-31')
    expect(to.attributes('min')).toBeUndefined()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toBe('Podaj poprawną datę (RRRR-MM-DD)')
    expect(from.attributes('aria-invalid')).toBe('true')
    expect(to.attributes('aria-describedby')).toBe(alert.attributes('id'))
  })

  it('bez błędu nie ma komunikatu ani aria-invalid', () => {
    const wrapper = mount(DocumentFilterDateRange, { props: { from: null, to: null } })

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('input').attributes('aria-invalid')).toBeUndefined()
  })
})
