import { describe, expect, it } from 'vitest'

import { NBSP } from '@/lib/format'

import {
  formatBudgetAmount,
  formatBudgetCount,
  formatBudgetCurrency,
  formatBudgetDate,
  formatBudgetPeriod,
  formatMonthShort,
  formatThousands,
} from '../utils/format'

const withSpaces = (value: string) => value.replaceAll(NBSP, ' ')

describe('format budżetów', () => {
  it('kwoty zawsze z dwoma miejscami po przecinku i minusem U+2212', () => {
    expect(withSpaces(formatBudgetAmount(120_000))).toBe('120 000,00')
    expect(withSpaces(formatBudgetAmount(22_693.5))).toBe('22 693,50')
    expect(withSpaces(formatBudgetAmount(0))).toBe('0,00')
    expect(withSpaces(formatBudgetAmount(-1_340))).toBe('\u22121 340,00')
    expect(withSpaces(formatBudgetCurrency(94_216.5))).toBe('94 216,50 PLN')
  })

  it('skrót tysięcy na wykresie', () => {
    expect(withSpaces(formatThousands(11_970))).toBe('12 tys.')
    expect(withSpaces(formatThousands(4_490))).toBe('4,5 tys.')
    expect(withSpaces(formatThousands(22_693.5))).toBe('22,7 tys.')
    expect(formatThousands(0)).toBe('0')
    expect(withSpaces(formatThousands(30))).toBe('<0,1 tys.')
    expect(withSpaces(formatThousands(50))).toBe('0,1 tys.')
  })

  it.each([
    [1, '1 budżet'],
    [2, '2 budżety'],
    [5, '5 budżetów'],
    [12, '12 budżetów'],
    [22, '22 budżety'],
  ])('liczba budżetów %d → %s', (count, label) => {
    expect(formatBudgetCount(count)).toBe(label)
  })

  it('okres i data stanu po polsku', () => {
    expect(formatBudgetPeriod('2026-01-01', '2026-12-31')).toBe('1 sty – 31 gru 2026')
    expect(formatBudgetPeriod('2025-12-01', '2026-11-30')).toBe('1 gru 2025 – 30 lis 2026')
    expect(formatBudgetDate('2026-11-18')).toBe('18 lis 2026')
  })

  it('skróty miesięcy', () => {
    expect(formatMonthShort(1)).toBe('Sty')
    expect(formatMonthShort(10)).toBe('Paź')
    expect(formatMonthShort(13)).toBe('')
  })
})
