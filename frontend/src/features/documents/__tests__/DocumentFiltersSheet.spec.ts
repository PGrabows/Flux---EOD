import { DOMWrapper, flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import DocumentFiltersSheet from '../components/DocumentFiltersSheet.vue'
import { createEmptyFilterCriteria } from '../constants'
import type { DocumentFilterCriteria } from '../types'
import { makeDocument } from './fixtures'

type SheetWrapper = VueWrapper<InstanceType<typeof DocumentFiltersSheet>>

const documents = [
  makeDocument({ status: 'draft', type: 'invoice', subtype: 'vat' }),
  makeDocument({ status: 'in-approval', type: 'invoice', subtype: 'correction' }),
  makeDocument({ status: 'in-approval', type: 'contract' }),
  makeDocument({ status: 'completed', type: 'protocol', subtype: 'acceptance' }),
]

let wrapper: SheetWrapper | undefined

function mountSheet(
  applied: DocumentFilterCriteria = createEmptyFilterCriteria(),
  activeCount = 0,
) {
  wrapper = mount(DocumentFiltersSheet, {
    props: { documents, query: '', applied, activeCount },
    // Panel renderuje się w portalu – potrzebny prawdziwy dokument.
    attachTo: document.body,
  }) as SheetWrapper
  return wrapper
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

const dialog = () => document.body.querySelector<HTMLElement>('[role="dialog"]')
const inDialog = (selector: string) => new DOMWrapper(dialog()!.querySelector(selector)!)
const buttonByText = (text: string) =>
  Array.from(dialog()!.querySelectorAll('button')).find((b) =>
    b.textContent?.trim().startsWith(text),
  )!
const submitButton = () => dialog()!.querySelector<HTMLButtonElement>('button[type="submit"]')!
const checkboxFor = (label: string) => {
  const labelEl = Array.from(dialog()!.querySelectorAll('label')).find(
    (el) => el.textContent?.trim() === label,
  )!
  return document.getElementById(labelEl.getAttribute('for')!)!
}

const selectFor = (text: string) => {
  const label = Array.from(dialog()!.querySelectorAll('label')).find(
    (el) => el.textContent?.trim() === text,
  )!
  return document.getElementById(label.getAttribute('for')!) as HTMLSelectElement
}
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

async function open(w: SheetWrapper) {
  await w.get('button').trigger('click')
  await flushPromises()
}

describe('DocumentFiltersSheet', () => {
  it('otwiera dialog z tytułem, opisem, przyciemnionym tłem i licznikami statusów', async () => {
    const w = mountSheet()
    expect(dialog()).toBeNull()

    await open(w)

    const panel = dialog()!
    const title = document.getElementById(panel.getAttribute('aria-labelledby')!)!
    const description = document.getElementById(panel.getAttribute('aria-describedby')!)!
    expect(title.textContent?.trim()).toBe('Filtry')
    expect(description.textContent?.trim()).toBe('Zawęź listę dokumentów')

    const overlay = document.body.querySelector('[data-testid="filters-overlay"]')!
    expect(overlay.classList).toContain('bg-black/40')
    expect(overlay.classList).not.toContain('bg-black/10')

    const counts = Array.from(panel.querySelectorAll('fieldset li')).map(
      (li) =>
        `${li.querySelector('label')?.textContent?.trim()} ${li.lastElementChild?.textContent?.trim()}`,
    )
    expect(counts).toEqual([
      'Wersja robocza 1',
      'W akceptacji 2',
      'Zaakceptowany 0',
      'Odrzucony 0',
      'Zrealizowany 1',
    ])
    expect(submitButton().textContent?.trim()).toBe('Pokaż wyniki (4)')
  })

  it('zaznaczenie statusu aktualizuje podgląd liczby wyników', async () => {
    const w = mountSheet()
    await open(w)

    checkboxFor('W akceptacji').click()
    await flushPromises()

    expect(checkboxFor('W akceptacji').getAttribute('aria-checked')).toBe('true')
    expect(submitButton().textContent?.trim()).toBe('Pokaż wyniki (2)')
  })

  it('wybór rodzaju włącza podtyp z opcjami tego rodzaju', async () => {
    const w = mountSheet()
    await open(w)

    const labels = Array.from(dialog()!.querySelectorAll('label'))
    const selectFor = (text: string) =>
      document.getElementById(
        labels.find((l) => l.textContent?.trim() === text)!.getAttribute('for')!,
      ) as HTMLSelectElement

    expect(selectFor('Podtyp').disabled).toBe(true)
    await new DOMWrapper(selectFor('Rodzaj dokumentu')).setValue('invoice')
    await flushPromises()

    const subtype = selectFor('Podtyp')
    expect(subtype.disabled).toBe(false)
    expect(Array.from(subtype.options).map((o) => o.text.trim())).toEqual([
      'Wszystkie podtypy',
      'VAT',
      'Korygująca',
      'Proforma',
    ])
    expect(submitButton().textContent?.trim()).toBe('Pokaż wyniki (2)')
  })

  it('„Pokaż wyniki” emituje kryteria i zamyka panel', async () => {
    const w = mountSheet()
    await open(w)

    checkboxFor('Zrealizowany').click()
    await flushPromises()
    submitButton().click()
    await flushPromises()

    const emitted = w.emitted('apply')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0]![0]).toEqual({ ...createEmptyFilterCriteria(), statuses: ['completed'] })
    expect(dialog()).toBeNull()
  })

  it('Esc i „Zamknij filtry” zamykają bez emitu, a ponowne otwarcie pokazuje zastosowane filtry', async () => {
    const applied = { ...createEmptyFilterCriteria(), statuses: ['draft' as const] }
    const w = mountSheet(applied, 1)
    await open(w)

    checkboxFor('Odrzucony').click()
    await flushPromises()
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await flushPromises()
    expect(dialog()).toBeNull()

    await open(w)
    expect(checkboxFor('Odrzucony').getAttribute('aria-checked')).toBe('false')
    expect(checkboxFor('Wersja robocza').getAttribute('aria-checked')).toBe('true')

    checkboxFor('Odrzucony').click()
    await flushPromises()
    dialog()!.querySelector<HTMLButtonElement>('button[aria-label="Zamknij filtry"]')!.click()
    await flushPromises()
    expect(dialog()).toBeNull()

    await open(w)
    expect(checkboxFor('Odrzucony').getAttribute('aria-checked')).toBe('false')
    expect(w.emitted('apply')).toBeUndefined()
  })

  it('„Wyczyść filtry” czyści szkic bez emitu', async () => {
    const applied = {
      ...createEmptyFilterCriteria(),
      statuses: ['draft' as const],
      type: 'invoice' as const,
    }
    const w = mountSheet(applied, 2)
    await open(w)
    expect(submitButton().textContent?.trim()).toBe('Pokaż wyniki (1)')

    buttonByText('Wyczyść filtry').click()
    await flushPromises()

    expect(checkboxFor('Wersja robocza').getAttribute('aria-checked')).toBe('false')
    expect(submitButton().textContent?.trim()).toBe('Pokaż wyniki (4)')
    expect(w.emitted('apply')).toBeUndefined()
    expect(dialog()).not.toBeNull()
  })

  it('błędny zakres wartości pokazuje komunikat i blokuje „Pokaż wyniki”', async () => {
    const w = mountSheet()
    await open(w)

    await inDialog('input[aria-label="Wartość od"]').setValue('500')
    await inDialog('input[aria-label="Wartość do"]').setValue('100')
    await flushPromises()

    const alert = dialog()!.querySelector('[role="alert"]')!
    expect(alert.textContent?.trim()).toBe('Wartość „od” nie może być większa niż „do”')
    expect(
      dialog()!.querySelector('input[aria-label="Wartość od"]')!.getAttribute('aria-describedby'),
    ).toBe(alert.id)
    expect(submitButton().disabled).toBe(true)
  })

  it('błędny zakres dat pokazuje komunikat', async () => {
    const w = mountSheet()
    await open(w)

    await inDialog('input[aria-label="Data rejestracji od"]').setValue('2026-10-31')
    await inDialog('input[aria-label="Data rejestracji do"]').setValue('2026-10-01')
    await flushPromises()

    expect(dialog()!.querySelector('[role="alert"]')!.textContent?.trim()).toBe(
      'Data „od” nie może być późniejsza niż „do”',
    )
    expect(submitButton().disabled).toBe(true)
  })

  it('przycisk „Filtry” pokazuje liczbę aktywnych filtrów (badge + tekst dla czytników)', () => {
    const w = mountSheet(createEmptyFilterCriteria(), 3)

    const trigger = w.get('button')
    expect(trigger.get('[data-testid="filters-active-count"]').text()).toBe('3')
    expect(trigger.get('[data-testid="filters-active-count"]').attributes('aria-hidden')).toBe(
      'true',
    )
    expect(trigger.get('.sr-only').text()).toBe(', aktywne: 3')
  })

  it('bez aktywnych filtrów przycisk nie ma badge', () => {
    const w = mountSheet()

    expect(w.get('button').text()).toBe('Filtry')
    expect(w.find('[data-testid="filters-active-count"]').exists()).toBe(false)
  })

  it('klik w przyciemnione tło zamyka panel bez emitu (T1)', async () => {
    const w = mountSheet()
    await open(w)

    const overlay = document.body.querySelector<HTMLElement>('[data-testid="filters-overlay"]')!
    overlay.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
    overlay.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, button: 0 }))
    overlay.click()
    await flushPromises()
    await tick()

    expect(dialog()).toBeNull()
    expect(w.emitted('apply')).toBeUndefined()
  })

  it('po otwarciu fokus jest w panelu, a po zamknięciu wraca na „Filtry” (T2)', async () => {
    const w = mountSheet()
    const trigger = w.get('button').element as HTMLButtonElement
    trigger.focus()
    await open(w)
    await tick()

    expect(dialog()!.contains(document.activeElement)).toBe(true)

    dialog()!.querySelector<HTMLButtonElement>('button[aria-label="Zamknij filtry"]')!.click()
    await flushPromises()
    await tick()

    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('submit formularza przy błędzie (np. Enter) nie emituje i nie zamyka (T4)', async () => {
    const w = mountSheet()
    await open(w)

    await inDialog('input[aria-label="Wartość od"]').setValue('-5')
    dialog()!
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()

    expect(dialog()!.querySelector('[role="alert"]')!.textContent?.trim()).toBe(
      'Wartość nie może być ujemna',
    )
    expect(w.emitted('apply')).toBeUndefined()
    expect(dialog()).not.toBeNull()
  })

  it('zmiana rodzaju czyści wybrany podtyp (T5)', async () => {
    const w = mountSheet()
    await open(w)

    await new DOMWrapper(selectFor('Rodzaj dokumentu')).setValue('invoice')
    await new DOMWrapper(selectFor('Podtyp')).setValue('vat')
    expect(selectFor('Podtyp').value).toBe('vat')
    expect(submitButton().textContent?.trim()).toBe('Pokaż wyniki (1)')

    await new DOMWrapper(selectFor('Rodzaj dokumentu')).setValue('protocol')
    await flushPromises()

    expect(selectFor('Podtyp').value).toBe('')
    expect(Array.from(selectFor('Podtyp').options).map((o) => o.value)).toEqual([
      '',
      'acceptance',
      'handover',
      'meeting',
    ])
  })

  it('waluta EUR i „Od” = 1000 zawęża podgląd i emituje kryteria (T6)', async () => {
    wrapper = mount(DocumentFiltersSheet, {
      props: {
        documents: [
          makeDocument({ value: { amount: 1500, currency: 'EUR' } }),
          makeDocument({ value: { amount: 999, currency: 'EUR' } }),
          makeDocument({ value: { amount: 5000, currency: 'PLN' } }),
          makeDocument({ value: null }),
        ],
        query: '',
        applied: createEmptyFilterCriteria(),
        activeCount: 0,
      },
      attachTo: document.body,
    }) as SheetWrapper
    await open(wrapper)

    await inDialog('select[aria-label="Waluta"]').setValue('EUR')
    await inDialog('input[aria-label="Wartość od"]').setValue('1000')
    expect(submitButton().textContent?.trim()).toBe('Pokaż wyniki (1)')

    submitButton().click()
    await flushPromises()
    expect(wrapper.emitted('apply')![0]![0]).toMatchObject({
      currency: 'EUR',
      valueMin: 1000,
      valueMax: null,
    })
  })

  it('pola daty mają ukryty natywny wskaźnik i górną granicę 9999-12-31', async () => {
    const w = mountSheet()
    await open(w)

    const from = dialog()!.querySelector<HTMLInputElement>(
      'input[aria-label="Data rejestracji od"]',
    )!
    const to = dialog()!.querySelector<HTMLInputElement>('input[aria-label="Data rejestracji do"]')!
    expect(from.max).toBe('9999-12-31')
    expect(to.max).toBe('9999-12-31')
    expect(from.className).toContain('[&::-webkit-calendar-picker-indicator]:opacity-0')

    await new DOMWrapper(from).setValue('2026-10-01')
    await new DOMWrapper(to).setValue('2026-10-31')
    expect(from.max).toBe('2026-10-31')
    expect(to.min).toBe('2026-10-01')
  })
})
