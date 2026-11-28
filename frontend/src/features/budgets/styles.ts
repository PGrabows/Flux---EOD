/** Karta/panel w stylu EOD (Figma: biała, obramowanie, promień 16 px). */
export const BUDGET_CARD_CLASS =
  'rounded-(--eod-radius-lg) border border-eod-border bg-eod-surface text-eod-foreground'

/** Tytuł karty szczegółów budżetu. */
export const BUDGET_CARD_TITLE_CLASS = 'text-sm leading-[18px] font-semibold text-eod-foreground'

/** Link tekstowy w kolorze akcentu („Zobacz wszystkie →”, okruszki). */
export const BUDGET_LINK_CLASS =
  'rounded-sm text-xs leading-4 font-semibold text-eod-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50'

/** Szerokości kolumn tabeli budżetów (Figma) – wspólne dla nagłówka i wierszy. */
export const BUDGET_LIST_COLUMNS = {
  budget: 'min-w-[200px] flex-1',
  limit: 'w-[105px] shrink-0',
  committed: 'w-[115px] shrink-0',
  spent: 'w-[105px] shrink-0',
  remaining: 'w-[115px] shrink-0',
  usage: 'w-[150px] shrink-0',
  status: 'w-[105px] shrink-0',
} as const

/** Szerokości kolumn tabeli dokumentów obciążających budżet (Figma). */
export const BUDGET_DOCUMENT_COLUMNS = {
  document: 'min-w-[180px] flex-1',
  contractor: 'w-[150px] shrink-0',
  amount: 'w-[100px] shrink-0',
  status: 'w-[110px] shrink-0',
} as const
