<script setup lang="ts">
import { computed, useId } from 'vue'

import { BUDGET_CARD_CLASS, BUDGET_CARD_TITLE_CLASS } from '../styles'
import type { BudgetDetails } from '../types'
import { formatBudgetPeriod } from '../utils/format'

const props = defineProps<{ budget: BudgetDetails }>()

const titleId = useId()

const items = computed(() => [
  { label: 'Właściciel budżetu', value: props.budget.owner },
  { label: 'Dział', value: props.budget.department },
  { label: 'Okres', value: formatBudgetPeriod(props.budget.periodStart, props.budget.periodEnd) },
  { label: 'Rodzaj kosztów', value: props.budget.costType },
])
</script>

<template>
  <section :aria-labelledby="titleId" :class="[BUDGET_CARD_CLASS, 'flex flex-col gap-3.5 p-5']">
    <h2 :id="titleId" :class="BUDGET_CARD_TITLE_CLASS">Informacje</h2>
    <dl class="flex flex-col gap-3.5">
      <div v-for="item in items" :key="item.label" class="flex flex-col gap-1">
        <dt class="text-[11px] leading-[14px] font-medium text-eod-muted-foreground">
          {{ item.label }}
        </dt>
        <dd class="text-[13px] leading-4 font-semibold text-eod-foreground">{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>
