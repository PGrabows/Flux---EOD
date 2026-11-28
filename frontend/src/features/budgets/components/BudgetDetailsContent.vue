<script setup lang="ts">
import { computed } from 'vue'

import { Button } from '@/components/ui/button'
import { EOD_OUTLINE_BUTTON_CLASS } from '@/shared/styles/eod'

import type { BudgetDetails } from '../types'
import { formatBudgetPeriod } from '../utils/format'
import BudgetAccessCard from './BudgetAccessCard.vue'
import BudgetBreadcrumb from './BudgetBreadcrumb.vue'
import BudgetDocumentsCard from './BudgetDocumentsCard.vue'
import BudgetInfoCard from './BudgetInfoCard.vue'
import BudgetMonthlyChart from './BudgetMonthlyChart.vue'
import BudgetPurchaseOrdersCard from './BudgetPurchaseOrdersCard.vue'
import BudgetUsageCard from './BudgetUsageCard.vue'

const props = defineProps<{ budget: BudgetDetails }>()

const emit = defineEmits<{ download: [] }>()

const meta = computed(() =>
  [
    props.budget.code,
    props.budget.department,
    props.budget.costType,
    formatBudgetPeriod(props.budget.periodStart, props.budget.periodEnd),
  ].join(' · '),
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex min-w-0 flex-col gap-1.5">
        <BudgetBreadcrumb :code="budget.code" />
        <h1 class="text-[28px] leading-[34px] font-bold text-eod-foreground">{{ budget.name }}</h1>
        <p class="text-[13px] leading-4 text-eod-muted-foreground" data-testid="budget-meta">
          {{ meta }}
        </p>
      </div>
      <Button variant="outline" :class="EOD_OUTLINE_BUTTON_CLASS" @click="emit('download')">
        Pobierz zestawienie
      </Button>
    </div>

    <BudgetUsageCard :budget="budget" />

    <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div class="flex min-w-0 flex-1 flex-col gap-6">
        <BudgetMonthlyChart :budget="budget" />
        <BudgetDocumentsCard :documents="budget.documents" />
      </div>
      <div class="flex w-full flex-col gap-6 lg:w-[340px] lg:shrink-0">
        <BudgetInfoCard :budget="budget" />
        <BudgetAccessCard :access="budget.access" />
        <BudgetPurchaseOrdersCard :orders="budget.purchaseOrders" />
      </div>
    </div>
  </div>
</template>
