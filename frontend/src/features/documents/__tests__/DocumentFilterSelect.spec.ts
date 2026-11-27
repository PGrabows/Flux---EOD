import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DocumentFilterSelect from '../components/DocumentFilterSelect.vue'

const options = [
  { value: 'invoice', label: 'Faktura' },
  { value: 'contract', label: 'Umowa' },
]

describe('DocumentFilterSelect', () => {
  it('renderuje opcję pustą z placeholderem i emituje wybraną wartość', async () => {
    const wrapper = mount(DocumentFilterSelect, {
      props: { id: 'type', modelValue: '', options, placeholder: 'Wszystkie rodzaje' },
      attrs: { 'aria-label': 'Rodzaj' },
    })

    const select = wrapper.get('select')
    expect(select.attributes('id')).toBe('type')
    expect(select.attributes('aria-label')).toBe('Rodzaj')
    expect(select.findAll('option').map((option) => option.text())).toEqual([
      'Wszystkie rodzaje',
      'Faktura',
      'Umowa',
    ])
    expect(select.classes()).toContain('text-eod-muted-foreground')

    await select.setValue('contract')
    expect(wrapper.emitted('update:modelValue')).toEqual([['contract']])
  })

  it('bez placeholdera nie ma pustej opcji; wybrana wartość ma mocniejszy styl', () => {
    const wrapper = mount(DocumentFilterSelect, {
      props: { modelValue: 'invoice', options, disabled: true, class: 'w-[92px]' },
    })

    const select = wrapper.get('select')
    expect(select.findAll('option')).toHaveLength(2)
    expect((select.element as HTMLSelectElement).value).toBe('invoice')
    expect(select.classes()).toContain('font-medium')
    expect(select.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('w-[92px]')
  })
})
