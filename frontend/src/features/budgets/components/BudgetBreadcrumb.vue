<script setup lang="ts">
import { ChevronLeftIcon } from '@lucide/vue'

import { BUDGET_LINK_CLASS } from '../styles'

defineProps<{ code: string }>()
</script>

<template>
  <nav aria-label="Ścieżka nawigacji">
    <ol class="flex items-center gap-1.5 text-xs leading-4 font-semibold text-eod-primary">
      <li>
        <RouterLink
          :to="{ name: 'budgets' }"
          :class="[BUDGET_LINK_CLASS, 'inline-flex items-center gap-0.5']"
        >
          <ChevronLeftIcon class="size-3.5" aria-hidden="true" />
          Budżety
        </RouterLink>
      </li>
      <li aria-hidden="true">/</li>
      <li aria-current="page">{{ code }}</li>
    </ol>
  </nav>
</template>
