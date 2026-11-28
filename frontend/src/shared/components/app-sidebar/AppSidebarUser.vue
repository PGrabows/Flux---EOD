<script setup lang="ts">
import { Settings } from '@lucide/vue'
import { computed } from 'vue'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getInitials } from '@/lib/utils'

import type { SidebarUser } from './types'

const props = defineProps<{ user: SidebarUser }>()

const { state, isMobile } = useSidebar()

/** Na mobile panel jest zawsze pełny (Sheet), niezależnie od stanu desktopowego. */
const isCollapsed = computed(() => state.value === 'collapsed' && !isMobile.value)
const initials = computed(() => getInitials(props.user.displayName))
const userLabel = computed(() => `${props.user.displayName}, ${props.user.roleLabel}`)
</script>

<template>
  <div
    data-testid="sidebar-user"
    :data-variant="isCollapsed ? 'collapsed' : 'expanded'"
    :class="isCollapsed ? 'flex flex-col items-center gap-2' : 'flex h-15 items-center gap-2.5'"
  >
    <Avatar
      class="size-9"
      role="img"
      :aria-label="userLabel"
      :title="isCollapsed ? userLabel : undefined"
      :class="isCollapsed ? 'order-2' : undefined"
    >
      <AvatarFallback
        class="bg-sidebar-accent text-xs font-semibold text-sidebar-primary"
        aria-hidden="true"
      >
        {{ initials }}
      </AvatarFallback>
    </Avatar>

    <div v-if="!isCollapsed" class="flex min-w-0 flex-1 flex-col" aria-hidden="true">
      <span class="truncate text-[13px] font-semibold">{{ user.displayName }}</span>
      <span class="truncate text-[11px] text-sidebar-muted-foreground">{{ user.roleLabel }}</span>
    </div>

    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          as-child
          variant="ghost"
          size="icon"
          class="size-9 rounded-(--eod-radius-sm) text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          :class="isCollapsed ? 'order-1' : undefined"
        >
          <RouterLink :to="{ name: 'settings' }" aria-label="Ustawienia">
            <Settings class="size-5" aria-hidden="true" />
          </RouterLink>
        </Button>
      </TooltipTrigger>
      <TooltipContent :side="isCollapsed ? 'right' : 'top'">Ustawienia</TooltipContent>
    </Tooltip>
  </div>
</template>
