<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

import type { SidebarNavItem } from './navigation'

const props = defineProps<{
  item: SidebarNavItem
  count?: number
}>()

const route = useRoute()
const router = useRouter()

const targetPath = computed(() => router.resolve(props.item.to).path)

/** Aktywna także na podstronach, np. `/documents/123` podświetla „Dokumenty”. */
const isActive = computed(
  () => route.path === targetPath.value || route.path.startsWith(`${targetPath.value}/`),
)

const hasCount = computed(() => props.count !== undefined && props.count > 0)

const accessibleLabel = computed(() =>
  hasCount.value ? `${props.item.label}, liczba elementów: ${props.count}` : props.item.label,
)
</script>

<template>
  <SidebarMenuItem>
    <SidebarMenuButton
      as-child
      :is-active="isActive"
      :tooltip="item.label"
      class="h-12 gap-3 rounded-(--eod-radius-md) px-3.5 text-sm font-medium text-sidebar-muted-foreground data-active:font-semibold [&_svg]:size-6 group-data-[collapsible=icon]:size-auto! group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:w-14! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
    >
      <RouterLink
        :to="item.to"
        :aria-label="accessibleLabel"
        :aria-current="isActive ? 'page' : undefined"
      >
        <component
          :is="item.icon"
          :class="isActive ? 'text-sidebar-primary' : undefined"
          aria-hidden="true"
        />
        <span class="flex-1 truncate group-data-[collapsible=icon]:hidden">{{ item.label }}</span>
        <span
          v-if="hasCount"
          data-testid="nav-badge"
          class="inline-flex shrink-0 items-center justify-center rounded-full bg-sidebar-accent px-1.75 py-0.75 text-[11px] leading-none font-semibold text-sidebar-primary tabular-nums group-data-[collapsible=icon]:hidden"
          aria-hidden="true"
        >
          {{ count }}
        </span>
      </RouterLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
</template>
