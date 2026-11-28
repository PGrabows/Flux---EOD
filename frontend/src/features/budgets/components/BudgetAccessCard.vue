<script setup lang="ts">
import { useId } from 'vue'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

import { BUDGET_CARD_CLASS, BUDGET_CARD_TITLE_CLASS } from '../styles'
import { BUDGET_ACCESS_ROLE_LABELS } from '../constants'
import type { BudgetAccessEntry } from '../types'

defineProps<{ access: readonly BudgetAccessEntry[] }>()

const titleId = useId()
</script>

<template>
  <section :aria-labelledby="titleId" :class="[BUDGET_CARD_CLASS, 'flex flex-col gap-3.5 p-5']">
    <h2 :id="titleId" :class="BUDGET_CARD_TITLE_CLASS">Dostęp do szczegółów</h2>
    <ul class="flex flex-col gap-3">
      <li
        v-for="person in access"
        :key="`${person.name}|${person.role}`"
        class="flex items-center gap-2.5"
      >
        <Avatar class="size-8 shrink-0" aria-hidden="true">
          <AvatarFallback
            class="bg-eod-primary-soft text-[11px] leading-[14px] font-semibold text-eod-primary"
          >
            {{ getInitials(person.name) }}
          </AvatarFallback>
        </Avatar>
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="truncate text-[13px] leading-4 font-semibold text-eod-foreground">
            {{ person.name }}
          </span>
          <span class="truncate text-xs leading-4 text-eod-muted-foreground">
            {{ BUDGET_ACCESS_ROLE_LABELS[person.role] }}
          </span>
        </div>
      </li>
    </ul>
    <p class="text-xs leading-4 text-eod-muted-foreground">
      Pozostali pracownicy działu widzą tylko pozostałą kwotę budżetu przy dodawaniu dokumentu.
    </p>
  </section>
</template>
