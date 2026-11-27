import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DocumentStatusBadge from '../components/DocumentStatusBadge.vue'

describe('DocumentStatusBadge', () => {
  it.each([
    ['in-approval', 'W akceptacji', 'bg-eod-status-in-approval'],
    ['draft', 'Wersja robocza', 'bg-eod-status-draft'],
    ['rejected', 'Odrzucony', 'bg-eod-status-rejected'],
    ['approved', 'Zaakceptowany', 'bg-eod-status-approved'],
  ] as const)('%s → „%s” z kolorem statusu', (status, label, bgClass) => {
    const wrapper = mount(DocumentStatusBadge, { props: { status } })

    expect(wrapper.text()).toBe(label)
    expect(wrapper.classes()).toContain(bgClass)
    expect(wrapper.classes()).toContain(`text-eod-status-${status}-foreground`)
    // Domyślne kolory prymitywu Badge są nadpisane.
    expect(wrapper.classes()).not.toContain('bg-primary')
  })
})
