<script setup lang="ts">
import { computed } from 'vue'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useCurrentUser } from '@/features/auth'
import { AppSidebar, type SidebarUser, useSidebarOpenState } from '@/shared/components/app-sidebar'

const sidebarOpen = useSidebarOpenState()

// Layout łączy feature auth z prezentacyjnym sidebarem (shared nie importuje z features).
const { user } = useCurrentUser()
const sidebarUser = computed<SidebarUser>(() => ({
  displayName: user.value.fullName,
  roleLabel: user.value.roleLabel,
}))

// Szerokości z Figmy. Inline style nadpisuje domyślne wartości prymitywu
// (atrybuty przekazane do SidebarProvider są scalane po jego własnym `style`).
const sidebarStyle = {
  '--sidebar-width': '280px',
  '--sidebar-width-icon': '88px',
}
</script>

<template>
  <SidebarProvider v-model:open="sidebarOpen" :style="sidebarStyle">
    <AppSidebar :user="sidebarUser" :permissions="user.permissions" />
    <SidebarInset>
      <header class="flex h-14 items-center gap-2 border-b px-4 md:hidden">
        <SidebarTrigger aria-label="Otwórz menu nawigacji" />
        <span class="text-base font-bold">FLUXIS EOD</span>
      </header>
      <div class="flex flex-1 flex-col">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
