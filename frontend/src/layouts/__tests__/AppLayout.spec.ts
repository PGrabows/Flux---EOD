import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import AppLayout from '@/layouts/AppLayout.vue'
import { SIDEBAR_OPEN_STORAGE_KEY } from '@/shared/components/app-sidebar'
import { createTestRouter } from '@/test/router'

let wrapper: ReturnType<typeof mount> | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.restoreAllMocks()
})

/** Symuluje szerokość mobilną dla zapytania prymitywu `(max-width: 767px)`. */
function mockMobileViewport() {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query === '(max-width: 767px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(() => false),
      }) as MediaQueryList,
  )
}

async function mountLayout() {
  const router = await createTestRouter('/dashboard')
  wrapper = mount(AppLayout, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return wrapper
}

const sidebarState = (w: ReturnType<typeof mount>) =>
  w.get('[data-slot="sidebar"]').attributes('data-state')

describe('AppLayout', () => {
  it('domyślnie pokazuje rozwinięty panel i widok trasy', async () => {
    const w = await mountLayout()

    expect(sidebarState(w)).toBe('expanded')
    expect(w.get('h1').text()).toBe('Pulpit')
  })

  it('nadpisuje szerokości panelu wartościami z Figmy', async () => {
    const w = await mountLayout()
    const style = (w.get('[data-slot="sidebar-wrapper"]').element as HTMLElement).style

    expect(style.getPropertyValue('--sidebar-width')).toBe('280px')
    expect(style.getPropertyValue('--sidebar-width-icon')).toBe('88px')
  })

  it('zapisuje stan panelu w localStorage', async () => {
    const w = await mountLayout()

    await w.get('[data-sidebar="trigger"]').trigger('click')
    await flushPromises()
    expect(window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY)).toBe('false')
    expect(sidebarState(w)).toBe('collapsed')
  })

  it('odtwarza zwinięty stan z localStorage', async () => {
    window.localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, 'false')
    const w = await mountLayout()

    expect(sidebarState(w)).toBe('collapsed')
  })

  it('skrót Ctrl+B zapisuje zwinięty stan w localStorage', async () => {
    const w = await mountLayout()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }))
    await flushPromises()
    expect(window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY)).toBe('false')
    expect(sidebarState(w)).toBe('collapsed')
  })

  it('po zwinięciu i ponownym zamontowaniu panel pozostaje zwinięty', async () => {
    const first = await mountLayout()
    await first.get('[data-sidebar="trigger"]').trigger('click')
    await flushPromises()
    first.unmount()
    wrapper = undefined

    const second = await mountLayout()
    expect(sidebarState(second)).toBe('collapsed')
  })

  it('ignoruje ciasteczko sidebar_state – źródłem prawdy jest localStorage', async () => {
    document.cookie = 'sidebar_state=false; path=/'
    expect(window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY)).toBeNull()

    const w = await mountLayout()
    expect(sidebarState(w)).toBe('expanded')
  })

  it('na mobile zamyka panel (Sheet) po przejściu do innej trasy', async () => {
    mockMobileViewport()
    const w = await mountLayout()
    const sheet = () => document.body.querySelector('[data-slot="sidebar"][data-mobile="true"]')

    expect(sheet()).toBeNull()
    await w.get('header button[aria-label="Otwórz menu nawigacji"]').trigger('click')
    await flushPromises()
    expect(sheet()).not.toBeNull()

    sheet()!.querySelector<HTMLAnchorElement>('a[href="/documents"]')!.click()
    await flushPromises()
    await vi.waitFor(() => expect(sheet()).toBeNull())
    expect(w.get('h1').text()).toBe('Dokumenty')
  })

  it('na mobile zamyka panel po kliknięciu linku Ustawienia', async () => {
    mockMobileViewport()
    const w = await mountLayout()
    const sheet = () => document.body.querySelector('[data-slot="sidebar"][data-mobile="true"]')

    await w.get('header button[aria-label="Otwórz menu nawigacji"]').trigger('click')
    await flushPromises()
    sheet()!.querySelector<HTMLAnchorElement>('a[aria-label="Ustawienia"]')!.click()
    await flushPromises()
    await vi.waitFor(() => expect(sheet()).toBeNull())
    expect(w.get('h1').text()).toBe('Ustawienia')
  })
})
