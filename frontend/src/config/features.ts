/**
 * Flagi funkcji aplikacji – wspólne źródło dla routera i nawigacji.
 *
 * Docelowy wzorzec (Faza 2): trasy są rejestrowane zawsze, z `meta.feature`
 * i/lub `meta.permission`, a wyłączone funkcje obsługuje guard UX routera
 * (np. przekierowanie na not-found). Na razie trasa `/budgets` jest jeszcze
 * rejestrowana warunkowo na podstawie flagi.
 */
export interface NavFeatureFlags {
  budgets: boolean
}

export const navFeatureFlags: Readonly<NavFeatureFlags> = {
  // Widoki budżetów (lista i szczegóły) na danych demo – bez backendu (TODO Faza 3: API).
  budgets: true,
}
