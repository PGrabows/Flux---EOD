import { describe, expect, it } from 'vitest'

import { formatPlAmount, formatResultsRange, pluralizePl } from '@/lib/format'

describe('formatPlAmount', () => {
  it.each([
    [0, '0'],
    [1000, '1\u00a0000'],
    [1234567.5, '1\u00a0234\u00a0567,5'],
    [2150.456, '2\u00a0150,46'],
    [-1340, '-1\u00a0340'],
  ])('domyślnie bez zbędnych zer: %d → „%s”', (amount, expected) => {
    expect(formatPlAmount(amount)).toBe(expected)
  })

  it.each([
    [0, '0,00'],
    [120000, '120\u00a0000,00'],
    [22693.5, '22\u00a0693,50'],
  ])('z fixedFraction: %d → „%s”', (amount, expected) => {
    expect(formatPlAmount(amount, { fixedFraction: true })).toBe(expected)
  })

  it('pozwala wybrać znak minusa', () => {
    expect(formatPlAmount(-1340, { fixedFraction: true, minusSign: '\u2212' })).toBe(
      '\u22121\u00a0340,00',
    )
  })
})

describe('pluralizePl', () => {
  const forms = ['budżet', 'budżety', 'budżetów'] as const
  it.each([
    [0, 'budżetów'],
    [1, 'budżet'],
    [2, 'budżety'],
    [5, 'budżetów'],
    [12, 'budżetów'],
    [21, 'budżetów'],
    [22, 'budżety'],
    [112, 'budżetów'],
  ])('%i → „%s”', (count, expected) => {
    expect(pluralizePl(count, forms)).toBe(expected)
  })
})

describe('formatResultsRange', () => {
  it('używa półpauzy', () => {
    expect(formatResultsRange(1, 5, 126)).toBe('Wyświetlanie 1–5 z 126')
  })
})
