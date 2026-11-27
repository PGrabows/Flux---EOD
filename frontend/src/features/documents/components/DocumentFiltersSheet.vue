<script setup lang="ts">
import { ListFilterIcon, SearchIcon, XIcon } from '@lucide/vue'
import { DialogContent, DialogPortal } from 'reka-ui'
import { computed, ref, useId } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
// Overlay nie jest eksportowany z indeksu prymitywu, ale przyjmuje `class` – kompozycja bez zmian w ui/.
import SheetOverlay from '@/components/ui/sheet/SheetOverlay.vue'

import { useDocumentFilterDraft } from '../composables/useDocumentFilterDraft'
import {
  CONTRACTOR_QUERY_MAX_LENGTH,
  copyFilterCriteria,
  DOCUMENT_TYPE_OPTIONS,
} from '../constants'
import {
  EOD_FILTER_ERROR_CLASS,
  EOD_FILTER_FIELD_CLASS,
  EOD_FILTER_LABEL_CLASS,
  EOD_OUTLINE_BUTTON_CLASS,
  EOD_PRIMARY_BUTTON_CLASS,
} from '../styles'
import type { DocumentFilterCriteria, DocumentListItem } from '../types'
import DocumentFilterDateRange from './DocumentFilterDateRange.vue'
import DocumentFilterSelect from './DocumentFilterSelect.vue'
import DocumentFilterStatusList from './DocumentFilterStatusList.vue'
import DocumentFilterValueRange from './DocumentFilterValueRange.vue'

const props = defineProps<{
  documents: readonly DocumentListItem[]
  /** Bieżąca fraza wyszukiwania – wliczana do podglądu liczby wyników. */
  query: string
  /** Zastosowane kryteria – punkt wyjścia szkicu przy każdym otwarciu. */
  applied: DocumentFilterCriteria
  activeCount: number
}>()

const emit = defineEmits<{ apply: [criteria: DocumentFilterCriteria] }>()

const open = ref(false)

const filterDraft = useDocumentFilterDraft(
  () => props.documents,
  () => props.query,
)
const { draft, statusCounts, recipientOptions, subtypeOptions, previewCount, errors, isValid } =
  filterDraft

const uid = useId()
const ids = {
  type: `${uid}-type`,
  subtype: `${uid}-subtype`,
  recipient: `${uid}-recipient`,
  contractor: `${uid}-contractor`,
  subtypeError: `${uid}-subtype-error`,
}

const showResultsLabel = computed(() => `Pokaż wyniki (${previewCount.value})`)

/** Otwarcie zaczyna od zastosowanych filtrów; zamknięcie bez „Pokaż wyniki” porzuca szkic. */
function onOpenChange(value: boolean) {
  if (value) filterDraft.reset(props.applied)
  open.value = value
}

function onSubmit() {
  if (!isValid.value) return
  emit('apply', copyFilterCriteria(draft.value))
  open.value = false
}
</script>

<template>
  <Sheet :open="open" @update:open="onOpenChange">
    <SheetTrigger as-child>
      <Button variant="outline" :class="EOD_OUTLINE_BUTTON_CLASS">
        <ListFilterIcon class="size-3.5 text-eod-primary" aria-hidden="true" />
        Filtry
        <template v-if="activeCount > 0">
          <span
            class="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-eod-primary px-1 text-[11px] leading-none font-semibold text-eod-primary-foreground"
            aria-hidden="true"
            data-testid="filters-active-count"
          >
            {{ activeCount }}
          </span>
          <span class="sr-only">, aktywne: {{ activeCount }}</span>
        </template>
      </Button>
    </SheetTrigger>

    <!--
      Zawartość składana ręcznie zamiast SheetContent: prymityw renderuje własny overlay
      (bg-black/10 + blur) bez możliwości przekazania klasy, a tło ma być wyraźnie przyciemnione.
      Fokus w pułapce, Esc, klik w tło i powrót fokusu na przycisk zapewnia DialogContent.
    -->
    <DialogPortal>
      <SheetOverlay
        class="bg-black/40 duration-200 supports-backdrop-filter:backdrop-blur-none"
        data-testid="filters-overlay"
      />
      <DialogContent
        data-slot="sheet-content"
        data-side="right"
        class="fixed inset-y-0 right-0 z-50 flex h-full w-[420px] max-w-full flex-col gap-4 bg-eod-surface p-5 text-eod-foreground shadow-[-8px_0_14px_rgba(0,0,0,0.14)] outline-none duration-200 ease-in-out data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right"
      >
        <div class="flex items-start gap-3">
          <div class="flex min-w-0 flex-col gap-0.5">
            <SheetTitle class="text-xl leading-6 font-bold text-eod-foreground">Filtry</SheetTitle>
            <SheetDescription class="text-xs leading-4 text-eod-muted-foreground">
              Zawęź listę dokumentów
            </SheetDescription>
          </div>
          <div class="flex-1" />
          <SheetClose as-child>
            <Button
              variant="outline"
              size="icon"
              class="size-8 rounded-(--eod-radius-xs) border-eod-border bg-eod-surface hover:bg-eod-input"
              aria-label="Zamknij filtry"
            >
              <XIcon class="size-3.5 text-eod-primary" aria-hidden="true" />
            </Button>
          </SheetClose>
        </div>

        <form novalidate class="flex min-h-0 flex-1 flex-col gap-4" @submit.prevent="onSubmit">
          <Separator class="bg-eod-border" />

          <!-- -mx-1 px-1: pierścień fokusu pól nie jest przycinany przez overflow. -->
          <div class="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1 py-0.5">
            <DocumentFilterStatusList
              :selected="draft.statuses"
              :counts="statusCounts"
              @change="filterDraft.setStatus"
            />

            <div class="flex flex-col gap-2">
              <Label :for="ids.type" :class="EOD_FILTER_LABEL_CLASS">Rodzaj dokumentu</Label>
              <DocumentFilterSelect
                :id="ids.type"
                :model-value="draft.type ?? ''"
                :options="DOCUMENT_TYPE_OPTIONS"
                placeholder="Wszystkie rodzaje"
                @update:model-value="filterDraft.setType"
              />
            </div>

            <div class="flex flex-col gap-2">
              <Label :for="ids.subtype" :class="EOD_FILTER_LABEL_CLASS">Podtyp</Label>
              <DocumentFilterSelect
                :id="ids.subtype"
                :model-value="draft.subtype ?? ''"
                :options="subtypeOptions"
                placeholder="Wszystkie podtypy"
                :disabled="draft.type === null"
                :aria-invalid="errors.subtype ? 'true' : undefined"
                :aria-describedby="errors.subtype ? ids.subtypeError : undefined"
                @update:model-value="filterDraft.setSubtype"
              />
              <p
                v-if="errors.subtype"
                :id="ids.subtypeError"
                role="alert"
                :class="EOD_FILTER_ERROR_CLASS"
              >
                {{ errors.subtype }}
              </p>
            </div>

            <DocumentFilterDateRange
              :from="draft.registeredFrom"
              :to="draft.registeredTo"
              :error="errors.registeredAt"
              @update:from="filterDraft.setRegisteredFrom"
              @update:to="filterDraft.setRegisteredTo"
            />

            <div class="flex flex-col gap-2">
              <Label :for="ids.recipient" :class="EOD_FILTER_LABEL_CLASS"
                >Odbiorca (w firmie)</Label
              >
              <DocumentFilterSelect
                :id="ids.recipient"
                :model-value="draft.recipient ?? ''"
                :options="recipientOptions"
                placeholder="Wszyscy odbiorcy"
                @update:model-value="filterDraft.setRecipient"
              />
            </div>

            <div class="flex flex-col gap-2">
              <Label :for="ids.contractor" :class="EOD_FILTER_LABEL_CLASS">Kontrahent</Label>
              <div class="relative">
                <SearchIcon
                  class="pointer-events-none absolute top-1/2 left-[13px] size-3.5 -translate-y-1/2 text-eod-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  :id="ids.contractor"
                  type="search"
                  placeholder="Szukaj kontrahenta lub NIP…"
                  autocomplete="off"
                  :maxlength="CONTRACTOR_QUERY_MAX_LENGTH"
                  :model-value="draft.contractorQuery"
                  :class="[EOD_FILTER_FIELD_CLASS, 'pl-9']"
                  @update:model-value="(value) => filterDraft.setContractorQuery(String(value))"
                />
              </div>
            </div>

            <DocumentFilterValueRange
              :currency="draft.currency"
              :min="draft.valueMin"
              :max="draft.valueMax"
              :error="errors.value"
              @update:currency="filterDraft.setCurrency"
              @update:min="filterDraft.setValueMin"
              @update:max="filterDraft.setValueMax"
            />
          </div>

          <Separator class="bg-eod-border" />

          <div class="flex gap-2">
            <Button
              type="button"
              variant="outline"
              :class="EOD_OUTLINE_BUTTON_CLASS"
              @click="filterDraft.clear()"
            >
              Wyczyść filtry
            </Button>
            <Button
              type="submit"
              :class="[EOD_PRIMARY_BUTTON_CLASS, 'flex-1']"
              :disabled="!isValid"
            >
              {{ showResultsLabel }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </Sheet>
</template>
