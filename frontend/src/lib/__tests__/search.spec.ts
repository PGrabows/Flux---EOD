import { describe, expect, it } from 'vitest'

import { normalizeForSearch } from '@/lib/search'

describe('normalizeForSearch', () => {
  it('usuwa diakrytyki (także ł/Ł), ujednolica myślniki, zmniejsza litery i przycina', () => {
    expect(normalizeForSearch('  Łódź – Zażółć‐gęślą—JAŹŃ ')).toBe('lodz - zazolc-gesla-jazn')
  })
})
