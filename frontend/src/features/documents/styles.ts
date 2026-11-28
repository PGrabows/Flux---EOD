// Przyciski EOD są wspólne dla feature'ów – re-eksport dla istniejących importów.
export { EOD_OUTLINE_BUTTON_CLASS, EOD_PRIMARY_BUTTON_CLASS } from '@/shared/styles/eod'

/** Etykieta sekcji panelu filtrów (label/legend). */
export const EOD_FILTER_LABEL_CLASS = 'text-xs leading-4 font-semibold text-eod-foreground'

/** Pole tekstowe/liczbowe/daty w panelu filtrów (lewy padding dobiera komponent). */
export const EOD_FILTER_FIELD_CLASS =
  'h-10 rounded-(--eod-radius-sm) border-eod-border bg-eod-surface pr-[13px] text-[13px] leading-4 font-medium text-eod-foreground placeholder:font-normal placeholder:text-eod-muted-foreground md:text-[13px]'

/** Komunikat błędu walidacji pod sekcją panelu filtrów. */
export const EOD_FILTER_ERROR_CLASS =
  'text-xs leading-4 font-medium text-eod-status-rejected-foreground'
