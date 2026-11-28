<script setup lang="ts">
import { computed } from 'vue'

import { BUDGET_CARD_CLASS } from '../styles'
import type { BudgetTotals } from '../types'
import { formatBudgetCount, formatBudgetCurrency } from '../utils/format'

const props = defineProps<{ totals: BudgetTotals; year: number }>()

type KpiTone = 'default' | 'primary' | 'negative'

/** Ujemna suma „pozostało” (przekroczone budżety) – ten sam czerwony co ujemne kwoty w tabeli. */
const TONE_CLASSES: Record<KpiTone, string> = {
  default: 'text-eod-foreground',
  primary: 'text-eod-primary',
  negative: 'text-eod-status-rejected-foreground',
}

interface KpiCard {
  id: string
  label: string
  value: string
  description: string
  tone: KpiTone
}

const cards = computed<KpiCard[]>(() => [
  {
    id: 'limit',
    label: 'Łączny limit',
    value: formatBudgetCurrency(props.totals.limit),
    description: `${formatBudgetCount(props.totals.count)} · rok ${props.year}`,
    tone: 'default',
  },
  {
    id: 'spent',
    label: 'Wydane',
    value: formatBudgetCurrency(props.totals.spent),
    description: `${props.totals.spentPercent}% limitu`,
    tone: 'default',
  },
  {
    id: 'committed',
    label: 'Zaangażowane',
    value: formatBudgetCurrency(props.totals.committed),
    description: 'dokumenty w obiegu',
    tone: 'default',
  },
  {
    id: 'remaining',
    label: 'Pozostało do dyspozycji',
    value: formatBudgetCurrency(props.totals.remaining),
    description: `${props.totals.remainingPercent}% limitu`,
    tone: props.totals.remaining < 0 ? 'negative' : 'primary',
  },
])
</script>

<template>
  <ul
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    aria-label="Podsumowanie budżetów"
  >
    <li
      v-for="card in cards"
      :key="card.id"
      :class="[BUDGET_CARD_CLASS, 'flex min-w-0 flex-col gap-1 p-5']"
      :data-testid="`budget-kpi-${card.id}`"
    >
      <span class="text-xs leading-4 font-medium text-eod-muted-foreground">{{ card.label }}</span>
      <span
        :class="['text-[22px] leading-7 font-semibold tabular-nums', TONE_CLASSES[card.tone]]"
        data-testid="budget-kpi-value"
      >
        {{ card.value }}
      </span>
      <span class="text-xs leading-4 text-eod-muted-foreground">{{ card.description }}</span>
    </li>
  </ul>
</template>
