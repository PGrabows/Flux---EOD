<script setup lang="ts">
import { ArrowRightIcon, FileTextIcon } from '@lucide/vue'
import { computed } from 'vue'

import { Button } from '@/components/ui/button'

import type { DocumentListItem } from '../types'
import { formatDocumentDate } from '../utils/format'
import DocumentStatusBadge from './DocumentStatusBadge.vue'
import DocumentTypeBadge from './DocumentTypeBadge.vue'
import { EOD_OUTLINE_BUTTON_CLASS } from '../styles'
import { DOCUMENT_LIST_COLUMNS } from './documentListColumns'

const props = defineProps<{ document: DocumentListItem }>()

const emit = defineEmits<{ details: [id: string] }>()

const modified = computed(() => formatDocumentDate(props.document.modifiedAt))
</script>

<template>
  <li
    class="flex h-[72px] items-center gap-4 rounded-(--eod-radius-md) border border-eod-border bg-eod-surface pr-3.5 pl-4"
    data-testid="document-row"
  >
    <div
      :class="[
        DOCUMENT_LIST_COLUMNS.icon,
        'flex size-10 items-center justify-center rounded-(--eod-radius-sm) bg-eod-primary-soft',
      ]"
      aria-hidden="true"
    >
      <FileTextIcon class="size-5 text-eod-primary" />
    </div>

    <div :class="[DOCUMENT_LIST_COLUMNS.document, 'flex min-w-0 flex-col gap-1']">
      <span
        class="truncate text-sm leading-[18px] font-semibold text-eod-foreground"
        :title="document.title"
      >
        {{ document.title }}
      </span>
      <span class="truncate text-[11px] leading-[14px] text-eod-muted-foreground">
        {{ document.number }}
      </span>
    </div>

    <div :class="DOCUMENT_LIST_COLUMNS.type">
      <DocumentTypeBadge :type="document.type" />
    </div>

    <div :class="[DOCUMENT_LIST_COLUMNS.author, 'flex min-w-0 flex-col gap-1']">
      <span
        class="truncate text-[13px] leading-4 font-semibold text-eod-foreground"
        :title="document.author.name"
      >
        {{ document.author.name }}
      </span>
      <span
        class="truncate text-[11px] leading-[14px] text-eod-muted-foreground"
        :title="document.author.department"
      >
        {{ document.author.department }}
      </span>
    </div>

    <time
      :datetime="document.modifiedAt"
      :class="[DOCUMENT_LIST_COLUMNS.modifiedAt, 'flex flex-col gap-1']"
    >
      <span class="text-[13px] leading-4 font-medium text-eod-foreground">
        {{ modified.date }}
      </span>
      <span class="text-[11px] leading-[14px] text-eod-muted-foreground">{{ modified.time }}</span>
    </time>

    <div :class="DOCUMENT_LIST_COLUMNS.status">
      <DocumentStatusBadge :status="document.status" />
    </div>

    <div class="flex-1" />

    <Button
      variant="outline"
      :class="[EOD_OUTLINE_BUTTON_CLASS, 'pr-3.5 pl-4']"
      :aria-label="`Szczegóły dokumentu ${document.number}`"
      @click="emit('details', document.id)"
    >
      Szczegóły
      <ArrowRightIcon class="size-3.5 text-eod-primary" aria-hidden="true" />
    </Button>
  </li>
</template>
