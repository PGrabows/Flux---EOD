<script setup lang="ts">
import { CircleAlertIcon, PlusIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DocumentsListPanel, useDocumentsQuery } from '@/features/documents'
import { EOD_OUTLINE_BUTTON_CLASS, EOD_PRIMARY_BUTTON_CLASS } from '@/features/documents/styles'

const { data, isPending, isError, refetch } = useDocumentsQuery()

// TODO: formularz dodawania dokumentu – osobne zadanie.
function onAddDocument() {
  toast.info('Dodawanie dokumentów będzie dostępne wkrótce.')
}

// TODO: przejście do widoku szczegółów (np. trasa `/documents/:id`) – osobne zadanie.
function onDetails() {
  toast.info('Szczegóły dokumentu będą dostępne wkrótce.')
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-6 bg-eod-page px-4 pt-9 pb-8 md:px-10">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-col gap-1.5">
        <h1 class="text-[28px] leading-[34px] font-bold text-eod-foreground">Dokumenty</h1>
        <p class="text-[13px] leading-4 text-eod-muted-foreground">
          Przeglądaj, wyszukuj i zarządzaj dokumentami w obiegu akceptacji.
        </p>
      </div>
      <Button :class="EOD_PRIMARY_BUTTON_CLASS" @click="onAddDocument">
        <PlusIcon class="size-3.5" :stroke-width="1.75" aria-hidden="true" />
        Dodaj dokument
      </Button>
    </div>

    <section
      v-if="isPending"
      aria-busy="true"
      aria-label="Wczytywanie listy dokumentów"
      class="flex flex-col gap-2 rounded-(--eod-radius-lg) border border-eod-border bg-eod-surface px-[18px] py-3"
      data-testid="documents-loading"
    >
      <Skeleton
        v-for="index in 5"
        :key="index"
        class="h-[72px] rounded-(--eod-radius-md) bg-eod-neutral"
      />
    </section>

    <!-- Błąd odświeżenia przy istniejących danych nie chowa listy. -->
    <section
      v-else-if="isError && !data"
      role="alert"
      class="flex flex-col items-center gap-3 rounded-(--eod-radius-lg) border border-eod-border bg-eod-surface px-6 py-12 text-center"
    >
      <CircleAlertIcon class="size-6 text-eod-status-rejected-foreground" aria-hidden="true" />
      <p class="text-sm font-semibold text-eod-foreground">Nie udało się wczytać dokumentów.</p>
      <Button variant="outline" :class="EOD_OUTLINE_BUTTON_CLASS" @click="refetch()">
        Spróbuj ponownie
      </Button>
    </section>

    <DocumentsListPanel v-else :documents="data ?? []" @details="onDetails" />
  </div>
</template>
