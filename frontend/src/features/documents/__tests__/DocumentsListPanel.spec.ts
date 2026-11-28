import { DOMWrapper, flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import DocumentFiltersSheet from '../components/DocumentFiltersSheet.vue'
import DocumentsListPanel from '../components/DocumentsListPanel.vue'
import { createEmptyFilterCriteria } from '../constants'
import type { DocumentFilterCriteria, DocumentListItem } from '../types'
import { makeDocument, makeDocuments } from './fixtures'

type PanelWrapper = VueWrapper<InstanceType<typeof DocumentsListPanel>>

let wrapper: PanelWrapper | undefined

function mountPanel(documents: DocumentListItem[], attach = false): PanelWrapper {
  wrapper = mount(DocumentsListPanel, {
    props: { documents },
    // Panel filtrów renderuje się w portalu – testy UI potrzebują prawdziwego dokumentu.
    ...(attach ? { attachTo: document.body } : {}),
  })
  return wrapper
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

const filtersDialog = () => document.body.querySelector<HTMLElement>('[role="dialog"]')
const filtersTrigger = (w: PanelWrapper) =>
  w.findAll('button').find((button) => button.text().startsWith('Filtry'))!
const dialogSelect = (labelText: string) => {
  const label = Array.from(filtersDialog()!.querySelectorAll('label')).find(
    (el) => el.textContent?.trim() === labelText,
  )!
  return new DOMWrapper(document.getElementById(label.getAttribute('for')!)!)
}
const dialogSubmit = () =>
  filtersDialog()!.querySelector<HTMLButtonElement>('button[type="submit"]')!

async function openFilters(w: PanelWrapper) {
  await filtersTrigger(w).trigger('click')
  await flushPromises()
}

const rows = (w: PanelWrapper) => w.findAll('[data-testid="document-row"]')
const count = (w: PanelWrapper) => w.get('[data-testid="documents-count"]').text()
const chipLabels = (w: PanelWrapper) =>
  w.findAll('[data-testid="active-filter-chip"]').map((chip) => chip.text())

async function applyFilters(w: PanelWrapper, overrides: Partial<DocumentFilterCriteria>) {
  w.findComponent(DocumentFiltersSheet).vm.$emit('apply', {
    ...createEmptyFilterCriteria(),
    ...overrides,
  })
  await nextTick()
}

describe('DocumentsListPanel', () => {
  it('pokazuje pierwszą stronę, licznik, zakres i paginację', () => {
    const w = mountPanel(makeDocuments(12))

    expect(rows(w)).toHaveLength(5)
    expect(count(w)).toBe('12 dokumentów')
    expect(w.text()).toContain('Wyświetlanie 1–5 z 12')
    expect(w.get('nav[aria-label="Paginacja listy dokumentów"] [aria-current="page"]').text()).toBe(
      '1',
    )
    expect(w.get('button[aria-label="Poprzednia strona"]').attributes('disabled')).toBeDefined()
  })

  it('przechodzi na kolejną stronę', async () => {
    const w = mountPanel(makeDocuments(12))

    await w.get('button[aria-label="Strona 3"]').trigger('click')
    expect(rows(w)).toHaveLength(2)
    expect(w.text()).toContain('Wyświetlanie 11–12 z 12')
    expect(w.get('button[aria-label="Następna strona"]').attributes('disabled')).toBeDefined()
  })

  it('wiersz pokazuje dane dokumentu i emituje details', async () => {
    const document = makeDocument({
      id: 'doc-00184',
      title: 'Umowa o świadczenie usług – Nexora',
      number: 'DOC-2026-00184',
      modifiedAt: '2026-10-28T14:32:00',
      status: 'in-approval',
    })
    const w = mountPanel([document])

    const row = rows(w)[0]!
    expect(row.text()).toContain('Umowa o świadczenie usług – Nexora')
    expect(row.text()).toContain('28 paź 2026')
    expect(row.get('time').attributes('datetime')).toBe('2026-10-28T14:32:00')
    expect(row.text()).toContain('W akceptacji')

    await row.get('button[aria-label="Szczegóły dokumentu DOC-2026-00184"]').trigger('click')
    expect(w.emitted('details')).toEqual([['doc-00184']])
  })

  it('przełącza kierunek sortowania z nagłówka kolumny', async () => {
    const documents = makeDocuments(3)
    const w = mountPanel(documents)

    expect(rows(w)[0]!.text()).toContain(documents[0]!.title)
    await w.get('button[aria-label^="Data modyfikacji"]').trigger('click')
    expect(rows(w)[0]!.text()).toContain(documents[2]!.title)
  })

  it('wyszukiwanie bez wyników pokazuje pusty stan, a „Wyczyść filtry” go zdejmuje', async () => {
    const w = mountPanel(makeDocuments(3))

    await w.get('input[type="search"]').setValue('nie ma takiego dokumentu')
    expect(rows(w)).toHaveLength(0)
    expect(count(w)).toBe('0 dokumentów')
    const empty = w.get('[data-testid="documents-empty-state"]')
    expect(empty.text()).toContain('Brak dokumentów spełniających kryteria')

    await empty.get('button').trigger('click')
    expect(rows(w)).toHaveLength(3)
    expect((w.get('input[type="search"]').element as HTMLInputElement).value).toBe('')
  })

  it('bez dokumentów i filtrów pokazuje pusty stan bez przycisku', () => {
    const w = mountPanel([])

    const empty = w.get('[data-testid="documents-empty-state"]')
    expect(empty.text()).toContain('Brak dokumentów')
    expect(empty.text()).toContain('Nie dodano jeszcze żadnych dokumentów.')
    expect(empty.find('button').exists()).toBe(false)
  })

  it('zastosowanie filtrów z panelu dodaje chip, zmienia licznik i wraca na 1. stronę', async () => {
    const documents = [
      ...makeDocuments(11),
      makeDocument({ status: 'rejected', modifiedAt: '2026-01-01T08:00:00' }),
    ]
    const w = mountPanel(documents)
    await w.get('button[aria-label="Strona 2"]').trigger('click')
    expect(w.text()).toContain('Wyświetlanie 6\u201310 z 12')

    await applyFilters(w, { statuses: ['rejected'] })

    expect(chipLabels(w)).toEqual(['Status: Odrzucony'])
    expect(count(w)).toBe('1 dokument')
    expect(rows(w)).toHaveLength(1)
    expect(w.text()).toContain('Wyświetlanie 1\u20131 z 1')
  })

  it('przycisk X na chipie usuwa filtr', async () => {
    const w = mountPanel(makeDocuments(3))

    await applyFilters(w, { type: 'invoice' })
    expect(w.findAll('[data-testid="active-filter-chip"]')).toHaveLength(1)
    expect(rows(w)).toHaveLength(0)

    await w.get('button[aria-label="Usuń filtr Rodzaj: Faktura"]').trigger('click')
    expect(w.findAll('[data-testid="active-filter-chip"]')).toHaveLength(0)
    expect(rows(w)).toHaveLength(3)
  })

  it('pokazuje chipy nowych filtrów, a X na „Rodzaj” usuwa też „Podtyp”', async () => {
    const w = mountPanel([
      makeDocument({
        type: 'invoice',
        subtype: 'vat',
        registeredAt: '2026-10-15',
        recipient: { name: 'Agnieszka Pawlak', department: 'Finanse' },
        contractor: { name: 'Nexora sp. z o.o.', nip: '1234567890' },
        value: { amount: 2000, currency: 'PLN' },
      }),
      makeDocument(),
    ])

    await applyFilters(w, {
      type: 'invoice',
      subtype: 'vat',
      registeredFrom: '2026-10-01',
      registeredTo: '2026-10-31',
      recipient: 'Agnieszka Pawlak',
      contractorQuery: 'nexora',
      valueMin: 1000,
      valueMax: 5000,
    })

    expect(chipLabels(w)).toEqual([
      'Rodzaj: Faktura',
      'Podtyp: VAT',
      'Data: 01.10 \u2013 31.10.2026',
      'Odbiorca: Agnieszka Pawlak',
      'Kontrahent: nexora',
      'Wartość: 1\u00a0000 \u2013 5\u00a0000 PLN',
    ])
    expect(rows(w)).toHaveLength(1)
    expect(w.get('[data-testid="filters-active-count"]').text()).toBe('6')

    await w.get('button[aria-label="Usuń filtr Rodzaj: Faktura"]').trigger('click')
    expect(chipLabels(w)).not.toContain('Podtyp: VAT')
    expect(chipLabels(w)).toHaveLength(4)
  })

  it('samo wyszukiwanie bez wyników nie pokazuje rzędu chipów, ale daje przycisk w pustym stanie', async () => {
    const w = mountPanel(makeDocuments(3))

    await w.get('input[type="search"]').setValue('brak wyników')
    expect(w.text()).not.toContain('Aktywne filtry:')
    expect(w.get('[data-testid="documents-empty-state"] button').text()).toBe('Wyczyść filtry')
  })

  it('przy ponad 7 stronach pokazuje wielokropek', () => {
    const w = mountPanel(makeDocuments(40))

    const nav = w.get('nav[aria-label="Paginacja listy dokumentów"]')
    expect(nav.findAll('span[aria-hidden="true"]').some((el) => el.text() === '…')).toBe(true)
    expect(nav.find('button[aria-label="Strona 8"]').exists()).toBe(true)
    expect(nav.find('button[aria-label="Strona 4"]').exists()).toBe(false)
  })

  it('zakres w stopce nie jest osobnym regionem aria-live', () => {
    const w = mountPanel(makeDocuments(3))

    expect(w.findAll('[aria-live]')).toHaveLength(1)
    expect(w.get('section').attributes('aria-labelledby')).toBe(w.get('h2').attributes('id'))
  })

  it('integracja UI: rodzaj z panelu daje chip, X go zdejmuje, a panel startuje od nowa (T3)', async () => {
    const w = mountPanel(
      [
        makeDocument({ type: 'invoice', subtype: 'vat' }),
        makeDocument({ type: 'contract' }),
        makeDocument({ type: 'contract' }),
      ],
      true,
    )

    await openFilters(w)
    expect(dialogSubmit().textContent?.trim()).toBe('Pokaż wyniki (3)')
    await dialogSelect('Rodzaj dokumentu').setValue('invoice')
    expect(dialogSubmit().textContent?.trim()).toBe('Pokaż wyniki (1)')
    dialogSubmit().click()
    await flushPromises()

    expect(filtersDialog()).toBeNull()
    expect(chipLabels(w)).toEqual(['Rodzaj: Faktura'])
    expect(rows(w)).toHaveLength(1)

    await w.get('button[aria-label="Usuń filtr Rodzaj: Faktura"]').trigger('click')
    expect(chipLabels(w)).toEqual([])
    expect(rows(w)).toHaveLength(3)

    await openFilters(w)
    expect((dialogSelect('Rodzaj dokumentu').element as HTMLSelectElement).value).toBe('')
    expect(dialogSubmit().textContent?.trim()).toBe('Pokaż wyniki (3)')
  })

  it('waluta EUR i „Od” = 1000 z panelu daje chip „Wartość: od 1 000 EUR” (T6)', async () => {
    const w = mountPanel(
      [
        makeDocument({ value: { amount: 1200, currency: 'EUR' } }),
        makeDocument({ value: { amount: 1200, currency: 'PLN' } }),
      ],
      true,
    )

    await openFilters(w)
    await new DOMWrapper(filtersDialog()!.querySelector('select[aria-label="Waluta"]')!).setValue(
      'EUR',
    )
    await new DOMWrapper(
      filtersDialog()!.querySelector('input[aria-label="Wartość od"]')!,
    ).setValue('1000')
    expect(dialogSubmit().textContent?.trim()).toBe('Pokaż wyniki (1)')
    dialogSubmit().click()
    await flushPromises()

    expect(chipLabels(w)).toEqual(['Wartość: od 1\u00a0000 EUR'])
    expect(rows(w)).toHaveLength(1)
  })

  it('licznik na przycisku „Filtry” maleje po X na chipie i znika przy zera (T11)', async () => {
    const w = mountPanel([makeDocument({ status: 'draft', type: 'contract' })])
    await applyFilters(w, { statuses: ['draft'], type: 'contract' })

    const badge = () => w.find('[data-testid="filters-active-count"]')
    expect(badge().text()).toBe('2')

    await w.get('button[aria-label="Usuń filtr Status: Wersja robocza"]').trigger('click')
    expect(badge().text()).toBe('1')

    await w.get('button[aria-label="Usuń filtr Rodzaj: Umowa"]').trigger('click')
    expect(badge().exists()).toBe(false)
    expect(filtersTrigger(w).text()).toBe('Filtry')
  })
})
