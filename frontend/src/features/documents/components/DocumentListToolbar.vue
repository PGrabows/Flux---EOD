<script setup lang="ts">
import { ArrowUpDownIcon, ChevronDownIcon, ListFilterIcon, SearchIcon } from '@lucide/vue'
import type { AcceptableValue } from 'reka-ui'
import { computed } from 'vue'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUSES,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPES,
} from '../constants'
import type { DocumentStatus, DocumentType, SortDirection } from '../types'
import { formatDocumentCount } from '../utils/format'
import { EOD_OUTLINE_BUTTON_CLASS } from '../styles'

const props = defineProps<{
  /** `id` nagłówka panelu – wskazywany przez `aria-labelledby` sekcji. */
  titleId: string
  total: number
  statuses: readonly DocumentStatus[]
  types: readonly DocumentType[]
  sortDirection: SortDirection
}>()

const query = defineModel<string>('query', { required: true })

const emit = defineEmits<{
  'update:status': [status: DocumentStatus, checked: boolean]
  'update:type': [type: DocumentType, checked: boolean]
  'update:sortDirection': [direction: SortDirection]
}>()

const countLabel = computed(() => formatDocumentCount(props.total))

function onSortChange(value: AcceptableValue) {
  if (value === 'asc' || value === 'desc') emit('update:sortDirection', value)
}

/** Pozostawia menu otwarte, by można było zaznaczyć kilka filtrów naraz. */
function keepOpen(event: Event) {
  event.preventDefault()
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

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" :class="EOD_OUTLINE_BUTTON_CLASS">
          <ListFilterIcon class="size-3.5 text-eod-primary" aria-hidden="true" />
          Filtry
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel :class="menuLabelClass">Status</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            v-for="status in DOCUMENT_STATUSES"
            :key="status"
            :class="menuItemClass"
            :model-value="statuses.includes(status)"
            @update:model-value="(checked: boolean) => emit('update:status', status, checked)"
            @select="keepOpen"
          >
            {{ DOCUMENT_STATUS_LABELS[status] }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel :class="menuLabelClass">Rodzaj</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            v-for="type in DOCUMENT_TYPES"
            :key="type"
            :class="menuItemClass"
            :model-value="types.includes(type)"
            @update:model-value="(checked: boolean) => emit('update:type', type, checked)"
            @select="keepOpen"
          >
            {{ DOCUMENT_TYPE_LABELS[type] }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>

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
