# Logowanie — otwarte zadania backendu

Frontend formularza logowania jest gotowy (`frontend/src/features/auth`, trasa `/login`).
Poniższe punkty po stronie backendu są potrzebne, żeby logowanie działało od początku do końca.

## Kontrakt, którego oczekuje frontend

`POST /api/auth/login`

Request (JSON):

```json
{ "username": "akowalska", "password": "…", "remember": false }
```

| Odpowiedź | Znaczenie | Zachowanie frontendu |
| --- | --- | --- |
| `200` | zalogowano | przejście do `?redirect=` (tylko ścieżki wewnętrzne) albo `/` |
| `401` | zły login lub hasło | czerwone pola, wyczyszczone hasło, toast „Nie udało się zalogować” |
| `429` (lub `423`) + nagłówek `Retry-After: <sekundy>` | zbyt wiele prób | formularz zablokowany na `Retry-After` (domyślnie 15 min), toast z ostrzeżeniem |
| inny błąd / brak odpowiedzi | serwer niedostępny | toast „Serwer jest chwilowo niedostępny” |

Mapowanie odpowiedzi jest w `frontend/src/features/auth/api/auth.ts` (`toLoginError`).

## Do zrobienia

### 1. Logika logowania w `AuthService.login`

- Obecnie `backend/app/services/auth_service.py` → `login()` to TODO i zawsze zwraca `None`,
  więc endpoint zawsze odpowiada `401`.
- Docelowo: uwierzytelnienie kontem firmowym (AD/LDAPS) — tak informuje tekst formularza.
- Nie logować haseł ani tokenów; zapisywać próby logowania w logu audytowym (wymóg z AGENTS.md).

### 2. Sesja w ciasteczku HttpOnly zamiast tokenu w odpowiedzi

- Frontend **nie zapisuje** tokenu z odpowiedzi (celowo: bez `localStorage`).
- Backend powinien po udanym logowaniu ustawić ciasteczko sesyjne `HttpOnly`, `Secure`,
  `SameSite=Lax` (lub `Strict`). Klient HTTP ma już `withCredentials: true` (`frontend/src/api/http.ts`).
- `remember: true` → dłuższy czas życia sesji/ciasteczka; `false` → ciasteczko sesyjne.
- `POST /api/auth/logout` powinien unieważniać sesję i czyścić ciasteczko.
- Przy ciasteczkach rozważyć ochronę CSRF dla żądań zmieniających stan.
- Po stronie frontendu zostanie wtedy: endpoint „kim jestem” (np. `GET /api/auth/me`) i route guard
  przekierowujący niezalogowanych na `/login?redirect=…`.

### 3. Blokada po zbyt wielu próbach (rate limiting)

- Po N nieudanych próbach (per login i/lub per IP) zwracać `429` z nagłówkiem `Retry-After`
  w sekundach. Frontend pokazuje czas blokady na podstawie tego nagłówka.
- Komunikat nie powinien zdradzać, czy dany login istnieje.

### 4. Usunąć tymczasowy bypass logowania `VITE_AUTH_BYPASS` (frontend)

Dopóki `POST /api/auth/login` zawsze zwraca `401`, frontend ma w trybie dev (`npm run dev`)
flagę `VITE_AUTH_BYPASS=true`, która pomija żądanie logowania i wpuszcza do aplikacji bez sesji
(w buildzie produkcyjnym gałąź jest usuwana – `import.meta.env.DEV` = `false`). Przy aktywnym
bypassie w konsoli przeglądarki pojawia się ostrzeżenie `[auth] VITE_AUTH_BYPASS=true …`.

Po wdrożeniu logowania (pkt 1–2) bypass trzeba usunąć w całości:

- `frontend/src/features/auth/api/auth.ts` – gałąź `VITE_AUTH_BYPASS` w `login()`,
- `frontend/src/env.d.ts` – deklaracja `VITE_AUTH_BYPASS` w `ImportMetaEnv`,
- `frontend/.env.example` – wpis `VITE_AUTH_BYPASS` z komentarzem,
- `frontend/src/features/auth/__tests__/authBypass.spec.ts` – testy bypassu,
- `frontend/src/test/setup.ts` – globalny `vi.stubEnv('VITE_AUTH_BYPASS', 'false')`,
- lokalne `frontend/.env.development.local` deweloperów (plik ignorowany przez git).

Miejsca w kodzie są oznaczone `TODO(Faza 2)` – wyszukaj `AUTH_BYPASS`.
