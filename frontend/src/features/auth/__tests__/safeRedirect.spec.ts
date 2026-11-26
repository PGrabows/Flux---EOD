import { describe, expect, it } from 'vitest'

import { getSafeRedirect } from '@/features/auth/utils/safeRedirect'

describe('getSafeRedirect', () => {
  it.each(['/documents', '/documents/123?tab=history', '/'])('przepuszcza ścieżkę %s', (path) => {
    expect(getSafeRedirect(path)).toBe(path)
  })

  it.each([
    ['brak wartości', undefined],
    ['null', null],
    ['pusty string', ''],
    ['tablica', ['/documents', '/settings']],
    ['liczba', 42],
    ['względna ścieżka', 'documents'],
    ['protokół względny', '//evil.com'],
    ['adres absolutny', 'https://evil.com'],
    ['javascript:', 'javascript:alert(1)'],
    ['backslash', '/\\evil.com'],
    ['backslash w środku', '/documents\\..\\evil'],
    ['zakodowany backslash', '/%5Cevil.com'],
    ['zakodowane //', '/%2F/evil.com'],
    ['znak tabulacji', '/\t/evil.com'],
    ['nowa linia', '/documents\n'],
    ['zakodowany znak kontrolny', '/%09/evil.com'],
    ['niepoprawne kodowanie', '/%E0%A4%A'],
  ])('odrzuca: %s → /', (_label, raw) => {
    expect(getSafeRedirect(raw)).toBe('/')
  })
})
