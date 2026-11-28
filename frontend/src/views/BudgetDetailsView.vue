<script setup lang="ts">
import { CircleAlertIcon, SearchXIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { computed } from 'vue'

import {
  BudgetDetailsContent,
  normalizeBudgetCode,
  useBudgetDetailsQuery,
} from '@/features/budgets'
import { EOD_OUTLINE_BUTTON_CLASS } from '@/shared/styles/eod'

const props = defineProps<{ code: string }>()

/** Kod w postaci kanonicznej – `/budgets/fin-2026-01` pokazuje FIN-2026-01. */
const code = computed(() => normalizeBudgetCode(props.code))

const { data, isPending, isError, refetch } = useBudgetDetailsQuery(code)

// TODO: eksport zestawienia (PDF/XLSX) po podłączeniu API – osobne zadanie.
function onDownload() {
  toast.info('Pobieranie zestawienia jest niedostępne w wersji demonstracyjnej.')
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-6 bg-eod-page px-4 pt-9 pb-8 md:px-10">
    <section
      v-if="isPending"
      aria-busy="true"
      aria-label="Wczytywanie szczegółów budżetu"
      class="flex flex-col gap-6"
      data-testid="budget-details-loading"
    >
      <h1 class="sr-only">Szczegóły budżetu {{ code }}</h1>
      <Skeleton class="h-[72px] w-80 max-w-full rounded-(--eod-radius-md) bg-eod-neutral" />
      <Skeleton class="h-[150px] rounded-(--eod-radius-lg) bg-eod-neutral" />
      <Skeleton class="h-[300px] rounded-(--eod-radius-lg) bg-eod-neutral" />
    </section>

    <section
      v-else-if="isError && !data"
      role="alert"
      class="flex flex-col items-center gap-3 rounded-(--eod-radius-lg) border border-eod-border bg-eod-surface px-6 py-12 text-center"
    >
      <h1 class="sr-only">Szczegóły budżetu {{ code }}</h1>
      <CircleAlertIcon class="size-6 text-eod-status-rejected-foreground" aria-hidden="true" />
      <p class="text-sm font-semibold text-eod-foreground">
        Nie udało się wczytać szczegółów budżetu.
      </p>
      <Button variant="outline" :class="EOD_OUTLINE_BUTTON_CLASS" @click="refetch()">
        Spróbuj ponownie
      </Button>
    </section>

    <section
      v-else-if="!data"
      class="flex flex-col items-center gap-3 rounded-(--eod-radius-lg) border border-eod-border bg-eod-surface px-6 py-12 text-center"
      data-testid="budget-not-found"
    >
      <div
        class="flex size-14 items-center justify-center rounded-(--eod-radius-lg) bg-eod-neutral"
        aria-hidden="true"
      >
        <SearchXIcon class="size-[26px] text-eod-muted-foreground" />
      </div>
      <h1 class="text-base leading-5 font-semibold text-eod-foreground">Nie znaleziono budżetu</h1>
      <p class="text-[13px] leading-4 break-all text-eod-muted-foreground">
        Budżet o kodzie „{{ code }}” nie istnieje albo nie masz do niego dostępu.
      </p>
      <Button as-child variant="outline" :class="EOD_OUTLINE_BUTTON_CLASS">
        <RouterLink :to="{ name: 'budgets' }">Wróć do listy budżetów</RouterLink>
      </Button>
    </section>

    <BudgetDetailsContent v-else :budget="data" @download="onDownload" />
  </div>
</template>
