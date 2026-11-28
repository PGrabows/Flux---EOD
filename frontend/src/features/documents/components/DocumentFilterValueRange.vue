<script setup lang="ts">
import { ref, useId, watch } from 'vue'

import { Input } from '@/components/ui/input'

import { parseAmount } from '../composables/useDocumentFilterDraft'
import { CURRENCY_OPTIONS } from '../constants'
import { EOD_FILTER_ERROR_CLASS, EOD_FILTER_FIELD_CLASS, EOD_FILTER_LABEL_CLASS } from '../styles'
import type { Currency } from '../types'
import DocumentFilterSelect from './DocumentFilterSelect.vue'

const props = defineProps<{
  currency: Currency
  /** `NaN`/`Infinity` = niepoprawny wpis (walidację i komunikat dostarcza rodzic). */
  min: number | null
  max: number | null
  error?: string
}>()

const emit = defineEmits<{
  'update:currency': [value: string]
  'update:min': [value: string]
  'update:max': [value: string]
}>()

const errorId = useId()

function toText(value: number | null): string {
  return value === null || !Number.isFinite(value) ? '' : String(value)
}

/**
 * Tekst pól trzymamy lokalnie: niepoprawny wpis (np. „1e400”) zostaje widoczny razem z błędem.
 * Z propsów synchronizujemy tylko wtedy, gdy wartość zmieniła się z zewnątrz (reset, czyszczenie).
 */
// Wartość jest trzymana tak, jak ją emituje Input (v-model na type="number" rzutuje na liczbę),
// dzięki czemu Vue nie nadpisuje widocznego tekstu (np. „1500.50” albo „1e400” → Infinity).
const minText = ref<string | number>(toText(props.min))
const maxText = ref<string | number>(toText(props.max))

function syncFromProp(text: typeof minText, value: number | null) {
  if (value !== null && !Number.isFinite(value)) return
  if (parseAmount(text.value) === value) return
  text.value = toText(value)
}

watch(
  () => props.min,
  (value) => syncFromProp(minText, value),
)
watch(
  () => props.max,
  (value) => syncFromProp(maxText, value),
)

function onMin(value: string | number) {
  minText.value = value
  emit('update:min', String(value))
}

function onMax(value: string | number) {
  maxText.value = value
  emit('update:max', String(value))
}
</script>

<template>
  <fieldset class="m-0 min-w-0 border-0 p-0">
    <legend :class="['mb-2 p-0', EOD_FILTER_LABEL_CLASS]">Wartość dokumentu</legend>
    <div class="flex gap-2">
      <DocumentFilterSelect
        :model-value="currency"
        :options="CURRENCY_OPTIONS"
        aria-label="Waluta"
        class="w-[92px] shrink-0"
        @update:model-value="(value) => emit('update:currency', value)"
      />
      <Input
        type="number"
        inputmode="decimal"
        min="0"
        step="0.01"
        placeholder="Od"
        aria-label="Wartość od"
        :model-value="minText"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? errorId : undefined"
        :class="[EOD_FILTER_FIELD_CLASS, 'min-w-0 flex-1 pl-[13px]']"
        @update:model-value="onMin"
      />
      <Input
        type="number"
        inputmode="decimal"
        min="0"
        step="0.01"
        placeholder="Do"
        aria-label="Wartość do"
        :model-value="maxText"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? errorId : undefined"
        :class="[EOD_FILTER_FIELD_CLASS, 'min-w-0 flex-1 pl-[13px]']"
        @update:model-value="onMax"
      />
    </div>
    <p v-if="error" :id="errorId" role="alert" :class="[EOD_FILTER_ERROR_CLASS, 'mt-2']">
      {{ error }}
    </p>
  </fieldset>
</template>
