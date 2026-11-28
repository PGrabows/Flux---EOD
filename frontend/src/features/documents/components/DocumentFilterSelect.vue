<script setup lang="ts">
import { ChevronDownIcon } from '@lucide/vue'
import { cn } from 'cn'
import type { HTMLAttributes } from 'vue'

import type { FilterOption } from '../types'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id?: string
  /** Pusty tekst = brak wyboru (opcja z `placeholder`). */
  modelValue: string
  options: readonly FilterOption[]
  /** Etykieta opcji „brak wyboru”; bez niej select nie ma pustej opcji. */
  placeholder?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div :class="cn('relative', props.class)">
    <!-- Natywny <select>: pełna obsługa klawiatury i czytników ekranu bez dodatkowych zależności. -->
    <select
      :id="id"
      v-bind="$attrs"
      :value="modelValue"
      :disabled="disabled"
      :class="[
        'h-10 w-full appearance-none rounded-(--eod-radius-sm) border border-eod-border bg-eod-surface pr-8 pl-[13px] text-[13px] leading-4 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-eod-input disabled:text-eod-disabled',
        modelValue === ''
          ? 'font-normal text-eod-muted-foreground'
          : 'font-medium text-eod-foreground',
      ]"
      @change="onChange"
    >
      <option v-if="placeholder !== undefined" value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        class="font-medium text-eod-foreground"
      >
        {{ option.label }}
      </option>
    </select>
    <ChevronDownIcon
      class="pointer-events-none absolute top-1/2 right-[13px] size-3.5 -translate-y-1/2 text-eod-muted-foreground"
      aria-hidden="true"
    />
  </div>
</template>
