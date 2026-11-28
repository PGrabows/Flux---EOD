<script setup lang="ts">
import { CircleAlertIcon } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BudgetKpiCards,
  BudgetsListPanel,
  getBudgetsSubtitle,
  parseBudgetYear,
  useBudgetList,
  useBudgetsQuery,
} from '@/features/budgets'
import { EOD_OUTLINE_BUTTON_CLASS } from '@/shared/styles/eod'

const route = useRoute()

/** Rok listy – z `?year=` (np. link z innego widoku), domyślnie rok danych demo. */
const year = computed(() => parseBudgetYear(route.query.year))

const { data, isPending, isError, refetch } = useBudgetsQuery(year)

const { query, totals, filtered, total, hasQuery, clearQuery } = useBudgetList(
  () => data.value?.budgets ?? [],
)

const subtitle = computed(() => (data.value ? getBudgetsSubtitle(data.value.scope) : ''))
</script>

<template>
  <div class="flex flex-1 flex-col gap-6 bg-eod-page px-4 pt-9 pb-8 md:px-10">
    <div class="flex flex-col gap-1.5">
      <h1 class="text-[28px] leading-[34px] font-bold text-eod-foreground">Budżety</h1>
      <p
        v-if="subtitle"
        class="text-[13px] leading-4 text-eod-muted-foreground"
        data-testid="budgets-subtitle"
      >
        {{ subtitle }}
      </p>
    </div>

    <section
      v-if="isPending"
      aria-busy="true"
      aria-label="Wczytywanie budżetów"
      class="flex flex-col gap-4"
      data-testid="budgets-loading"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton
          v-for="index in 4"
          :key="index"
          class="h-[98px] rounded-(--eod-radius-lg) bg-eod-neutral"
        />
      </div>
      <Skeleton class="h-[420px] rounded-(--eod-radius-lg) bg-eod-neutral" />
    </section>

    <!-- Błąd odświeżenia przy istniejących danych nie chowa listy. -->
    <section
      v-else-if="isError && !data"
      role="alert"
      class="flex flex-col items-center gap-3 rounded-(--eod-radius-lg) border border-eod-border bg-eod-surface px-6 py-12 text-center"
    >
      <CircleAlertIcon class="size-6 text-eod-status-rejected-foreground" aria-hidden="true" />
      <p class="text-sm font-semibold text-eod-foreground">Nie udało się wczytać budżetów.</p>
      <Button variant="outline" :class="EOD_OUTLINE_BUTTON_CLASS" @click="refetch()">
        Spróbuj ponownie
      </Button>
    </section>

    <template v-else-if="data">
      <BudgetKpiCards :totals="totals" :year="year" />
      <BudgetsListPanel
        v-model:query="query"
        :budgets="filtered"
        :scope="data.scope"
        :total="total"
        :year="year"
        :has-query="hasQuery"
        @clear="clearQuery"
      />
    </template>
  </div>
</template>
