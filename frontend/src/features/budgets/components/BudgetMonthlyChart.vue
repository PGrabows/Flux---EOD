<script setup lang="ts">
import { computed, useId } from 'vue'

import { BUDGET_CARD_CLASS, BUDGET_CARD_TITLE_CLASS } from '../styles'
import type { BudgetDetails } from '../types'
import { getMonthlyBars } from '../utils/budget'
import {
  formatBudgetCurrency,
  formatMonthName,
  formatMonthShort,
  formatThousands,
} from '../utils/format'

const props = defineProps<{ budget: BudgetDetails }>()

const titleId = useId()

const bars = computed(() => getMonthlyBars(props.budget))
</script>

<template>
  <section :aria-labelledby="titleId" :class="[BUDGET_CARD_CLASS, 'flex flex-col gap-4 p-5']">
    <div class="flex flex-col gap-1">
      <h2 :id="titleId" :class="BUDGET_CARD_TITLE_CLASS">Wydatki miesięczne {{ budget.year }}</h2>
      <p class="text-xs leading-4 text-eod-muted-foreground">
        Zaksięgowane oraz zaangażowane w obiegu
      </p>
    </div>

    <div class="overflow-x-auto">
      <ol
        class="flex h-[168px] min-w-[440px] items-stretch gap-2.5"
        aria-label="Wydatki w miesiącach"
      >
        <li
          v-for="bar in bars"
          :key="bar.month"
          class="flex flex-1 flex-col items-center justify-end gap-1.5"
          :aria-current="bar.isCurrent ? 'date' : undefined"
          data-testid="monthly-bar"
        >
          <span class="sr-only">
            {{ formatMonthName(bar.month) }}: {{ formatBudgetCurrency(bar.amount) }}
            {{ bar.isCurrent ? '(bieżący miesiąc)' : '' }}
          </span>
          <span
            class="text-[10px] leading-3 whitespace-nowrap text-eod-muted-foreground"
            aria-hidden="true"
          >
            {{ formatThousands(bar.amount) }}
          </span>
          <span
            :class="[
              'w-7 shrink-0 rounded-md',
              bar.isCurrent ? 'bg-eod-primary-muted' : 'bg-eod-primary',
            ]"
            :style="{ height: `${bar.height}px` }"
            aria-hidden="true"
            data-testid="monthly-bar-fill"
          />
          <span
            :class="[
              'text-[11px] leading-[14px]',
              bar.isCurrent ? 'font-semibold text-eod-primary' : 'text-eod-muted-foreground',
            ]"
            aria-hidden="true"
          >
            {{ formatMonthShort(bar.month) }}
          </span>
        </li>
      </ol>
    </div>
  </section>
</template>
