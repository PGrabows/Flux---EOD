import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import DocumentListToolbar from '../components/DocumentListToolbar.vue'
import DocumentsListPanel from '../components/DocumentsListPanel.vue'
import type { DocumentListItem } from '../types'
import { makeDocument, makeDocuments } from './fixtures'

type PanelWrapper = VueWrapper<InstanceType<typeof DocumentsListPanel>>

let wrapper: PanelWrapper | undefined

function mountPanel(documents: DocumentListItem[]): PanelWrapper {
  wrapper = mount(DocumentsListPanel, { props: { documents } })
  return wrapper
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

const rows = (w: PanelWrapper) => w.findAll('[data-testid="document-row"]')
const count = (w: PanelWrapper) => w.get('[data-testid="documents-count"]').text()

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

  it('zdarzenie statusu z toolbara dodaje chip, zmienia licznik i wraca na 1. stronę', async () => {
    const documents = [
      ...makeDocuments(11),
      makeDocument({ status: 'rejected', modifiedAt: '2026-01-01T08:00:00' }),
    ]
    const w = mountPanel(documents)
    await w.get('button[aria-label="Strona 2"]').trigger('click')
    expect(w.text()).toContain('Wyświetlanie 6\u201310 z 12')

    w.findComponent(DocumentListToolbar).vm.$emit('update:status', 'rejected', true)
    await nextTick()

    const chips = w.findAll('[data-testid="active-filter-chip"]')
    expect(chips.map((chip) => chip.text())).toEqual(['Status: Odrzucony'])
    expect(count(w)).toBe('1 dokument')
    expect(rows(w)).toHaveLength(1)
    expect(w.text()).toContain('Wyświetlanie 1\u20131 z 1')
  })

  it('przycisk X na chipie usuwa filtr', async () => {
    const w = mountPanel(makeDocuments(3))

    w.findComponent(DocumentListToolbar).vm.$emit('update:type', 'invoice', true)
    await nextTick()
    expect(w.findAll('[data-testid="active-filter-chip"]')).toHaveLength(1)
    expect(rows(w)).toHaveLength(0)

    await w.get('button[aria-label="Usuń filtr Rodzaj: Faktura"]').trigger('click')
    expect(w.findAll('[data-testid="active-filter-chip"]')).toHaveLength(0)
    expect(rows(w)).toHaveLength(3)
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
})
