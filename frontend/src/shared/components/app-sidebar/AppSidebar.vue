<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { navFeatureFlags } from '@/config/features'

import AppSidebarBrand from './AppSidebarBrand.vue'
import AppSidebarNavItem from './AppSidebarNavItem.vue'
import AppSidebarUser from './AppSidebarUser.vue'
import { getVisibleNavSections } from './navigation'
import type { SidebarUser } from './types'
import { useSidebarCounters } from './useSidebarCounters'

const props = withDefaults(
  defineProps<{
    user: SidebarUser
    /** Uprawnienia użytkownika – tylko do ukrywania pozycji (UX), nie autoryzacja. */
    permissions?: readonly string[]
  }>(),
  { permissions: () => [] },
)

const sections = computed(() =>
  getVisibleNavSections({ flags: navFeatureFlags, permissions: props.permissions }),
)
const { counters } = useSidebarCounters()

// Prymityw nie reaguje na nawigację – na mobile zamykamy Sheet po zmianie trasy.
const route = useRoute()
const { isMobile, setOpenMobile } = useSidebar()
watch(
  () => route.fullPath,
  () => {
    if (isMobile.value) setOpenMobile(false)
  },
)
</script>

<template>
  <Sidebar collapsible="icon" class="border-sidebar-border">
    <div class="flex min-h-0 flex-1 flex-col gap-4 px-4 py-5">
      <SidebarHeader class="p-0">
        <AppSidebarBrand />
      </SidebarHeader>

      <SidebarContent class="gap-0">
        <nav aria-label="Nawigacja główna">
          <template v-for="(section, index) in sections" :key="section.id">
            <SidebarSeparator v-if="index > 0" class="mx-0 my-2" />
            <div
              v-if="section.label"
              class="px-4 pt-2 pb-0.5 text-[11px] font-semibold tracking-[0.66px] text-sidebar-muted-foreground uppercase group-data-[collapsible=icon]:hidden"
              aria-hidden="true"
            >
              {{ section.label }}
            </div>
            <SidebarMenu class="gap-1.5 group-data-[collapsible=icon]:items-center">
              <AppSidebarNavItem
                v-for="item in section.items"
                :key="item.id"
                :item="item"
                :count="item.counterKey ? counters[item.counterKey] : undefined"
              />
            </SidebarMenu>
          </template>
        </nav>
      </SidebarContent>

      <SidebarFooter class="gap-4 p-0">
        <SidebarSeparator class="mx-0" />
        <AppSidebarUser :user="user" />
      </SidebarFooter>
    </div>
    <SidebarRail aria-label="Przełącz panel boczny" title="Przełącz panel boczny (Ctrl+B)" />
  </Sidebar>
</template>
