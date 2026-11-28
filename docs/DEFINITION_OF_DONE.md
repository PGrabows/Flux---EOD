# Definition of Done

Przyrost uznajemy za ukończony tylko wtedy, gdy wszystkie poniższe warunki są spełnione. Każdy warunek można sprawdzić jednym spojrzeniem albo jednym poleceniem.

## Sposób oznaczania odpowiedzialności

- **pipeline** — warunek sprawdza automatycznie wskazany job GitHub Actions.
- **reguła ochrony** — warunek wymusza konfiguracja chronionej gałęzi `main`.
- **człowiek** — warunek sprawdza wskazana osoba w opisanej sytuacji.

## Warunki ukończenia

- [ ] **reguła ochrony — wymagane 1 zatwierdzenie PR:** Pull Request został zatwierdzony przez co najmniej jedną osobę inną niż autor.
- [ ] **pipeline — job `build`:** build aplikacji w GitHub Actions zakończył się sukcesem.
- [ ] **pipeline — job `test`:** testy aplikacji i wygenerowanego `../dist/index.html` zakończyły się sukcesem.
- [ ] **pipeline — job `lint`:** lint plików źródłowych zakończył się sukcesem.
- [ ] **człowiek — Jakub Janowski/QA podczas przeglądu PR:** kryteria akceptacji powiązanej historyjki Jiry zostały spełnione.
- [ ] **pipeline — job `verify-deployment`:** strona główna odpowiada na serwerze deweloperskim kodem HTTP `200`.
- [ ] **pipeline — job `verify-deployment`:** strona pokazuje 7 pierwszych znaków skrótu commita wdrożonego z gałęzi `main`.
- [ ] **człowiek — recenzent PR podczas przeglądu diffa:** w zmianach nie ma haseł, kluczy prywatnych ani plików `.env`.
- [ ] **człowiek — autor PR i recenzent przed zatwierdzeniem:** dokumentacja została zaktualizowana, jeśli zmiana wpływa na konfigurację, sposób uruchomienia albo wdrożenie.

## Polecenia pomocnicze

Sprawdzenie odpowiedzi serwera:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://<adres-serwera>/
```

Oczekiwany wynik: `200`.

Sprawdzenie skrótu commita:

```bash
git fetch && curl -s http://<adres-serwera>/ | grep "$(git rev-parse --short=7 origin/main)"
```

Niespełnienie dowolnego warunku oznacza, że przyrost nie jest gotowy do zaprezentowania.
