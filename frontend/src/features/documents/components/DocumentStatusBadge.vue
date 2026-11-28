<script setup lang="ts">
import { Badge } from '@/components/ui/badge'

import { DOCUMENT_STATUS_BADGE_CLASSES, DOCUMENT_STATUS_LABELS } from '../constants'
import type { DocumentStatus } from '../types'

defineProps<{ status: DocumentStatus }>()
</script>

<template>
  <Badge
    :data-status="status"
    :class="[
      'h-auto rounded-full px-2.5 py-[5px] text-xs leading-[14px] font-semibold',
      DOCUMENT_STATUS_BADGE_CLASSES[status],
    ]"
  >
    {{ DOCUMENT_STATUS_LABELS[status] }}
  </Badge>
</template>
