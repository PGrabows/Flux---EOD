# Retrospektywa Sprintu 3

## Podsumowanie

W trakcie sprintu 3 przygotowano fundament frontendu (Vue 3 + Tailwind + shadcn-vue) i backendu (Flask), a następnie zaimplementowano pierwsze ekrany aplikacji według designu z Figmy: logowanie, sidebar oraz listę dokumentów z panelem filtrów. Sprint zamknęło wdrożenie statycznego demo frontendu na serwer dev, dostępnego z linku na stronie głównej. Frontend nie jest jeszcze połączony z backendem, dlatego demo korzysta z bypassu logowania i danych przykładowych.

Zmergowano 7 pull requestów (#27–#33), w okresie 25–28.11.2026.

## Wykonane prace

### Infrastruktura i fundament projektu
- **#27** Ujednolicono zarządzanie zależnościami: tylko npm zamiast pnpm + npm; drobne poprawki dokumentacji.
- **#28** Fundament frontendu:
  - Tailwind CSS v4, alias `@/`, shadcn-vue (tokeny motywu, `button`, `dropdown-menu`, `sonner`), lokalnie hostowany font Geist, `@lucide/vue`
  - Vue Router, Pinia, TanStack Query, wspólny klient axios (`src/api/http.ts`)
  - `AppLayout` z przełącznikiem motywu i wzorcowy feature `system-status`
  - ESLint, Prettier i Vitest uruchamiane w CI
- **#28** Backend Flask:
  - konfiguracja ze zmiennych środowiskowych; bez prawdziwego `SECRET_KEY` aplikacja nie wystartuje
  - CORS ograniczony do `CORS_ORIGINS`, `db.init_app()` / `migrate.init_app()` w fabryce aplikacji
  - endpoint `GET /api/health` z testem, job `backend` w CI
- **#28** Docker: obrazy budowane z katalogu głównego, `compose.yaml`, `.dockerignore`, Node 22, limit uploadu 16 MB w nginx; `.AGENTS.md` opisuje stack Flask/SQLAlchemy/Gemini.
- **#29** Całość przygotowanej infrastruktury trafiła do `main`.

### Frontend — ekrany aplikacji
- **#30 Logowanie** — strona `/login` z walidacją (VeeValidate + Zod), obsługa błędnych danych (401) i blokady (429/423 z `Retry-After`), moduł API `POST /api/auth/login`, prymitywy `input`, `label`, `checkbox`, niebieski kolor marki jako `--primary`. Zadania backendu opisano w `backend/AUTH_TODO.md`.
- **#31 Sidebar** — wariant rozwinięty (280 px) i zwinięty (88 px) według Figmy; przełączanie przyciskiem, railem i Ctrl/Cmd+B, stan zapamiętywany w `localStorage`; na mobile Sheet zamykany po nawigacji.
  - trasy-placeholdery (`/dashboard`, `/documents`, `/my-center`, `/processes`, `/erp-portal`, `/settings`), feature flag dla `/budgets`
  - przygotowanie pod RBAC: klucze uprawnień z matrycy w `src/config/permissions.ts`, pole `requiredPermission` w nawigacji
  - `getSafeRedirect` chroniący przekierowanie po logowaniu przed open redirect
  - bypass logowania tylko w DEV (`VITE_AUTH_BYPASS`), wycinany z buildu produkcyjnego
- **#32 Lista dokumentów** — widok `/documents` według Figmy: wyszukiwanie odporne na brak polskich znaków, filtry status/rodzaj z chipami, sortowanie, paginacja, stan pusty; dane przykładowe z `documents.json` walidowane Zod; tokeny kolorów `--eod-*`; dodatkowo migracja panelu filtrów z Figmy.

### Wdrożenie demo
- **#33** Statyczny build demo frontendu (`npm run build:demo`, `VITE_DEMO_MODE`) wgrywany na serwer dev do podkatalogu `app/`:
  - hash router i względne ścieżki zasobów, żeby demo działało bez reguł po stronie serwera
  - baner „Wersja demonstracyjna – bez backendu”, logowanie dowolnymi danymi
  - link „Przejdź do aplikacji (logowanie)” na stronie głównej
  - `deploy.yml`: nowy job `frontend` (lint, format, testy), drugi krok SCP, `verify-deployment` sprawdza link i odpowiedź `/app/`
  - zwykły build produkcyjny i obraz Dockera bez zmian

### Testy
- Liczba testów frontendu wzrosła z 3 (#28) przez 86 (#31) do 258 (#33).
- Każdy PR z kodem był sprawdzany lokalnie: lint, format, type-check, testy i build.

## Co poszło dobrze
- Ekrany są implementowane bezpośrednio z komponentów Figmy, a kolory i promienie trafiają do tokenów zamiast do komponentów.
- Konsekwentne pokrycie testami i rozbudowa CI o job frontendu.
- Bezpieczeństwo uwzględniane od początku: wymagany `SECRET_KEY`, ograniczony CORS, `getSafeRedirect`, bypass logowania wycinany z produkcji.
- Opisy PR-ów dokumentują zakres, sposób weryfikacji i rzeczy świadomie pozostawione poza zakresem.

## Co poprawić
- **#27** i **#28** zostały zmergowane bez review, kilkadziesiąt sekund po utworzeniu. Każdy PR powinien przejść review przed merge.
- **#31**, **#32** i **#33** były łańcuchem zależnych PR-ów, przez co diffy zawierały commity poprzedników. Warto mergować wcześniej albo dzielić pracę na mniejsze, niezależne kawałki.
- Część weryfikacji nie została wykonana: `docker compose up` (#28) oraz wdrożenie demo na prawdziwym VPS (#33). Tryb ciemny ekranu logowania nie został sprawdzony.
- Frontend nadal działa tylko na danych przykładowych; integracja z backendem jest największym otwartym ryzykiem.

## Plan na następny sprint
- Zaimplementować logowanie po stronie backendu (`backend/AUTH_TODO.md`) i `GET /api/auth/me`, a potem usunąć bypass logowania.
- Połączyć listę dokumentów i sidebar z API przez TanStack Query zamiast danych mock.
- Wdrożyć backend i Docker Compose na serwer dev; po tym usunąć tryb demo i skierować link na prawdziwą aplikację.
- Zweryfikować wdrożenie demo na VPS i obrazy Docker.
- Zaimplementować resztę widoków z projektu Figmy
- Dodać tryb ciemny dla aplikacji w stylowaniu
- Naprawić start backendu bez `GEMINI_API_KEY` (klient `OcrService` tworzony przy imporcie).
