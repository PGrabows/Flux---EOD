# Definition of Done (DoD)

## 1. Cel dokumentu

Definition of Done określa minimalne wymagania jakościowe i techniczne, które muszą zostać spełnione, aby przyrost systemu Elektronicznego Obiegu Dokumentów (EOD) został uznany za ukończony.

Definicja obowiązuje wszystkich członków zespołu i dotyczy funkcjonalności realizowanych w ramach Sprintów.

## 2. Wymagania funkcjonalne

- [ ] Funkcjonalność została zaimplementowana zgodnie z wymaganiami User Story.
- [ ] Wszystkie kryteria akceptacji przypisane do User Story zostały spełnione.
- [ ] Funkcjonalność została przetestowana pod kątem poprawności działania.
- [ ] Obsłużono podstawowe przypadki błędów i nieprawidłowych danych wejściowych.
- [ ] Zmiany nie powodują regresji istniejących funkcjonalności.

## 3. Jakość kodu

- [ ] Kod jest czytelny i zgodny z przyjętymi konwencjami projektu.
- [ ] Usunięto zbędny kod, komentarze debugujące i tymczasowe rozwiązania.
- [ ] Projekt kompiluje się i uruchamia bez błędów.
- [ ] Zmiany zostały poddane Code Review przez co najmniej jednego innego członka zespołu.
- [ ] Zmiany zostały połączone z główną gałęzią repozytorium poprzez Pull Request.

## 4. Testowanie

- [ ] Wykonano testy odpowiednie do zakresu wprowadzonych zmian.
- [ ] Istniejące testy automatyczne zakończyły się sukcesem.
- [ ] Zweryfikowano komunikację między frontendem, backendem i bazą danych, jeżeli zmiany dotyczą tych komponentów.
- [ ] Nie występują znane błędy krytyczne uniemożliwiające korzystanie z funkcjonalności.

## 5. Bezpieczeństwo

- [ ] Dostęp do funkcjonalności jest zgodny z przyjętym modelem ról i uprawnień.
- [ ] Dane wejściowe są walidowane po stronie backendu.
- [ ] W repozytorium nie znajdują się hasła, tokeny, klucze API ani inne dane poufne.
- [ ] Nowe endpointy API są odpowiednio zabezpieczone, jeżeli wymagają uwierzytelnienia.
- [ ] Funkcjonalność nie ujawnia danych użytkownikom bez odpowiednich uprawnień.

## 6. Wdrożenie i dostępność

- [ ] Zmiany zostały wdrożone na serwerze VPS przeznaczonym dla projektu.
- [ ] Aplikacja jest dostępna pod ustalonym adresem serwera.
- [ ] Wdrożona wersja zawiera wszystkie funkcjonalności zadeklarowane jako ukończone w danym przyroście.
- [ ] Frontend poprawnie komunikuje się z backendem.
- [ ] Połączenie z bazą danych działa prawidłowo.
- [ ] Kontenery Docker wymagane do działania aplikacji są uruchomione i działają poprawnie.
- [ ] Podstawowe scenariusze użytkownika zostały zweryfikowane na wdrożonej wersji aplikacji.

## 7. Dokumentacja

- [ ] W razie potrzeby zaktualizowano dokumentację techniczną projektu.
- [ ] Zmiany wymagające konfiguracji zostały opisane w dokumentacji.
- [ ] Zaktualizowano dokumentację API, jeżeli zmodyfikowano jego interfejs.
- [ ] Zgłoszenie w Jira zawiera informacje umożliwiające weryfikację wykonanej pracy.

## 8. Akceptacja przyrostu

Przyrost produktu uznaje się za ukończony, gdy:

1. Wszystkie dotyczące go wymagania Definition of Done zostały spełnione.
2. Funkcjonalności są zintegrowane z aktualną wersją systemu.
3. Przyrost został wdrożony i działa pod ustalonym adresem serwera.
4. Zespół zweryfikował poprawność działania wdrożonej wersji.
5. Przyrost jest gotowy do zaprezentowania podczas Sprint Review.

**Niespełnienie któregokolwiek z obowiązujących kryteriów oznacza, że dany element nie może zostać uznany za Done.**

Kryteria dotyczące określonych komponentów, np. bazy danych, API lub kontenerów Docker, stosuje się wyłącznie wtedy, gdy mają zastosowanie do zakresu realizowanej zmiany.
