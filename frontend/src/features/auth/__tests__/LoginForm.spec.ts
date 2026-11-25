import { mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'vue-sonner'

import { http } from '@/api/http'
import LoginForm from '@/features/auth/components/LoginForm.vue'

vi.mock('vue-sonner', () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}))

function httpError(status: number, headers: Record<string, string> = {}) {
  const response = {
    status,
    data: {},
    headers,
    statusText: '',
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse
  return new AxiosError('Request failed', String(status), undefined, undefined, response)
}

function mountForm() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return mount(LoginForm, {
    global: { plugins: [[VueQueryPlugin, { queryClient }]] },
  })
}

async function fillAndSubmit(wrapper: ReturnType<typeof mountForm>) {
  await wrapper.get('#login-username').setValue('akowalska')
  await wrapper.get('#login-password').setValue('tajne-haslo')
  await wrapper.get('form').trigger('submit')
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe('LoginForm', () => {
  it('pokazuje błędy walidacji przy pustym formularzu', async () => {
    const post = vi.spyOn(http, 'post')
    const wrapper = mountForm()

    await wrapper.get('form').trigger('submit')

    // VeeValidate waliduje asynchronicznie, więc czekamy na wyrenderowanie błędów.
    await vi.waitFor(() => expect(wrapper.find('#login-username-error').exists()).toBe(true))
    expect(wrapper.get('#login-username-error').text()).toBe('Wpisz login.')
    expect(wrapper.get('#login-password-error').text()).toBe('Wpisz hasło.')
    expect(wrapper.get('#login-username').attributes('aria-invalid')).toBe('true')
    expect(post).not.toHaveBeenCalled()
  })

  it('wysyła dane logowania i emituje success', async () => {
    const post = vi.spyOn(http, 'post').mockResolvedValueOnce({ data: { token: 'x' } })
    const wrapper = mountForm()

    await fillAndSubmit(wrapper)

    await vi.waitFor(() => expect(wrapper.emitted('success')).toHaveLength(1))
    expect(post).toHaveBeenCalledWith('/auth/login', {
      username: 'akowalska',
      password: 'tajne-haslo',
      remember: false,
    })
  })

  it('oznacza pola i pokazuje toast przy błędnych danych (401)', async () => {
    vi.spyOn(http, 'post').mockRejectedValueOnce(httpError(401))
    const wrapper = mountForm()

    await fillAndSubmit(wrapper)

    await vi.waitFor(() => expect(wrapper.get('form').attributes('data-state')).toBe('error'))
    expect(wrapper.get('#login-username').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#login-password').attributes('aria-invalid')).toBe('true')
    expect((wrapper.get('#login-password').element as HTMLInputElement).value).toBe('')
    expect(toast.error).toHaveBeenCalledWith('Nie udało się zalogować', expect.any(Object))
    expect(wrapper.emitted('success')).toBeUndefined()
  })

  it('blokuje formularz po zbyt wielu próbach (429)', async () => {
    vi.spyOn(http, 'post').mockRejectedValueOnce(httpError(429, { 'retry-after': '900' }))
    const wrapper = mountForm()

    await fillAndSubmit(wrapper)

    await vi.waitFor(() => expect(wrapper.get('form').attributes('data-state')).toBe('locked'))
    expect(wrapper.get('fieldset').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    expect(toast.warning).toHaveBeenCalledWith(
      'Zbyt wiele prób logowania',
      expect.objectContaining({ description: expect.stringContaining('15 min') }),
    )
  })

  it('przełącza widoczność hasła', async () => {
    const wrapper = mountForm()
    const toggle = wrapper.get('button[aria-label="Pokaż hasło"]')

    await toggle.trigger('click')

    expect(wrapper.get('#login-password').attributes('type')).toBe('text')
    expect(wrapper.find('button[aria-label="Ukryj hasło"]').exists()).toBe(true)
  })
})
