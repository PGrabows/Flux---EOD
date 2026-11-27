<script setup lang="ts">
import { XIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import type { ActiveFilterChip } from '../types'

defineProps<{ filters: readonly ActiveFilterChip[] }>()

const emit = defineEmits<{
  remove: [filter: ActiveFilterChip]
  clear: []
}>()
</script>

<template>
  <!--
    Rodzic renderuje ten rząd tylko przy co najmniej jednym chipie (status/rodzaj). Fraza
    wyszukiwania celowo nie ma chipa – jest widoczna w polu wyszukiwania, a pusty stan
    oferuje „Wyczyść filtry”.
  -->
  <div class="flex flex-wrap items-center gap-2 py-1">
    <span class="text-xs leading-4 font-medium text-eod-muted-foreground">Aktywne filtry:</span>
    <ul class="flex flex-wrap items-center gap-2">
      <li
        v-for="filter in filters"
        :key="`${filter.kind}:${filter.value}`"
        class="inline-flex items-center gap-1.5 rounded-full border border-eod-primary-soft-border bg-eod-primary-soft py-[5px] pr-2 pl-3 text-xs leading-[14px] font-semibold text-eod-primary"
        data-testid="active-filter-chip"
      >
        {{ filter.label }}
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          :aria-label="`Usuń filtr ${filter.label}`"
          @click="emit('remove', filter)"
        >
          <XIcon class="size-3" aria-hidden="true" />
        </button>
      </li>
    </ul>
    <div class="flex-1" />
    <Button
      variant="link"
      class="h-auto p-0 text-xs leading-4 font-semibold text-eod-primary"
      @click="emit('clear')"
    >
      Wyczyść filtry
    </Button>
  </div>
</template>
