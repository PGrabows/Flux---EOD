import axios from 'axios'

/**
 * Wspólny klient HTTP. Moduły w `features/<nazwa>/api` korzystają z tej instancji,
 * zamiast wywoływać axios bezpośrednio w komponentach.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
  headers: { Accept: 'application/json' },
})
