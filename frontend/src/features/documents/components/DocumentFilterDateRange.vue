<script setup lang="ts">
import { CalendarIcon } from '@lucide/vue'
import { computed, useId } from 'vue'

import { Input } from '@/components/ui/input'

import { EOD_FILTER_ERROR_CLASS, EOD_FILTER_FIELD_CLASS, EOD_FILTER_LABEL_CLASS } from '../styles'

const props = defineProps<{
  /** `YYYY-MM-DD` albo surowy (niepoprawny) wpis – walidację robi rodzic. */
  from: string | null
  to: string | null
  error?: string
}>()

const emit = defineEmits<{
  'update:from': [value: string]
  'update:to': [value: string]
}>()

/** Górna granica natywnego pickera – bez niej Chromium przyjmuje lata 5- i 6-cyfrowe. */
const MAX_DATE = '9999-12-31'
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const errorId = useId()

// Wzajemne min/max tylko z poprawnych dat – surowy wpis nie może zablokować pickera.
const fromMax = computed(() => (props.to && ISO_DATE.test(props.to) ? props.to : MAX_DATE))
const toMin = computed(() => (props.from && ISO_DATE.test(props.from) ? props.from : undefined))

const fields = computed(() => [
  {
    key: 'from' as const,
    label: 'Data rejestracji od',
    value: props.from ?? '',
    min: undefined,
    max: fromMax.value,
  },
  {
    key: 'to' as const,
    label: 'Data rejestracji do',
    value: props.to ?? '',
    min: toMin.value,
    max: MAX_DATE,
  },
])

function onUpdate(key: 'from' | 'to', value: string | number) {
  if (key === 'from') emit('update:from', String(value))
  else emit('update:to', String(value))
}

/**
 * Natywny wskaźnik Chromium jest niewidoczny, ale rozciągnięty na całe pole – klik w dowolne
 * miejsce otwiera picker, a widoczna pozostaje tylko ikona lucide.
 */
const pickerIndicatorClass =
  '[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0'
</script>

<template>
  <fieldset class="m-0 min-w-0 border-0 p-0">
    <legend :class="['mb-2 p-0', EOD_FILTER_LABEL_CLASS]">Data rejestracji</legend>
    <div class="flex gap-2">
      <div v-for="field in fields" :key="field.key" class="relative min-w-0 flex-1">
        <!-- z-10: ikona nad polem (pole jest pozycjonowane względem wskaźnika pickera). -->
        <CalendarIcon
          class="pointer-events-none absolute top-1/2 left-[13px] z-10 size-3.5 -translate-y-1/2 text-eod-primary"
          aria-hidden="true"
        />
        <Input
          type="date"
          :aria-label="field.label"
          :model-value="field.value"
          :min="field.min"
          :max="field.max"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? errorId : undefined"
          :class="[EOD_FILTER_FIELD_CLASS, 'relative pl-8', pickerIndicatorClass]"
          @update:model-value="(value) => onUpdate(field.key, value)"
        />
      </div>
    </div>
    <p v-if="error" :id="errorId" role="alert" :class="[EOD_FILTER_ERROR_CLASS, 'mt-2']">
      {{ error }}
    </p>
  </fieldset>
</template>
