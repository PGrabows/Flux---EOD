<script setup lang="ts">
import { isDemoMode } from '@/config/demo'

const visible = isDemoMode()
</script>

<template>
  <div
    v-if="visible"
    role="status"
    class="w-full bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-100"
  >
    Wersja demonstracyjna – bez backendu. Zaloguj się dowolnym loginem i hasłem; dane są
    przykładowe.
  </div>
</template>
