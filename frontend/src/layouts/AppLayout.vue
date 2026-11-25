<script setup lang="ts">
import ThemeToggle from '@/shared/components/ThemeToggle.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b">
      <div class="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <RouterLink to="/" class="font-semibold">Fluxis EOD</RouterLink>
        <ThemeToggle />
      </div>
    </header>
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
