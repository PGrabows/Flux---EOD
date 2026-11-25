<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

import { LoginForm } from '@/features/auth'

const route = useRoute()
const router = useRouter()

function onSuccess() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  // Tylko ścieżki wewnętrzne – bez otwartego przekierowania na obce domeny.
  router.replace(redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/')
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/60 px-4 py-10">
    <div class="flex items-center gap-2.5">
      <span
        class="flex size-10 items-center justify-center rounded-[10px] bg-primary text-xl font-bold text-primary-foreground"
        aria-hidden="true"
      >
        F
      </span>
      <span class="text-lg font-bold">FLUXIS EOD</span>
    </div>

    <main class="w-full max-w-[420px]">
      <LoginForm @success="onSuccess" />
    </main>

    <footer class="text-[11px] text-muted-foreground">
      © 2026 Fluxis · System obiegu dokumentów EOD
    </footer>
  </div>
</template>
