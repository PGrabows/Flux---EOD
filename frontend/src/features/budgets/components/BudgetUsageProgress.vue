<script setup lang="ts">
import { computed } from 'vue'

import type { BudgetUsageStatus } from '../types'
import { BUDGET_PROGRESS_FILL_CLASSES } from '../utils/budget'

const props = defineProps<{
  percent: number
  status: BudgetUsageStatus
  /** Dostępna nazwa paska, np. „Wykorzystanie budżetu Szkolenia i rozwój”. */
  label: string
}>()

const width = computed(() => `${Math.min(Math.max(props.percent, 0), 100)}%`)
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      role="progressbar"
      :aria-valuenow="Math.min(Math.max(percent, 0), 100)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuetext="`${percent}% limitu`"
      :aria-label="label"
      class="h-1.5 w-20 shrink-0 overflow-hidden rounded-[3px] bg-eod-border"
    >
      <div
        :class="['h-full rounded-[3px]', BUDGET_PROGRESS_FILL_CLASSES[status]]"
        :style="{ width }"
        data-testid="budget-progress-fill"
      />
    </div>
    <span class="text-xs leading-4 font-medium text-eod-muted-foreground tabular-nums">
      {{ percent }}%
    </span>
  </div>
</template>
