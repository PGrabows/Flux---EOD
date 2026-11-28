import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type RouterHistory,
  type RouteRecordRaw,
} from 'vue-router'

import { isDemoMode } from '@/config/demo'

import { navFeatureFlags } from '@/config/features'
import AppLayout from '@/layouts/AppLayout.vue'

import type { AppRouteName } from './types'

const PlaceholderView = () => import('@/views/PlaceholderView.vue')

function placeholderRoute(path: string, name: AppRouteName, title: string): RouteRecordRaw {
  return { path, name, component: PlaceholderView, meta: { title } }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login' satisfies AppRouteName,
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Logowanie' },
  },
  {
    path: '/',
    component: AppLayout,
    // Tylko znacznik – bez guarda (patrz `RouteMeta.requiresAuth` w ./types).
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'dashboard' satisfies AppRouteName } },
      placeholderRoute('dashboard', 'dashboard', 'Pulpit'),
      {
        path: 'documents',
        name: 'documents' satisfies AppRouteName,
        component: () => import('@/views/DocumentsView.vue'),
        meta: { title: 'Dokumenty' },
      },
      // TODO(RBAC): brak uprawnienia dla budżetów w RBAC Matrix i `@/config/permissions` –
      // po dopisaniu (np. `budgets:view`) dodać `meta.permission` do obu tras budżetów.
      // Tymczasowo rejestrowana warunkowo. Docelowo (Faza 2): zawsze rejestrowana
      // z `meta.feature`, a wyłączoną funkcję obsłuży guard UX – patrz `@/config/features`.
      ...(navFeatureFlags.budgets
        ? [
            {
              path: 'budgets',
              name: 'budgets' satisfies AppRouteName,
              component: () => import('@/views/BudgetsView.vue'),
              meta: { title: 'Budżety' },
            },
            {
              // Podstrona `/budgets/…` – w sidebarze nadal podświetla się „Budżety”.
              path: 'budgets/:code',
              name: 'budget-details' satisfies AppRouteName,
              component: () => import('@/views/BudgetDetailsView.vue'),
              props: true,
              meta: { title: 'Szczegóły budżetu' },
            },
          ]
        : []),
      placeholderRoute('my-center', 'my-center', 'Moje centrum'),
      placeholderRoute('processes', 'processes', 'Procesy'),
      placeholderRoute('erp-portal', 'erp-portal', 'Portal ERP'),
      placeholderRoute('settings', 'settings', 'Ustawienia'),
      {
        path: ':pathMatch(.*)*',
        name: 'not-found' satisfies AppRouteName,
        component: () => import('@/views/NotFoundView.vue'),
        meta: { title: 'Nie znaleziono strony' },
      },
    ],
  },
]

/**
 * Build demo trafia jako pliki statyczne na serwer bez reguły „wszystko na index.html”,
 * więc używa adresów z `#` (odświeżenie `/app/#/documents` nie da 404).
 */
export function createAppHistory(): RouterHistory {
  return isDemoMode() ? createWebHashHistory() : createWebHistory(import.meta.env.BASE_URL)
}

export const router = createRouter({
  history: createAppHistory(),
  routes,
})
