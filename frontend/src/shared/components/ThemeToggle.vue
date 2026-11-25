<script setup lang="ts">
import { MonitorIcon, MoonIcon, SunIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/composables/useTheme'

const { store: mode } = useTheme()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" aria-label="Zmień motyw">
        <SunIcon class="dark:hidden" />
        <MoonIcon class="hidden dark:block" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuRadioGroup v-model="mode">
        <DropdownMenuRadioItem value="light"><SunIcon /> Jasny</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark"><MoonIcon /> Ciemny</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="auto"><MonitorIcon /> Systemowy</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
