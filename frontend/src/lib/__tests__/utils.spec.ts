import { describe, expect, it } from 'vitest'

import { getInitials } from '@/lib/utils'

describe('getInitials', () => {
  it('zwraca inicjały imienia i nazwiska', () => {
    expect(getInitials('Jan Kowalski')).toBe('JK')
  })

  it('bierze pierwszy i ostatni człon przy wielu wyrazach', () => {
    expect(getInitials('Anna Maria Nowak-Wiśniewska')).toBe('AN')
  })

  it('obsługuje pojedynczy wyraz, małe litery i polskie znaki', () => {
    expect(getInitials('łukasz')).toBe('Ł')
    expect(getInitials('  żaneta   ćwik ')).toBe('ŻĆ')
  })

  it('zwraca pusty napis dla pustej wartości', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials('   ')).toBe('')
  })
})
