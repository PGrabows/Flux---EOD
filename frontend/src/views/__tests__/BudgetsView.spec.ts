import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { budgetDataSchema } from '@/features/budgets/schemas'
import { NBSP } from '@/lib/format'
import { createTestRouter } from '@/test/router'
import BudgetsView from '@/views/BudgetsView.vue'

vi.mock('vue-sonner', () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}))

const text = (value: string) => value.replaceAll(NBSP, ' ').replace(/\s+/g, ' ').trim()

let wrapper: ReturnType<typeof mount> | undefined

async function mountView(path = '/budgets') {
  const router = await createTestRouter(path)
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  wrapper = mount(BudgetsView, {
    global: { plugins: [router, [VueQueryPlugin, { queryClient }]] },
  })
  return { wrapper, router }
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.restoreAllMocks()
})

describe('BudgetsView', () => {
  it('pokazuje KPI i listę budżetów z danych demo', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.find('[data-testid="budgets-loading"]').exists()).toBe(true)
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Budżety')
    const kpis = wrapper.findAll('[data-testid="budget-kpi-value"]').map((el) => text(el.text()))
    expect(kpis).toEqual(['300 000,00 PLN', '171 590,00 PLN', '34 193,50 PLN', '94 216,50 PLN'])
    expect(text(wrapper.get('[data-testid="budget-kpi-remaining"]').text())).toContain('31% limitu')

    const rows = wrapper.findAll('[data-testid="budget-row"]')
    expect(rows).toHaveLength(5)
    expect(text(rows[3]!.get('[data-testid="budget-remaining"]').text())).toBe(
      'Pozostało: \u22121 340,00',
    )
    expect(rows[3]!.text()).toContain('Przekroczony')
    expect(wrapper.text()).toContain('Wyświetlanie 1–5 z 5')
  })

  it('składa podtytuł i notatkę o widoczności z zakresu w danych', async () => {
    const { wrapper } = await mountView()
    await flushPromises()

    expect(wrapper.get('[data-testid="budgets-subtitle"]').text()).toBe(
      'Budżety działu Finanse, z których korzystasz — limity, zaangażowanie i kwoty do dyspozycji.',
    )
    expect(wrapper.text()).toContain('Widzisz budżety działu Finanse jako przełożony.')
    expect(wrapper.get('[role="progressbar"]').attributes('aria-label')).toBe(
      'Wykorzystanie budżetu Oprogramowanie i licencje',
    )
  })

  it('rok z ?year= zawęża listę – brak budżetów na 2025', async () => {
    const { wrapper } = await mountView('/budgets?year=2025')
    await flushPromises()

    expect(wrapper.get('[data-testid="budgets-count"]').text()).toBe('0 budżetów · rok 2025')
    expect(wrapper.get('[data-testid="budgets-empty-state"]').text()).toContain('Brak budżetów')
    expect(text(wrapper.get('[data-testid="budget-kpi-limit"]').text())).toContain('0,00 PLN')
  })

  it('wiersz linkuje do szczegółów budżetu', async () => {
    const { wrapper } = await mountView()
    await flushPromises()

    const link = wrapper.get('[data-testid="budget-row"] a')
    expect(link.attributes('href')).toBe('/budgets/FIN-2026-01')
    expect(link.text()).toBe('Oprogramowanie i licencje')
  })

  it('wyszukiwanie filtruje tabelę, pusty wynik pozwala wyczyścić frazę', async () => {
    const { wrapper } = await mountView()
    await flushPromises()

    const search = wrapper.get('input[type="search"]')
    await search.setValue('FIN-2026-02')
    expect(wrapper.findAll('[data-testid="budget-row"]')).toHaveLength(1)
    expect(wrapper.get('[data-testid="budgets-count"]').text()).toBe('1 budżet · rok 2026')

    await search.setValue('podroze')
    expect(wrapper.findAll('[data-testid="budget-row"]').map((row) => row.get('a').text())).toEqual(
      ['Podróże służbowe'],
    )

    await search.setValue('brak takiego')
    expect(wrapper.find('[data-testid="budgets-empty-state"]').exists()).toBe(true)
    // KPI nie zależą od wyszukiwania.
    expect(text(wrapper.get('[data-testid="budget-kpi-limit"]').text())).toContain('300 000,00')

    const clear = wrapper.findAll('button').find((b) => b.text() === 'Wyczyść wyszukiwanie')
    await clear!.trigger('click')
    expect(wrapper.findAll('[data-testid="budget-row"]')).toHaveLength(5)
  })

  it('przy błędzie pokazuje komunikat i pozwala ponowić', async () => {
    vi.spyOn(budgetDataSchema, 'parse').mockImplementationOnce(() => {
      throw new Error('boom')
    })
    const { wrapper } = await mountView()
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Nie udało się wczytać budżetów.')
    const retry = wrapper.findAll('button').find((b) => b.text() === 'Spróbuj ponownie')
    await retry!.trigger('click')
    await flushPromises()

    expect(wrapper.findAll('[data-testid="budget-row"]')).toHaveLength(5)
  })
})
