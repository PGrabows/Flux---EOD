<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <!-- Pusty obszar roboczy – treść widoków dojdzie w kolejnych zadaniach. -->
  <section class="flex-1">
    <h1 class="sr-only">{{ route.meta.title }}</h1>
  </section>
</template>
