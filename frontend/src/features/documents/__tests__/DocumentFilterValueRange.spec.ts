import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DocumentFilterValueRange from '../components/DocumentFilterValueRange.vue'

const input = (wrapper: ReturnType<typeof mount>, label: string) =>
  wrapper.get(`input[aria-label="${label}"]`).element as HTMLInputElement

describe('DocumentFilterValueRange', () => {
  it('emituje walutę i surowe wartości pól', async () => {
    const wrapper = mount(DocumentFilterValueRange, {
      props: { currency: 'PLN', min: null, max: 5000 },
    })

    expect(wrapper.get('legend').text()).toBe('Wartość dokumentu')
    expect(input(wrapper, 'Wartość do').value).toBe('5000')
    expect(
      wrapper
        .get('select[aria-label="Waluta"]')
        .findAll('option')
        .map((option) => option.text()),
    ).toEqual(['PLN', 'EUR', 'USD'])

    await wrapper.get('select[aria-label="Waluta"]').setValue('EUR')
    await wrapper.get('input[aria-label="Wartość od"]').setValue('1000')
    expect(wrapper.emitted('update:currency')).toEqual([['EUR']])
    expect(wrapper.emitted('update:min')).toEqual([['1000']])
  })

  it('niepoprawny wpis zostaje w polu, a zewnętrzne czyszczenie go usuwa', async () => {
    const wrapper = mount(DocumentFilterValueRange, {
      props: { currency: 'PLN', min: null, max: null },
    })

    await wrapper.get('input[aria-label="Wartość od"]').setValue('2000000000000')
    await wrapper.setProps({ min: 2e12, error: 'Kwota jest zbyt duża' })
    expect(input(wrapper, 'Wartość od').value).toBe('2000000000000')
    expect(wrapper.get('[role="alert"]').text()).toBe('Kwota jest zbyt duża')

    // Wartość nieskończona z rodzica nie nadpisuje tego, co widzi użytkownik.
    await wrapper.setProps({ min: Number.POSITIVE_INFINITY, error: 'Podaj poprawną kwotę' })
    expect(input(wrapper, 'Wartość od').value).toBe('2000000000000')
    expect(wrapper.get('input[aria-label="Wartość od"]').attributes('aria-invalid')).toBe('true')

    await wrapper.setProps({ min: null, error: undefined })
    expect(input(wrapper, 'Wartość od').value).toBe('')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)

    await wrapper.setProps({ max: 250 })
    expect(input(wrapper, 'Wartość do').value).toBe('250')
  })
})
