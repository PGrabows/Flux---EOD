<script setup lang="ts">
import { computed, useId } from 'vue'

import committedDotUrl from '../assets/legend-dot-committed.svg'
import remainingDotUrl from '../assets/legend-dot-remaining.svg'
import spentDotUrl from '../assets/legend-dot-spent.svg'
import { BUDGET_CARD_CLASS, BUDGET_CARD_TITLE_CLASS } from '../styles'
import type { BudgetDetails } from '../types'
import {
  getBudgetRemaining,
  getBudgetUsagePercent,
  getBudgetUsageStatus,
  getUsageBarSegments,
} from '../utils/budget'
import { formatBudgetCurrency, formatBudgetDate } from '../utils/format'
import BudgetStatusBadge from './BudgetStatusBadge.vue'

const props = defineProps<{ budget: BudgetDetails }>()

const titleId = useId()

const remaining = computed(() => getBudgetRemaining(props.budget))
const status = computed(() => getBudgetUsageStatus(props.budget))
const segments = computed(() => getUsageBarSegments(props.budget))
const barLabel = computed(
  () =>
    `Wykorzystano ${getBudgetUsagePercent(props.budget)}% limitu: wydane ` +
    `${formatBudgetCurrency(props.budget.spent)}, zaangażowane ` +
    `${formatBudgetCurrency(props.budget.committed)}.`,
)

type LegendTone = 'default' | 'primary' | 'negative'

interface LegendItem {
  id: string
  label: string
  /** Kropka legendy – SVG z Figmy (8×8); `null` – pozycja bez kropki (Limit). */
  dot: string | null
  value: number
  tone: LegendTone
}

const legend = computed<LegendItem[]>(() => [
  { id: 'spent', label: 'Wydane', dot: spentDotUrl, value: props.budget.spent, tone: 'default' },
  {
    id: 'committed',
    label: 'Zaangażowane',
    dot: committedDotUrl,
    value: props.budget.committed,
    tone: 'default',
  },
  {
    id: 'remaining',
    label: 'Pozostało do dyspozycji',
    dot: remainingDotUrl,
    value: remaining.value,
    tone: remaining.value < 0 ? 'negative' : 'primary',
  },
  { id: 'limit', label: 'Limit', dot: null, value: props.budget.limit, tone: 'default' },
])

const VALUE_TONE_CLASSES: Record<LegendTone, string> = {
  default: 'text-eod-foreground',
  primary: 'text-eod-primary',
  negative: 'text-eod-status-rejected-foreground',
}
</script>

<template>
  <section :aria-labelledby="titleId" :class="[BUDGET_CARD_CLASS, 'flex flex-col gap-3.5 p-6']">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex flex-col gap-1">
        <h2 :id="titleId" :class="BUDGET_CARD_TITLE_CLASS">Wykorzystanie budżetu</h2>
        <p class="text-xs leading-4 text-eod-muted-foreground">
          Stan na {{ formatBudgetDate(budget.asOf) }}
        </p>
      </div>
      <BudgetStatusBadge :status="status" />
    </div>

    <div
      role="img"
      :aria-label="barLabel"
      class="flex h-3.5 w-full overflow-hidden rounded-[7px] bg-eod-border"
    >
      <div
        class="h-full bg-eod-primary"
        :style="{ width: `${segments.spent}%` }"
        data-testid="usage-bar-spent"
      />
      <div
        class="h-full bg-eod-primary-muted"
        :style="{ width: `${segments.committed}%` }"
        data-testid="usage-bar-committed"
      />
    </div>

    <dl class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div v-for="item in legend" :key="item.id" class="flex min-w-0 flex-col gap-1">
        <dt
          class="flex items-center gap-1.5 text-xs leading-4 font-medium text-eod-muted-foreground"
        >
          <img v-if="item.dot" :src="item.dot" width="8" height="8" alt="" class="shrink-0" />
          {{ item.label }}
        </dt>
        <dd
          :class="['text-base leading-5 font-semibold tabular-nums', VALUE_TONE_CLASSES[item.tone]]"
          :data-testid="`usage-legend-${item.id}`"
        >
          {{ formatBudgetCurrency(item.value) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
