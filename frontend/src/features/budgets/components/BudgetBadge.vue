<script setup lang="ts">
import { Badge } from '@/components/ui/badge'

import type { BudgetBadgeTone } from '../types'

defineProps<{ tone: BudgetBadgeTone }>()

/** Pełne, statyczne nazwy klas – Tailwind musi je znaleźć w kodzie źródłowym. */
const TONE_CLASSES: Record<BudgetBadgeTone, string> = {
  success: 'bg-eod-status-approved text-eod-status-approved-foreground',
  warning: 'bg-eod-status-in-approval text-eod-status-in-approval-foreground',
  danger: 'bg-eod-status-rejected text-eod-status-rejected-foreground',
}
</script>

<template>
  <Badge
    :data-tone="tone"
    :class="[
      'h-auto rounded-full px-2.5 py-1 text-[11px] leading-[14px] font-semibold',
      TONE_CLASSES[tone],
    ]"
  >
    <slot />
  </Badge>
</template>
