import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DocumentsPagination from '../components/DocumentsPagination.vue'
import type { PaginationItem } from '../types'

function mountPagination(
  page: number,
  items: PaginationItem[],
  canPrev: boolean,
  canNext: boolean,
) {
  return mount(DocumentsPagination, { props: { page, items, canPrev, canNext } })
}

describe('DocumentsPagination', () => {
  it('oznacza bieżącą stronę przez aria-current i blokuje „Poprzednia” na początku', () => {
    const w = mountPagination(1, [1, 2, 3, 'ellipsis', 26], false, true)

    const current = w.findAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]!.text()).toBe('1')
    expect(w.get('button[aria-label="Strona 2"]').attributes('aria-current')).toBeUndefined()
    expect(w.get('button[aria-label="Poprzednia strona"]').attributes('disabled')).toBeDefined()
    expect(w.get('button[aria-label="Następna strona"]').attributes('disabled')).toBeUndefined()
  })

  it('blokuje „Następna” na ostatniej stronie', () => {
    const w = mountPagination(26, [1, 'ellipsis', 24, 25, 26], true, false)

    expect(w.get('button[aria-label="Następna strona"]').attributes('disabled')).toBeDefined()
    expect(w.get('button[aria-label="Poprzednia strona"]').attributes('disabled')).toBeUndefined()
  })

  it('wielokropek jest ukryty dla czytników ekranu i nie jest przyciskiem', () => {
    const w = mountPagination(13, [1, 'ellipsis', 12, 13, 14, 'ellipsis', 26], true, true)

    const ellipses = w.findAll('span[aria-hidden="true"]').filter((el) => el.text() === '…')
    expect(ellipses).toHaveLength(2)
    expect(w.findAll('button').map((button) => button.text())).not.toContain('…')
  })

  it('emituje go-to-page, prev i next', async () => {
    const w = mountPagination(2, [1, 2, 3], true, true)

    await w.get('button[aria-label="Strona 3"]').trigger('click')
    await w.get('button[aria-label="Poprzednia strona"]').trigger('click')
    await w.get('button[aria-label="Następna strona"]').trigger('click')

    expect(w.emitted('go-to-page')).toEqual([[3]])
    expect(w.emitted('prev')).toHaveLength(1)
    expect(w.emitted('next')).toHaveLength(1)
  })
})
