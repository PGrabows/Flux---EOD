import { describe, expect, it } from 'vitest'

import {
  formatAmount,
  formatAmountRange,
  formatDocumentCount,
  formatDocumentDate,
  formatFilterDateRange,
} from '../utils/format'

describe('formatDocumentDate', () => {
  it('formatuje datę i godzinę po polsku', () => {
    expect(formatDocumentDate('2026-10-28T14:32:00')).toEqual({
      date: '28 paź 2026',
      time: '14:32',
    })
    expect(formatDocumentDate('2026-01-05T09:07:00')).toEqual({ date: '5 sty 2026', time: '09:07' })
  })
})

describe('formatDocumentCount', () => {
  it.each([
    [0, '0 dokumentów'],
    [1, '1 dokument'],
    [2, '2 dokumenty'],
    [4, '4 dokumenty'],
    [5, '5 dokumentów'],
    [12, '12 dokumentów'],
    [14, '14 dokumentów'],
    [22, '22 dokumenty'],
    [112, '112 dokumentów'],
    [126, '126 dokumentów'],
  ])('%i → „%s”', (count, expected) => {
    expect(formatDocumentCount(count)).toBe(expected)
  })
})

describe('formatFilterDateRange', () => {
  it.each([
    ['2026-10-01', '2026-10-31', '01.10 \u2013 31.10.2026'],
    ['2025-12-01', '2026-01-31', '01.12.2025 \u2013 31.01.2026'],
    ['2026-10-01', null, 'od 01.10.2026'],
    [null, '2026-10-31', 'do 31.10.2026'],
    [null, null, ''],
  ] as const)('%s – %s → „%s”', (from, to, expected) => {
    expect(formatFilterDateRange(from, to)).toBe(expected)
  })
})

describe('formatAmount / formatAmountRange', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1\u00a0000'],
    [1234567.5, '1\u00a0234\u00a0567,5'],
    [2150.456, '2\u00a0150,46'],
    [12.1, '12,1'],
    [0.005, '0,01'],
    [1234567.891, '1\u00a0234\u00a0567,89'],
  ])('%d → „%s”', (amount, expected) => {
    expect(formatAmount(amount)).toBe(expected)
  })

  it('opisuje zakres, dolną lub górną granicę', () => {
    expect(formatAmountRange(1000, 5000, 'PLN')).toBe('1\u00a0000 \u2013 5\u00a0000 PLN')
    expect(formatAmountRange(1000, null, 'EUR')).toBe('od 1\u00a0000 EUR')
    expect(formatAmountRange(null, 5000, 'USD')).toBe('do 5\u00a0000 USD')
    expect(formatAmountRange(null, null, 'PLN')).toBe('')
  })
})
