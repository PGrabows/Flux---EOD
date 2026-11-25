<script setup lang="ts">
import { RefreshCwIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { useHealthQuery } from '@/features/system-status/api/health'

const { isPending, isError, isFetching, refetch } = useHealthQuery()

async function check() {
  const result = await refetch()
  if (result.isError) toast.error('API jest niedostępne')
  else toast.success('API działa poprawnie')
}
</script>

<template>
  <div class="flex items-center gap-3 rounded-lg border p-4" aria-live="polite">
    <span
      class="size-2.5 rounded-full"
      :class="isPending ? 'bg-muted-foreground' : isError ? 'bg-destructive' : 'bg-green-500'"
      aria-hidden="true"
    />
    <span class="text-sm" data-testid="api-status">
      {{ isPending ? 'Sprawdzanie API…' : isError ? 'API niedostępne' : 'API działa' }}
    </span>
    <Button variant="outline" size="sm" class="ml-auto" :disabled="isFetching" @click="check">
      <RefreshCwIcon :class="{ 'animate-spin': isFetching }" />
      Sprawdź ponownie
    </Button>
  </div>
</template>
