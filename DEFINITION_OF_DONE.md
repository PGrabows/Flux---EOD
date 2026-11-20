# Definition of Done

Przyrost uznajemy za ukończony tylko wtedy, gdy wszystkie poniższe warunki są spełnione. Każdy warunek można sprawdzić jednym spojrzeniem albo jednym poleceniem.

## Warunki ukończenia

- [ ] Pull Request został zatwierdzony przez co najmniej jedną osobę inną niż autor — sprawdzamy w zakładce PR.
- [ ] Build aplikacji w GitHub Actions zakończył się sukcesem — sprawdzamy zielony status `build`.
- [ ] Kryteria akceptacji powiązanej historyjki zostały spełnione — sprawdzamy opis zgłoszenia i zakres zmian w PR.
- [ ] Strona główna odpowiada na serwerze deweloperskim:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://<adres-serwera>/
```

Oczekiwany wynik: `200`.

- [ ] Strona pokazuje skrót commita wdrożonego z gałęzi `main`:

```bash
git fetch && curl -s http://<adres-serwera>/ | grep "$(git rev-parse --short=7 origin/main)"
```

- [ ] W zmianach nie ma haseł, kluczy prywatnych ani plików `.env` — sprawdzamy diff PR.
- [ ] Dokumentacja została zaktualizowana, jeśli zmiana wpływa na konfigurację, sposób uruchomienia albo wdrożenie.

Niespełnienie dowolnego warunku oznacza, że przyrost nie jest gotowy do zaprezentowania.
