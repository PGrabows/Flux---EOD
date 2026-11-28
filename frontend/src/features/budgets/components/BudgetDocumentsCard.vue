<script setup lang="ts">
import { useId } from 'vue'

import {
  BUDGET_CARD_CLASS,
  BUDGET_CARD_TITLE_CLASS,
  BUDGET_DOCUMENT_COLUMNS,
  BUDGET_LINK_CLASS,
} from '../styles'
import type { BudgetBadgeTone, BudgetDocument, BudgetDocumentStatus } from '../types'
import { formatBudgetAmount } from '../utils/format'
import BudgetBadge from './BudgetBadge.vue'

defineProps<{ documents: readonly BudgetDocument[] }>()

const titleId = useId()

const STATUS_LABELS: Record<BudgetDocumentStatus, string> = {
  'in-approval': 'W akceptacji',
  posted: 'Zaksięgowany',
}

const STATUS_TONES: Record<BudgetDocumentStatus, BudgetBadgeTone> = {
  'in-approval': 'warning',
  posted: 'success',
}
</script>

<template>
  <section :aria-labelledby="titleId" :class="[BUDGET_CARD_CLASS, 'flex flex-col gap-3.5 p-5']">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 :id="titleId" :class="BUDGET_CARD_TITLE_CLASS">Dokumenty obciążające budżet</h2>
      <!-- TODO: przekazać `query: { budget: code }`, gdy lista dokumentów dostanie filtr budżetu. -->
      <RouterLink :to="{ name: 'documents' }" :class="BUDGET_LINK_CLASS">
        Zobacz wszystkie <span aria-hidden="true">→</span>
      </RouterLink>
    </div>

    <p
      v-if="documents.length === 0"
      class="py-6 text-center text-[13px] leading-4 text-eod-muted-foreground"
    >
      Żaden dokument nie obciąża jeszcze tego budżetu.
    </p>

    <div v-else class="overflow-x-auto">
      <div class="flex min-w-[560px] flex-col">
        <div
          class="flex items-center gap-3 border-b border-eod-border pb-2.5 text-[11px] leading-4 font-medium text-eod-muted-foreground"
          aria-hidden="true"
        >
          <span :class="BUDGET_DOCUMENT_COLUMNS.document">Dokument</span>
          <span :class="BUDGET_DOCUMENT_COLUMNS.contractor">Kontrahent</span>
          <span :class="BUDGET_DOCUMENT_COLUMNS.amount">Kwota brutto</span>
          <span :class="BUDGET_DOCUMENT_COLUMNS.status">Status</span>
        </div>
        <ul class="flex flex-col" aria-label="Dokumenty obciążające budżet">
          <li
            v-for="document in documents"
            :key="document.id"
            class="flex items-center gap-3 border-b border-eod-border py-3.5 text-[13px] leading-4 text-eod-foreground last:border-b-0"
            data-testid="budget-document-row"
          >
            <div :class="[BUDGET_DOCUMENT_COLUMNS.document, 'flex min-w-0 flex-col gap-1']">
              <span class="truncate font-semibold" :title="document.title">
                {{ document.title }}
              </span>
              <span class="truncate text-xs leading-4 text-eod-muted-foreground">
                {{ document.reference }}
              </span>
            </div>
            <span
              :class="[BUDGET_DOCUMENT_COLUMNS.contractor, 'truncate']"
              :title="document.contractor"
            >
              <span class="sr-only">Kontrahent: </span>{{ document.contractor }}
            </span>
            <span :class="[BUDGET_DOCUMENT_COLUMNS.amount, 'font-semibold tabular-nums']">
              <span class="sr-only">Kwota brutto: </span
              >{{ formatBudgetAmount(document.grossAmount) }}
            </span>
            <div :class="BUDGET_DOCUMENT_COLUMNS.status">
              <span class="sr-only">Status: </span>
              <BudgetBadge :tone="STATUS_TONES[document.status]" :data-status="document.status">
                {{ STATUS_LABELS[document.status] }}
              </BudgetBadge>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
