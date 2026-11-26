/**
 * Prezentacyjny model użytkownika dla stopki panelu. Sidebar (shared) nie zależy
 * od `@/features/auth` – layout mapuje `CurrentUser` na ten kształt.
 */
export interface SidebarUser {
  displayName: string
  roleLabel: string
}
