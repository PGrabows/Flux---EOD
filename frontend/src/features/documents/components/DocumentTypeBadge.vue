<script setup lang="ts">
import { Badge } from '@/components/ui/badge'

import { DOCUMENT_TYPE_LABELS } from '../constants'
import type { DocumentType } from '../types'

defineProps<{ type: DocumentType }>()
</script>

<template>
  <Badge
    class="h-auto rounded-full bg-eod-neutral px-2.5 py-[5px] text-xs leading-[14px] font-semibold text-eod-neutral-foreground"
  >
    {{ DOCUMENT_TYPE_LABELS[type] }}
  </Badge>
</template>
