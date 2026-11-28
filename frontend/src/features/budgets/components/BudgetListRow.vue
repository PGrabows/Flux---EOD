<script setup lang="ts">
import { BUDGET_LIST_COLUMNS } from '../styles'
import type { BudgetListRow } from '../types'
import { formatBudgetAmount } from '../utils/format'
import BudgetStatusBadge from './BudgetStatusBadge.vue'
import BudgetUsageProgress from './BudgetUsageProgress.vue'

defineProps<{ budget: BudgetListRow }>()
</script>

<template>
  <!--
    Cały wiersz jest klikalny dzięki rozciągniętemu linkowi (after:inset-0) na nazwie budżetu –
    z klawiatury to zwykły link (Tab + Enter), czytniki ekranu czytają nazwę budżetu.
  -->
  <li
    class="relative flex items-center gap-3 border-b border-eod-border py-3.5 text-[13px] leading-4 text-eod-foreground tabular-nums transition-colors last:border-b-0 focus-within:bg-eod-input hover:bg-eod-input"
    data-testid="budget-row"
  >
    <div :class="[BUDGET_LIST_COLUMNS.budget, 'flex min-w-0 flex-col gap-1']">
      <RouterLink
        :to="{ name: 'budget-details', params: { code: budget.code } }"
        class="truncate font-semibold outline-none after:absolute after:inset-0 after:rounded-sm focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
        :title="budget.name"
      >
        {{ budget.name }}
      </RouterLink>
      <span class="truncate text-xs leading-4 text-eod-muted-foreground">{{ budget.code }}</span>
    </div>
    <span :class="BUDGET_LIST_COLUMNS.limit">
      <span class="sr-only">Limit: </span>{{ formatBudgetAmount(budget.limit) }}
    </span>
    <span :class="BUDGET_LIST_COLUMNS.committed">
      <span class="sr-only">Zaangażowane: </span>{{ formatBudgetAmount(budget.committed) }}
    </span>
    <span :class="BUDGET_LIST_COLUMNS.spent">
      <span class="sr-only">Wydane: </span>{{ formatBudgetAmount(budget.spent) }}
    </span>
    <span
      :class="[
        BUDGET_LIST_COLUMNS.remaining,
        'font-semibold',
        budget.remaining < 0 ? 'text-eod-status-rejected-foreground' : undefined,
      ]"
      data-testid="budget-remaining"
    >
      <span class="sr-only">Pozostało: </span>{{ formatBudgetAmount(budget.remaining) }}
    </span>
    <div :class="BUDGET_LIST_COLUMNS.usage">
      <BudgetUsageProgress
        :percent="budget.usagePercent"
        :status="budget.status"
        :label="`Wykorzystanie budżetu ${budget.name}`"
      />
    </div>
    <div :class="BUDGET_LIST_COLUMNS.status">
      <span class="sr-only">Status: </span>
      <BudgetStatusBadge :status="budget.status" />
    </div>
  </li>
</template>
