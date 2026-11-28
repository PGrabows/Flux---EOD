<script setup lang="ts">
import { useId } from 'vue'

import { Separator } from '@/components/ui/separator'

import { useDocumentList } from '../composables/useDocumentList'
import type { DocumentListItem } from '../types'
import { formatResultsRange } from '../utils/format'
import DocumentActiveFilters from './DocumentActiveFilters.vue'
import DocumentFiltersSheet from './DocumentFiltersSheet.vue'
import DocumentListHeader from './DocumentListHeader.vue'
import DocumentListToolbar from './DocumentListToolbar.vue'
import DocumentRow from './DocumentRow.vue'
import DocumentsEmptyState from './DocumentsEmptyState.vue'
import DocumentsPagination from './DocumentsPagination.vue'

const props = defineProps<{ documents: readonly DocumentListItem[] }>()

const emit = defineEmits<{ details: [id: string] }>()

const titleId = useId()

const list = useDocumentList(() => props.documents)
const {
  query,
  filters,
  sortDirection,
  page,
  total,
  pageItems,
  rangeStart,
  rangeEnd,
  paginationItems,
  activeFilters,
  activeFilterCount,
  hasActiveFilters,
  isEmpty,
  canPrev,
  canNext,
} = list
</script>

<template>
  <section
    :aria-labelledby="titleId"
    class="flex flex-col gap-2 rounded-(--eod-radius-lg) border border-eod-border bg-eod-surface px-[18px] py-3"
  >
    <DocumentListToolbar
      v-model:query="query"
      :title-id="titleId"
      :total="total"
      :sort-direction="sortDirection"
      @update:sort-direction="list.setSortDirection"
    >
      <template #filters>
        <DocumentFiltersSheet
          :documents="documents"
          :query="query"
          :applied="filters"
          :active-count="activeFilterCount"
          @apply="list.applyFilters"
        />
      </template>
    </DocumentListToolbar>

    <Separator class="bg-eod-border" />

    <DocumentActiveFilters
      v-if="activeFilters.length > 0"
      :filters="activeFilters"
      @remove="list.removeFilter"
      @clear="list.clearFilters"
    />

    <DocumentsEmptyState
      v-if="isEmpty"
      v-bind="
        hasActiveFilters
          ? {
              title: 'Brak dokumentów spełniających kryteria',
              description:
                'Zmień kryteria wyszukiwania lub wyczyść filtry, aby zobaczyć wszystkie dokumenty.',
              showClear: true,
            }
          : {
              title: 'Brak dokumentów',
              description: 'Nie dodano jeszcze żadnych dokumentów.',
              showClear: false,
            }
      "
      @clear="list.clearFilters"
    />

    <template v-else>
      <div class="overflow-x-auto">
        <div class="flex min-w-[1040px] flex-col gap-2">
          <DocumentListHeader
            :sort-direction="sortDirection"
            @toggle-sort="list.toggleSortDirection"
          />
          <ul class="flex flex-col gap-2" aria-label="Dokumenty">
            <DocumentRow
              v-for="document in pageItems"
              :key="document.id"
              :document="document"
              @details="emit('details', $event)"
            />
          </ul>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 pt-1">
        <p class="text-[11px] leading-[14px] text-eod-muted-foreground">
          {{ formatResultsRange(rangeStart, rangeEnd, total) }}
        </p>
        <div class="flex-1" />
        <DocumentsPagination
          :page="page"
          :items="paginationItems"
          :can-prev="canPrev"
          :can-next="canNext"
          @go-to-page="list.goToPage"
          @prev="list.prevPage"
          @next="list.nextPage"
        />
      </div>
    </template>
  </section>
</template>
