import { useMutation } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'

import { http } from '@/api/http'

export interface LoginPayload {
  username: string
  password: string
  remember: boolean
}

export interface LoginResponse {
  token?: string
}

/** Rodzaj błędu logowania rozpoznawany przez formularz. */
export type LoginErrorKind = 'invalid-credentials' | 'locked' | 'unknown'

export interface LoginError {
  kind: LoginErrorKind
  /** Czas blokady w sekundach (nagłówek `Retry-After`), jeśli backend go podał. */
  retryAfterSeconds?: number
}

export function toLoginError(error: unknown): LoginError {
  if (!isAxiosError(error) || !error.response) return { kind: 'unknown' }

  const { status, headers } = error.response
  if (status === 401) return { kind: 'invalid-credentials' }
  if (status === 429 || status === 423) {
    const retryAfter = Number(headers['retry-after'])
    return {
      kind: 'locked',
      retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
    }
  }
  return { kind: 'unknown' }
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // TODO(Faza 2): usunąć po wdrożeniu backend auth
  // Bypass dla lokalnego developmentu i statycznego buildu demo (bez backendu), dopóki backend
  // zawsze zwraca 401. Nic nie trafia do storage. W zwykłym buildzie produkcyjnym
  // `import.meta.env.DEV` to stała `false`, a `VITE_DEMO_MODE` nie jest ustawione – gałąź
  // jest usuwana przy minifikacji (warunek celowo inline, bez funkcji pomocniczej).
  if (
    (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') &&
    import.meta.env.VITE_AUTH_BYPASS === 'true'
  ) {
    console.warn('[auth] VITE_AUTH_BYPASS=true – pominięto logowanie w backendzie (dev/demo).')
    return {}
  }

  const { data } = await http.post<LoginResponse>('/auth/login', payload)
  return data
}

export function useLoginMutation() {
  return useMutation({ mutationFn: login })
}
