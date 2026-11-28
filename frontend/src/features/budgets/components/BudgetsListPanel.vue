<script setup lang="ts">
import { SearchXIcon, XIcon } from '@lucide/vue'
import { computed, useId } from 'vue'

import { Button } from '@/components/ui/button'
import { EOD_OUTLINE_BUTTON_CLASS } from '@/shared/styles/eod'
import { formatResultsRange } from '@/lib/format'

import { getBudgetScopeNote } from '../constants'
import { BUDGET_CARD_CLASS, BUDGET_LIST_COLUMNS } from '../styles'
import type { BudgetListRow as BudgetListRowData, BudgetListScope } from '../types'
import BudgetListRow from './BudgetListRow.vue'
import BudgetListToolbar from './BudgetListToolbar.vue'

const props = defineProps<{
  budgets: readonly BudgetListRowData[]
  scope: BudgetListScope
  total: number
  year: number
  hasQuery: boolean
}>()

const query = defineModel<string>('query', { required: true })

const emit = defineEmits<{ clear: [] }>()

const titleId = useId()

const scopeNote = computed(() => getBudgetScopeNote(props.scope))
</script>

<template>
  <section :aria-labelledby="titleId" :class="[BUDGET_CARD_CLASS, 'flex flex-col gap-3.5 p-5']">
    <BudgetListToolbar v-model:query="query" :title-id="titleId" :total="total" :year="year" />

    <p
      class="rounded-(--eod-radius-sm) bg-eod-info px-3.5 py-2.5 text-xs leading-4 text-eod-info-foreground"
    >
      {{ scopeNote }}
    </p>

    <div
      v-if="total === 0"
      class="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
      data-testid="budgets-empty-state"
    >
      <div
        class="flex size-14 items-center justify-center rounded-(--eod-radius-lg) bg-eod-neutral"
        aria-hidden="true"
      >
        <SearchXIcon class="size-[26px] text-eod-muted-foreground" />
      </div>
      <p class="text-base leading-5 font-semibold text-eod-foreground">
        {{ hasQuery ? 'Brak budżetów spełniających kryteria' : 'Brak budżetów' }}
      </p>
      <p class="text-[13px] leading-4 text-eod-muted-foreground">
        {{
          hasQuery
            ? 'Zmień frazę wyszukiwania lub wyczyść ją, aby zobaczyć wszystkie budżety.'
            : 'Nie masz dostępu do żadnego budżetu w wybranym roku.'
        }}
      </p>
      <Button
        v-if="hasQuery"
        variant="outline"
        :class="EOD_OUTLINE_BUTTON_CLASS"
        @click="emit('clear')"
      >
        <XIcon class="size-3.5 text-eod-primary" aria-hidden="true" />
        Wyczyść wyszukiwanie
      </Button>
    </div>

    <template v-else>
      <div class="overflow-x-auto">
        <div class="flex min-w-[960px] flex-col">
          <!--
            Nagłówek wizualny nad listą <ul> (nie tabela) – ukryty dla czytników ekranu, bo każda
            komórka wiersza ma własną etykietę `sr-only`.
          -->
          <div
            class="flex items-center gap-3 border-b border-eod-border pb-2.5 text-[11px] leading-4 font-medium text-eod-muted-foreground"
            aria-hidden="true"
          >
            <span :class="BUDGET_LIST_COLUMNS.budget">Budżet</span>
            <span :class="BUDGET_LIST_COLUMNS.limit">Limit</span>
            <span :class="BUDGET_LIST_COLUMNS.committed">Zaangażowane</span>
            <span :class="BUDGET_LIST_COLUMNS.spent">Wydane</span>
            <span :class="BUDGET_LIST_COLUMNS.remaining">Pozostało</span>
            <span :class="BUDGET_LIST_COLUMNS.usage">Wykorzystanie</span>
            <span :class="BUDGET_LIST_COLUMNS.status">Status</span>
          </div>
          <ul class="flex flex-col" aria-label="Budżety">
            <BudgetListRow v-for="budget in budgets" :key="budget.code" :budget="budget" />
          </ul>
        </div>
      </div>

      <p class="text-xs leading-4 text-eod-muted-foreground">
        {{ formatResultsRange(1, total, total) }}
      </p>
    </template>
  </section>
</template>
