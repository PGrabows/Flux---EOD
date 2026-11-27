<script setup lang="ts">
import { ArrowDownIcon, ArrowUpIcon } from '@lucide/vue'
import { computed } from 'vue'

import type { SortDirection } from '../types'
import { DOCUMENT_LIST_COLUMNS } from './documentListColumns'

const props = defineProps<{ sortDirection: SortDirection }>()

const emit = defineEmits<{ 'toggle-sort': [] }>()

const sortLabel = computed(() =>
  props.sortDirection === 'desc'
    ? 'Data modyfikacji, sortowanie od najnowszych. Zmień na od najstarszych'
    : 'Data modyfikacji, sortowanie od najstarszych. Zmień na od najnowszych',
)
</script>

<template>
  <!--
    Nagłówek wizualny nad listą <ul> (nie tabela), więc bez ról row/columnheader i aria-sort –
    stan sortowania przekazuje etykieta przycisku.
  -->
  <div
    class="flex items-center gap-4 py-1 pr-3.5 pl-4 text-[11px] leading-4 font-semibold text-eod-muted-foreground"
  >
    <span :class="DOCUMENT_LIST_COLUMNS.icon" aria-hidden="true" />
    <span :class="DOCUMENT_LIST_COLUMNS.document">Dokument</span>
    <span :class="DOCUMENT_LIST_COLUMNS.type">Typ</span>
    <span :class="DOCUMENT_LIST_COLUMNS.author">Autor</span>
    <span :class="DOCUMENT_LIST_COLUMNS.modifiedAt">
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-sm text-eod-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        :aria-label="sortLabel"
        @click="emit('toggle-sort')"
      >
        Data modyfikacji
        <ArrowDownIcon v-if="sortDirection === 'desc'" class="size-3" aria-hidden="true" />
        <ArrowUpIcon v-else class="size-3" aria-hidden="true" />
      </button>
    </span>
    <span :class="DOCUMENT_LIST_COLUMNS.status">Status</span>
    <span class="flex-1" aria-hidden="true" />
    <span :class="DOCUMENT_LIST_COLUMNS.action" aria-hidden="true" />
  </div>
</template>
