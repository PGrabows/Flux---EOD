<script setup lang="ts">
import { SearchXIcon, XIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import { EOD_OUTLINE_BUTTON_CLASS } from '../styles'

defineProps<{
  title: string
  description: string
  /** Czy pokazać przycisk „Wyczyść filtry”. */
  showClear?: boolean
}>()

const emit = defineEmits<{ clear: [] }>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 px-6 py-[72px] text-center"
    data-testid="documents-empty-state"
  >
    <div
      class="flex size-14 items-center justify-center rounded-(--eod-radius-lg) bg-eod-neutral"
      aria-hidden="true"
    >
      <SearchXIcon class="size-[26px] text-eod-muted-foreground" />
    </div>
    <p class="text-base leading-5 font-semibold text-eod-foreground">{{ title }}</p>
    <p class="text-[13px] leading-4 text-eod-muted-foreground">{{ description }}</p>
    <Button
      v-if="showClear"
      variant="outline"
      :class="EOD_OUTLINE_BUTTON_CLASS"
      @click="emit('clear')"
    >
      <XIcon class="size-3.5 text-eod-primary" aria-hidden="true" />
      Wyczyść filtry
    </Button>
  </div>
</template>
