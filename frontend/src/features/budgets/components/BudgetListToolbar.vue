<script setup lang="ts">
import { SearchIcon } from '@lucide/vue'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EOD_OUTLINE_BUTTON_CLASS } from '@/shared/styles/eod'

import { formatBudgetCount } from '../utils/format'

const props = defineProps<{
  /** `id` nagłówka panelu – wskazywany przez `aria-labelledby` sekcji. */
  titleId: string
  total: number
  year: number
}>()

const query = defineModel<string>('query', { required: true })

const countLabel = computed(() => `${formatBudgetCount(props.total)} · rok ${props.year}`)

// TODO: wybór roku po podłączeniu API – dane demo obejmują tylko jeden rok.
function onYearClick() {
  toast.info(`Wersja demonstracyjna zawiera tylko budżety na rok ${props.year}.`)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="flex flex-col gap-0.5">
      <h2 :id="titleId" class="text-base leading-5 font-semibold text-eod-foreground">
        Lista budżetów
      </h2>
      <p
        class="text-xs leading-4 text-eod-muted-foreground"
        aria-live="polite"
        data-testid="budgets-count"
      >
        {{ countLabel }}
      </p>
    </div>

    <div class="flex-1" />

    <div class="relative w-80 max-w-full">
      <SearchIcon
        class="pointer-events-none absolute top-1/2 left-[13px] size-3.5 -translate-y-1/2 text-eod-muted-foreground"
        aria-hidden="true"
      />
      <Input
        v-model="query"
        type="search"
        aria-label="Szukaj budżetów po nazwie lub kodzie"
        placeholder="Szukaj po nazwie lub kodzie…"
        autocomplete="off"
        class="h-10 rounded-(--eod-radius-sm) border-eod-border bg-eod-input pr-[13px] pl-9 text-xs text-eod-foreground placeholder:text-eod-muted-foreground md:text-xs"
      />
    </div>

    <Button variant="outline" :class="EOD_OUTLINE_BUTTON_CLASS" @click="onYearClick">
      Rok: {{ year }}
    </Button>
  </div>
</template>
