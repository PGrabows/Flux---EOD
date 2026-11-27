import { describe, expect, it } from 'vitest'

import { formatDocumentCount, formatDocumentDate, formatResultsRange } from '../utils/format'

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

describe('formatResultsRange', () => {
  it('używa półpauzy', () => {
    expect(formatResultsRange(1, 5, 126)).toBe('Wyświetlanie 1–5 z 126')
  })
})
