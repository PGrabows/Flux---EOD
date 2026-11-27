<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import type { PaginationItem } from '../types'

defineProps<{
  page: number
  items: readonly PaginationItem[]
  canPrev: boolean
  canNext: boolean
}>()

const emit = defineEmits<{
  'go-to-page': [page: number]
  prev: []
  next: []
}>()

const baseClass =
  'size-7 rounded-(--eod-radius-xs) p-0 text-xs leading-4 font-medium text-eod-muted-foreground hover:bg-eod-neutral hover:text-eod-foreground disabled:opacity-100'
</script>

<template>
  <nav aria-label="Paginacja listy dokumentów">
    <ul class="flex items-center gap-1">
      <li>
        <Button
          variant="ghost"
          :class="[baseClass, 'disabled:text-eod-disabled']"
          aria-label="Poprzednia strona"
          :disabled="!canPrev"
          @click="emit('prev')"
        >
          <ChevronLeftIcon class="size-3.5" aria-hidden="true" />
        </Button>
      </li>
      <li v-for="(item, index) in items" :key="item === 'ellipsis' ? `ellipsis-${index}` : item">
        <span
          v-if="item === 'ellipsis'"
          class="flex size-7 items-center justify-center text-xs leading-4 font-medium text-eod-muted-foreground"
          aria-hidden="true"
        >
          …
        </span>
        <Button
          v-else
          variant="ghost"
          :class="[
            baseClass,
            item === page &&
              'bg-eod-primary-soft font-semibold text-eod-primary hover:bg-eod-primary-soft hover:text-eod-primary',
          ]"
          :aria-label="`Strona ${item}`"
          :aria-current="item === page ? 'page' : undefined"
          @click="emit('go-to-page', item)"
        >
          {{ item }}
        </Button>
      </li>
      <li>
        <Button
          variant="ghost"
          :class="[baseClass, 'disabled:text-eod-disabled']"
          aria-label="Następna strona"
          :disabled="!canNext"
          @click="emit('next')"
        >
          <ChevronRightIcon class="size-3.5" aria-hidden="true" />
        </Button>
      </li>
    </ul>
  </nav>
</template>
