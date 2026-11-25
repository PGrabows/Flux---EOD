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
  const { data } = await http.post<LoginResponse>('/auth/login', payload)
  return data
}

export function useLoginMutation() {
  return useMutation({ mutationFn: login })
}
