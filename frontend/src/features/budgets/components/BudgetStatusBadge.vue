<script setup lang="ts">
import type { BudgetUsageStatus } from '../types'
import { BUDGET_STATUS_LABELS, BUDGET_STATUS_TONES } from '../utils/budget'
import BudgetBadge from './BudgetBadge.vue'

defineProps<{ status: BudgetUsageStatus }>()
</script>

<template>
  <BudgetBadge :tone="BUDGET_STATUS_TONES[status]" :data-status="status">
    {{ BUDGET_STATUS_LABELS[status] }}
  </BudgetBadge>
</template>
