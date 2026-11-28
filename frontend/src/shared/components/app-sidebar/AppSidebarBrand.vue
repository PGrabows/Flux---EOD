<script setup lang="ts">
import { computed } from 'vue'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'

const { open, isMobile } = useSidebar()

const triggerLabel = computed(() => {
  if (isMobile.value) return 'Zamknij panel boczny'
  return open.value ? 'Zwiń panel boczny' : 'Rozwiń panel boczny'
})
</script>

<template>
  <div
    class="flex h-13 items-center gap-3 group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2"
  >
    <div
      class="flex min-w-0 flex-1 items-center gap-3 group-data-[collapsible=icon]:w-14 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center"
    >
      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-(--eod-radius-sm) bg-sidebar-primary text-lg font-bold text-sidebar-primary-foreground"
        aria-hidden="true"
      >
        F
      </span>
      <span class="truncate text-base font-bold group-data-[collapsible=icon]:hidden">
        FLUXIS EOD
      </span>
    </div>
    <!-- W Figmie w tym miejscu jest przełącznik motywu – pominięty w tym zakresie. -->
    <SidebarTrigger
      class="text-sidebar-muted-foreground"
      :aria-label="triggerLabel"
      :aria-expanded="isMobile ? undefined : open"
    />
  </div>
</template>
