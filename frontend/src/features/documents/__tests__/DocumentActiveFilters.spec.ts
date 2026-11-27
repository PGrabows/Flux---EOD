import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DocumentActiveFilters from '../components/DocumentActiveFilters.vue'
import type { ActiveFilterChip } from '../types'

const filters: ActiveFilterChip[] = [
  { kind: 'status', value: 'in-approval', label: 'Status: W akceptacji' },
  { kind: 'type', value: 'invoice', label: 'Rodzaj: Faktura' },
]

describe('DocumentActiveFilters', () => {
  it('renderuje chipy i emituje usunięcie wybranego filtra', async () => {
    const wrapper = mount(DocumentActiveFilters, { props: { filters } })

    const chips = wrapper.findAll('[data-testid="active-filter-chip"]')
    expect(chips.map((chip) => chip.text())).toEqual(['Status: W akceptacji', 'Rodzaj: Faktura'])

    await wrapper.get('button[aria-label="Usuń filtr Rodzaj: Faktura"]').trigger('click')
    expect(wrapper.emitted('remove')).toEqual([[filters[1]]])
  })

  it('emituje wyczyszczenie wszystkich filtrów', async () => {
    const wrapper = mount(DocumentActiveFilters, { props: { filters } })

    const clear = wrapper.findAll('button').find((button) => button.text() === 'Wyczyść filtry')
    await clear!.trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })
})
