import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'vue-sonner'

import { documentListSchema } from '@/features/documents/schemas'
import DocumentsView from '@/views/DocumentsView.vue'

vi.mock('vue-sonner', () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}))

let wrapper: ReturnType<typeof mount> | undefined

let queryClient: QueryClient

function mountView() {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  wrapper = mount(DocumentsView, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return wrapper
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe('DocumentsView', () => {
  it('pokazuje szkielet podczas wczytywania, a potem listę dokumentów', async () => {
    const w = mountView()

    expect(w.find('[data-testid="documents-loading"]').attributes('aria-busy')).toBe('true')
    await flushPromises()

    expect(w.get('h1').text()).toBe('Dokumenty')
    expect(w.find('[data-testid="documents-loading"]').exists()).toBe(false)
    expect(w.get('[data-testid="documents-count"]').text()).toBe('23 dokumenty')
    expect(w.findAll('[data-testid="document-row"]')).toHaveLength(5)
  })

  it('„Dodaj dokument” i „Szczegóły” pokazują informację o niedostępnej akcji', async () => {
    const w = mountView()
    await flushPromises()

    const add = w.findAll('button').find((button) => button.text() === 'Dodaj dokument')
    await add!.trigger('click')
    expect(toast.info).toHaveBeenLastCalledWith('Dodawanie dokumentów będzie dostępne wkrótce.')
    await w.get('[data-testid="document-row"] button').trigger('click')

    expect(toast.info).toHaveBeenCalledTimes(2)
    expect(toast.info).toHaveBeenLastCalledWith('Szczegóły dokumentu będą dostępne wkrótce.')
  })

  it('przy błędzie pokazuje komunikat i pozwala ponowić', async () => {
    // Odrzucenie danych przez walidację schematu = błąd zapytania.
    vi.spyOn(documentListSchema, 'parse').mockImplementationOnce(() => {
      throw new Error('boom')
    })
    const w = mountView()
    await flushPromises()

    expect(w.get('[role="alert"]').text()).toContain('Nie udało się wczytać dokumentów.')

    const retry = w.findAll('button').find((button) => button.text() === 'Spróbuj ponownie')
    await retry!.trigger('click')
    await flushPromises()

    expect(w.find('[role="alert"]').exists()).toBe(false)
    expect(w.findAll('[data-testid="document-row"]')).toHaveLength(5)
  })

  it('błąd odświeżenia nie chowa już wczytanej listy', async () => {
    const w = mountView()
    await flushPromises()

    vi.spyOn(documentListSchema, 'parse').mockImplementationOnce(() => {
      throw new Error('boom')
    })
    await queryClient.refetchQueries()
    await flushPromises()

    expect(w.find('[role="alert"]').exists()).toBe(false)
    expect(w.findAll('[data-testid="document-row"]')).toHaveLength(5)
  })
})
