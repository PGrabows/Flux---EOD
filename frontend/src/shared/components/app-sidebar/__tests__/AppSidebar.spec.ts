import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/shared/components/app-sidebar'
import { createTestRouter } from '@/test/router'

const user = { displayName: 'Jan Kowalski', roleLabel: 'Administrator' }

let wrapper: ReturnType<typeof mount> | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

async function mountSidebar(path = '/dashboard', defaultOpen = true) {
  const router = await createTestRouter(path)
  const Harness = defineComponent(
    () => () => h(SidebarProvider, { defaultOpen }, () => h(AppSidebar, { user })),
  )
  wrapper = mount(Harness, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}

function sidebarRoot(w: ReturnType<typeof mount>) {
  return w.get('[data-slot="sidebar"]')
}

function navLinks(w: ReturnType<typeof mount>) {
  return w.get('nav[aria-label="Nawigacja główna"]').findAll('a')
}

describe('AppSidebar', () => {
  it('renderuje linki nawigacji w kolejności z Figmy', async () => {
    const { wrapper } = await mountSidebar()
    const links = navLinks(wrapper)

    expect(links.map((a) => a.attributes('href'))).toEqual([
      '/dashboard',
      '/documents',
      '/my-center',
      '/processes',
      '/erp-portal',
    ])
    // Nagłówek sekcji przed Portalem ERP (wielkie litery nadaje CSS).
    const sectionHeader = wrapper.get('nav div.uppercase')
    expect(sectionHeader.text()).toBe('Portal ERP')
    expect(wrapper.get('nav').findAll('[data-slot="sidebar-separator"]')).toHaveLength(1)
  })

  it('nie pokazuje pozycji „Budżety”', async () => {
    const { wrapper } = await mountSidebar()
    expect(wrapper.text()).not.toContain('Budżety')
    expect(wrapper.find('a[href="/budgets"]').exists()).toBe(false)
  })

  it('pokazuje liczniki przy pozycjach, a Portal ERP bez badge', async () => {
    const { wrapper } = await mountSidebar()
    const badgeOf = (href: string) =>
      wrapper.get(`a[href="${href}"]`).find('[data-testid="nav-badge"]')

    expect(badgeOf('/dashboard').text()).toBe('12')
    expect(badgeOf('/documents').text()).toBe('12')
    expect(badgeOf('/my-center').text()).toBe('8')
    expect(badgeOf('/processes').text()).toBe('6')
    expect(badgeOf('/erp-portal').exists()).toBe(false)
    expect(wrapper.get('a[href="/documents"]').attributes('aria-label')).toBe(
      'Dokumenty, liczba elementów: 12',
    )
    expect(wrapper.get('a[href="/erp-portal"]').attributes('aria-label')).toBe('Portal ERP')
  })

  it('oznacza aktywny link (także na podstronie) przez aria-current', async () => {
    const { wrapper, router } = await mountSidebar('/documents')
    const active = () => navLinks(wrapper).filter((a) => a.attributes('aria-current') === 'page')

    expect(active().map((a) => a.attributes('href'))).toEqual(['/documents'])
    expect(wrapper.get('a[href="/documents"]').attributes('data-active')).toBeDefined()

    // Podstrona nie istnieje jako trasa (not-found), ale prefiks ścieżki nadal podświetla sekcję.
    await router.push('/documents/123')
    await flushPromises()
    expect(active().map((a) => a.attributes('href'))).toEqual(['/documents'])

    await router.push('/erp-portal')
    await flushPromises()
    expect(active().map((a) => a.attributes('href'))).toEqual(['/erp-portal'])
  })

  it.each([
    ['/documents/', '/documents'],
    ['/documents?x=1', '/documents'],
    ['/documents#sekcja', '/documents'],
    ['/documents-archive', null],
    ['/settings', null],
  ])('aktywny stan dla %s → %s', async (path, expected) => {
    const { wrapper } = await mountSidebar(path)
    const active = navLinks(wrapper)
      .filter((a) => a.attributes('aria-current') === 'page')
      .map((a) => a.attributes('href'))

    expect(active).toEqual(expected ? [expected] : [])
    expect(wrapper.get('nav').findAll('[data-active="true"]')).toHaveLength(expected ? 1 : 0)
  })

  it('w stanie zwiniętym tooltip pozycji pokazuje jej etykietę', async () => {
    const { wrapper } = await mountSidebar('/dashboard', false)
    const link = wrapper.get('a[href="/documents"]')

    await link.trigger('focus')
    await flushPromises()

    const content = document.body.querySelector('[data-slot="tooltip-content"]')
    expect(content).not.toBeNull()
    expect(content!.hasAttribute('hidden')).toBe(false)
    // Reka UI dubluje treść w ukrytym elemencie `role="tooltip"` dla czytników ekranu.
    expect(content!.querySelector('[role="tooltip"]')?.textContent?.trim()).toBe('Dokumenty')
  })

  it('pokazuje użytkownika i link do ustawień', async () => {
    const { wrapper } = await mountSidebar()
    const user = wrapper.get('[data-testid="sidebar-user"]')

    expect(user.attributes('data-variant')).toBe('expanded')
    expect(user.text()).toContain('JK')
    expect(user.text()).toContain('Jan Kowalski')
    expect(user.text()).toContain('Administrator')
    expect(user.get('a[aria-label="Ustawienia"]').attributes('href')).toBe('/settings')
  })

  it('w stanie zwiniętym ustawia data-state i wariant collapsed', async () => {
    const { wrapper } = await mountSidebar('/dashboard', false)

    expect(sidebarRoot(wrapper).attributes('data-state')).toBe('collapsed')
    expect(sidebarRoot(wrapper).attributes('data-collapsible')).toBe('icon')
    expect(wrapper.get('[data-testid="sidebar-user"]').attributes('data-variant')).toBe('collapsed')
    expect(wrapper.text()).not.toContain('Jan Kowalski')
    // Każdy link zachowuje nazwę dostępną mimo ukrytych etykiet.
    for (const link of navLinks(wrapper)) {
      expect(link.attributes('aria-label')).toBeTruthy()
    }
  })

  it('przycisk w nagłówku przełącza stan panelu', async () => {
    const { wrapper } = await mountSidebar()
    const trigger = wrapper.get('[data-sidebar="trigger"]')

    expect(trigger.attributes('aria-label')).toBe('Zwiń panel boczny')
    await trigger.trigger('click')
    expect(sidebarRoot(wrapper).attributes('data-state')).toBe('collapsed')
    expect(trigger.attributes('aria-label')).toBe('Rozwiń panel boczny')

    await trigger.trigger('click')
    expect(sidebarRoot(wrapper).attributes('data-state')).toBe('expanded')
  })

  it('skrót Ctrl+B przełącza stan panelu', async () => {
    const { wrapper } = await mountSidebar()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }))
    await flushPromises()
    expect(sidebarRoot(wrapper).attributes('data-state')).toBe('collapsed')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', metaKey: true }))
    await flushPromises()
    expect(sidebarRoot(wrapper).attributes('data-state')).toBe('expanded')
  })
})
