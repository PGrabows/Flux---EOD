/** Zalogowany użytkownik – kształt zgodny z przyszłym `GET /api/auth/me`. */
export interface CurrentUser {
  id: string
  fullName: string
  /**
   * Nazwa roli do wyświetlenia (po polsku). Docelowo z backendu albo z mapowania
   * kodów `roles` na etykiety.
   */
  roleLabel: string
  /** Kody ról z `docs/RBAC_Permissions_Matrix.md`, np. `SysAdmin`, `DocManager`. */
  roles: string[]
  /**
   * Kody uprawnień (suma uprawnień ról), np. `users:view`. Po stronie klienta tylko
   * do UX – autoryzacja zawsze na serwerze.
   */
  permissions: string[]
}
