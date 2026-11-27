import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import DocumentListToolbar from '../components/DocumentListToolbar.vue'

type ToolbarWrapper = VueWrapper<InstanceType<typeof DocumentListToolbar>>

let wrapper: ToolbarWrapper | undefined

function mountToolbar(props: Partial<InstanceType<typeof DocumentListToolbar>['$props']> = {}) {
  wrapper = mount(DocumentListToolbar, {
    props: {
      titleId: 'documents-title',
      total: 23,
      statuses: [],
      types: [],
      sortDirection: 'desc',
      query: '',
      ...props,
    },
    // Menu renderują się w portalu – potrzebny prawdziwy dokument.
    attachTo: document.body,
  }) as ToolbarWrapper
  return wrapper
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

async function openMenu(w: ToolbarWrapper, label: string) {
  const trigger = w.findAll('button').find((button) => button.text().includes(label))!
  await trigger.trigger('keydown', { key: 'Enter' })
  await flushPromises()
  return trigger
}

const menuItems = (role: string) =>
  Array.from(document.body.querySelectorAll<HTMLElement>(`[role="${role}"]`))

describe('DocumentListToolbar', () => {
  it('pokazuje tytuł z przekazanym id i licznik z poprawną odmianą', () => {
    const w = mountToolbar({ total: 1 })

    expect(w.get('h2').attributes('id')).toBe('documents-title')
    const counter = w.get('[data-testid="documents-count"]')
    expect(counter.text()).toBe('1 dokument')
    expect(counter.attributes('aria-live')).toBe('polite')
  })

  it('wpisanie frazy emituje aktualizację query', async () => {
    const w = mountToolbar()

    await w.get('input[type="search"]').setValue('umowa')
    expect(w.emitted('update:query')).toEqual([['umowa']])
  })

  it('zaznaczenie statusu w „Filtry” emituje (status, true) i nie zamyka menu', async () => {
    const w = mountToolbar()
    const trigger = await openMenu(w, 'Filtry')

    const rejected = menuItems('menuitemcheckbox').find(
      (item) => item.textContent?.trim() === 'Odrzucony',
    )!
    rejected.click()
    await flushPromises()

    expect(w.emitted('update:status')).toEqual([['rejected', true]])
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(menuItems('menuitemcheckbox').length).toBeGreaterThan(0)
  })

  it('rodzaje w „Filtry” mają polskie etykiety i emitują slug', async () => {
    const w = mountToolbar({ types: ['invoice'] })
    await openMenu(w, 'Filtry')

    const invoice = menuItems('menuitemcheckbox').find(
      (item) => item.textContent?.trim() === 'Faktura',
    )!
    expect(invoice.getAttribute('aria-checked')).toBe('true')
    invoice.click()
    await flushPromises()

    expect(w.emitted('update:type')).toEqual([['invoice', false]])
  })

  it('wybór „Od najstarszych” emituje kierunek asc', async () => {
    const w = mountToolbar()
    await openMenu(w, 'Sortuj')

    const oldest = menuItems('menuitemradio').find(
      (item) => item.textContent?.trim() === 'Od najstarszych',
    )!
    oldest.click()
    await flushPromises()

    expect(w.emitted('update:sortDirection')).toEqual([['asc']])
  })
})
