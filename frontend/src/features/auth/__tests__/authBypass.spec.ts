import { afterEach, describe, expect, it, vi } from 'vitest'

import { http } from '@/api/http'
import { login } from '@/features/auth/api/auth'

const payload = { username: 'akowalska', password: 'tajne-haslo', remember: false }

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('login – bypass dev (TODO Faza 2)', () => {
  it('w trybie dev z VITE_AUTH_BYPASS=true zwraca sukces bez żądania HTTP', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_AUTH_BYPASS', 'true')
    const post = vi.spyOn(http, 'post')
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await expect(login(payload)).resolves.toEqual({})
    expect(post).not.toHaveBeenCalled()
    expect(setItem).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledOnce()
  })

  it('bez flagi wysyła żądanie do backendu', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_AUTH_BYPASS', 'false')
    const post = vi.spyOn(http, 'post').mockResolvedValueOnce({ data: {} })

    await login(payload)
    expect(post).toHaveBeenCalledWith('/auth/login', payload)
  })

  it('poza trybem dev ignoruje flagę i wysyła żądanie', async () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_AUTH_BYPASS', 'true')
    const post = vi.spyOn(http, 'post').mockResolvedValueOnce({ data: {} })

    await login(payload)
    expect(post).toHaveBeenCalledWith('/auth/login', payload)
  })
})
