<script setup lang="ts">
import { ArrowUpDownIcon, ChevronDownIcon, SearchIcon } from '@lucide/vue'
import type { AcceptableValue } from 'reka-ui'
import { computed } from 'vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { SortDirection } from '../types'
import { formatDocumentCount } from '../utils/format'
import { EOD_OUTLINE_BUTTON_CLASS } from '../styles'

const props = defineProps<{
  /** `id` nagłówka panelu – wskazywany przez `aria-labelledby` sekcji. */
  titleId: string
  total: number
  sortDirection: SortDirection
}>()

const query = defineModel<string>('query', { required: true })

const emit = defineEmits<{
  'update:sortDirection': [direction: SortDirection]
}>()

const countLabel = computed(() => formatDocumentCount(props.total))

function onSortChange(value: AcceptableValue) {
  if (value === 'asc' || value === 'desc') emit('update:sortDirection', value)
}

const menuItemClass = 'text-[13px] text-eod-foreground'
const menuLabelClass = 'text-[11px] font-semibold text-eod-muted-foreground'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="flex flex-col gap-0.5">
      <h2 :id="titleId" class="text-base leading-5 font-semibold text-eod-foreground">
        Lista dokumentów
      </h2>
      <p
        class="text-[11px] leading-[14px] text-eod-muted-foreground"
        aria-live="polite"
        data-testid="documents-count"
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
        aria-label="Szukaj dokumentów po nazwie lub numerze"
        placeholder="Szukaj po nazwie lub numerze…"
        autocomplete="off"
        class="h-10 rounded-(--eod-radius-sm) border-eod-border bg-eod-input pr-[13px] pl-9 text-xs text-eod-foreground placeholder:text-eod-muted-foreground md:text-xs"
      />
    </div>

    <!--
      Slot wymagany przez DocumentsListPanel: wstawia tu przycisk „Filtry” z panelem
      (DocumentFiltersSheet). Bez niego lista nie ma dostępu do filtrów.
    -->
    <slot name="filters" />

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" :class="EOD_OUTLINE_BUTTON_CLASS">
          <ArrowUpDownIcon class="size-3.5 text-eod-primary" aria-hidden="true" />
          Sortuj: Data modyfikacji
          <ChevronDownIcon class="size-3.5 text-eod-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuLabel :class="menuLabelClass">Data modyfikacji</DropdownMenuLabel>
        <DropdownMenuRadioGroup :model-value="sortDirection" @update:model-value="onSortChange">
          <DropdownMenuRadioItem value="desc" :class="menuItemClass">
            Od najnowszych
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="asc" :class="menuItemClass">
            Od najstarszych
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
