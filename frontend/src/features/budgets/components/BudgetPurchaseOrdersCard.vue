<script setup lang="ts">
import { useId } from 'vue'

import { BUDGET_CARD_CLASS, BUDGET_CARD_TITLE_CLASS } from '../styles'
import type { PurchaseOrder } from '../types'
import { formatBudgetAmount, formatBudgetCurrency } from '../utils/format'

defineProps<{ orders: readonly PurchaseOrder[] }>()

const titleId = useId()
</script>

<template>
  <section :aria-labelledby="titleId" :class="[BUDGET_CARD_CLASS, 'flex flex-col gap-3.5 p-5']">
    <h2 :id="titleId" :class="BUDGET_CARD_TITLE_CLASS">Powiązane zamówienia PO</h2>
    <p v-if="orders.length === 0" class="text-xs leading-4 text-eod-muted-foreground">
      Brak zamówień powiązanych z tym budżetem.
    </p>
    <ul v-else class="flex flex-col">
      <li
        v-for="order in orders"
        :key="order.code"
        class="flex items-center justify-between gap-3 border-b border-eod-border py-3 first:pt-0 last:border-b-0 last:pb-0"
        data-testid="purchase-order-row"
      >
        <div class="flex min-w-0 flex-col gap-1">
          <span class="truncate text-[13px] leading-4 font-semibold text-eod-foreground">
            {{ order.code }}
          </span>
          <span class="text-xs leading-4 text-eod-muted-foreground tabular-nums">
            pozostało {{ formatBudgetAmount(order.remaining) }}
          </span>
        </div>
        <span class="shrink-0 text-[13px] leading-4 font-semibold text-eod-foreground tabular-nums">
          {{ formatBudgetCurrency(order.amount) }}
        </span>
      </li>
    </ul>
  </section>
</template>
