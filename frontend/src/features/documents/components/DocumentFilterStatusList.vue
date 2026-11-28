<script setup lang="ts">
import { CheckIcon } from '@lucide/vue'
import { useId } from 'vue'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

import { DOCUMENT_STATUS_LABELS, DOCUMENT_STATUSES } from '../constants'
import type { DocumentStatus } from '../types'

defineProps<{
  selected: readonly DocumentStatus[]
  counts: Readonly<Record<DocumentStatus, number>>
}>()

const emit = defineEmits<{ change: [status: DocumentStatus, checked: boolean] }>()

const baseId = useId()
const checkboxId = (status: DocumentStatus) => `${baseId}-status-${status}`
const countId = (status: DocumentStatus) => `${baseId}-status-${status}-count`

function onUpdate(status: DocumentStatus, value: boolean | 'indeterminate') {
  emit('change', status, value === true)
}
</script>

<template>
  <fieldset class="m-0 min-w-0 border-0 p-0">
    <legend class="mb-2 p-0 text-xs leading-4 font-semibold text-eod-foreground">
      Status dokumentu
    </legend>
    <ul class="flex flex-col gap-2.5">
      <li v-for="status in DOCUMENT_STATUSES" :key="status" class="flex items-center gap-2.5">
        <!--
          Te same warianty (`data-checked:`) co w prymitywie – `cn` zastępuje jego kolory
          zamiast dokładać konkurencyjne klasy.
        -->
        <Checkbox
          :id="checkboxId(status)"
          :model-value="selected.includes(status)"
          :aria-describedby="countId(status)"
          class="size-[18px] rounded-[5px] border-[1.5px] border-eod-disabled bg-eod-surface data-checked:border-eod-primary data-checked:bg-eod-primary data-checked:text-white"
          @update:model-value="(value: boolean | 'indeterminate') => onUpdate(status, value)"
        >
          <CheckIcon class="size-3! text-white" :stroke-width="3" aria-hidden="true" />
        </Checkbox>
        <Label
          :for="checkboxId(status)"
          :class="[
            'cursor-pointer text-[13px] leading-4 text-eod-foreground',
            selected.includes(status) ? 'font-semibold' : 'font-medium',
          ]"
        >
          {{ DOCUMENT_STATUS_LABELS[status] }}
        </Label>
        <span class="flex-1" aria-hidden="true" />
        <span :id="countId(status)" class="text-[11px] leading-[14px] text-eod-muted-foreground">
          {{ counts[status] }}
        </span>
      </li>
    </ul>
  </fieldset>
</template>
