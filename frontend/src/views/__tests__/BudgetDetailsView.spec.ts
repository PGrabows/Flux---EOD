import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'vue-sonner'

import { NBSP } from '@/lib/format'
import { budgetDataSchema } from '@/features/budgets/schemas'
import { createTestRouter } from '@/test/router'
import BudgetDetailsView from '@/views/BudgetDetailsView.vue'

vi.mock('vue-sonner', () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}))

const text = (value: string) => value.replaceAll(NBSP, ' ').replace(/\s+/g, ' ').trim()

let wrapper: ReturnType<typeof mount> | undefined

async function mountView(code: string) {
  const router = await createTestRouter(`/budgets/${code}`)
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  wrapper = mount(BudgetDetailsView, {
    props: { code },
    global: { plugins: [router, [VueQueryPlugin, { queryClient }]] },
  })
  await flushPromises()
  return wrapper
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('BudgetDetailsView', () => {
  it('pokazuje szczegóły FIN-2026-01 wg Figmy', async () => {
    const w = await mountView('FIN-2026-01')

    expect(w.get('h1').text()).toBe('Oprogramowanie i licencje')
    expect(w.get('[data-testid="budget-meta"]').text()).toBe(
      'FIN-2026-01 · Finanse · Koszty operacyjne · 1 sty – 31 gru 2026',
    )
    expect(w.text()).toContain('Stan na 18 lis 2026')
    expect(text(w.get('[data-testid="usage-legend-spent"]').text())).toBe('59 250,00 PLN')
    expect(text(w.get('[data-testid="usage-legend-committed"]').text())).toBe('22 693,50 PLN')
    expect(text(w.get('[data-testid="usage-legend-remaining"]').text())).toBe('38 056,50 PLN')
    expect(text(w.get('[data-testid="usage-legend-limit"]').text())).toBe('120 000,00 PLN')
    expect(w.findAll('[data-testid="monthly-bar"]')).toHaveLength(11)
    expect(w.findAll('[data-testid="budget-document-row"]')).toHaveLength(4)
    expect(w.findAll('[data-testid="purchase-order-row"]')).toHaveLength(2)
    expect(w.text()).toContain('Anna Kowalska')
    expect(w.text()).toContain('W normie')
  })

  it('okruszek wraca do listy, „Zobacz wszystkie” prowadzi do dokumentów', async () => {
    const w = await mountView('FIN-2026-01')

    const breadcrumb = w.get('nav[aria-label="Ścieżka nawigacji"]')
    expect(breadcrumb.get('a').attributes('href')).toBe('/budgets')
    expect(breadcrumb.get('[aria-current="page"]').text()).toBe('FIN-2026-01')

    const all = w.findAll('a').find((a) => a.text().includes('Zobacz wszystkie'))
    expect(all!.attributes('href')).toBe('/documents')
  })

  it('„Pobierz zestawienie” pokazuje informację o niedostępnej funkcji', async () => {
    const w = await mountView('FIN-2026-01')

    const download = w.findAll('button').find((b) => b.text() === 'Pobierz zestawienie')
    await download!.trigger('click')

    expect(toast.info).toHaveBeenCalledWith(
      'Pobieranie zestawienia jest niedostępne w wersji demonstracyjnej.',
    )
  })

  it('przekroczony budżet ma ujemne pozostało i przycięty pasek', async () => {
    const w = await mountView('FIN-2026-04')

    expect(text(w.get('[data-testid="usage-legend-remaining"]').text())).toBe('\u22121 340,00 PLN')
    expect(w.text()).toContain('Przekroczony')
    expect(w.get('[data-testid="usage-bar-spent"]').attributes('style')).toContain('width: 100%')
  })

  it('budżet bez zamówień PO pokazuje komunikat zamiast listy', async () => {
    const w = await mountView('FIN-2026-05')

    expect(w.get('h1').text()).toBe('Podróże służbowe')
    expect(w.findAll('[data-testid="purchase-order-row"]')).toHaveLength(0)
    expect(w.text()).toContain('Brak zamówień powiązanych z tym budżetem.')
  })

  it('kod małymi literami działa jak kanoniczny', async () => {
    const w = await mountView('fin-2026-01')

    expect(w.get('h1').text()).toBe('Oprogramowanie i licencje')
    expect(w.get('nav[aria-label="Ścieżka nawigacji"] [aria-current="page"]').text()).toBe(
      'FIN-2026-01',
    )
  })

  it('przy błędzie pokazuje komunikat z ukrytym nagłówkiem i pozwala ponowić', async () => {
    vi.spyOn(budgetDataSchema, 'parse').mockImplementationOnce(() => {
      throw new Error('boom')
    })
    const w = await mountView('FIN-2026-01')

    expect(w.get('[role="alert"]').text()).toContain('Nie udało się wczytać szczegółów budżetu.')
    expect(w.get('h1.sr-only').text()).toBe('Szczegóły budżetu FIN-2026-01')

    const retry = w.findAll('button').find((b) => b.text() === 'Spróbuj ponownie')
    await retry!.trigger('click')
    await flushPromises()
    expect(w.get('h1').text()).toBe('Oprogramowanie i licencje')
  })

  it('nieznany kod pokazuje stan „nie znaleziono” z linkiem do listy', async () => {
    const w = await mountView('FIN-2099-99')

    expect(w.find('[data-testid="budget-not-found"]').exists()).toBe(true)
    expect(w.get('h1').text()).toBe('Nie znaleziono budżetu')
    const back = w.findAll('a').find((a) => a.text() === 'Wróć do listy budżetów')
    expect(back!.attributes('href')).toBe('/budgets')
  })
})
