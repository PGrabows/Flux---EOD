import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

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
      placeholderRoute('documents', 'documents', 'Dokumenty'),
      // Tymczasowo rejestrowana warunkowo. Docelowo (Faza 2): zawsze rejestrowana
      // z `meta.feature`, a wyłączoną funkcję obsłuży guard UX – patrz `@/config/features`.
      ...(navFeatureFlags.budgets ? [placeholderRoute('budgets', 'budgets', 'Budżety')] : []),
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

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
