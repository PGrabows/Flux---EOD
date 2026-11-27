/** Przycisk „outline” w stylu EOD (Filtry, Sortuj, Szczegóły, Wyczyść filtry, Spróbuj ponownie). */
export const EOD_OUTLINE_BUTTON_CLASS =
  'h-auto gap-2 rounded-(--eod-radius-sm) border-eod-border bg-eod-surface px-4 py-[11px] text-[13px] leading-4 font-semibold text-eod-foreground hover:bg-eod-input hover:text-eod-foreground aria-expanded:bg-eod-input aria-expanded:text-eod-foreground'

/** Przycisk główny w stylu EOD (Dodaj dokument, Pokaż wyniki). */
export const EOD_PRIMARY_BUTTON_CLASS =
  'h-auto gap-2 rounded-(--eod-radius-sm) bg-eod-primary px-4 py-[11px] text-[13px] leading-4 font-semibold text-eod-primary-foreground hover:bg-eod-primary/90'

/** Etykieta sekcji panelu filtrów (label/legend). */
export const EOD_FILTER_LABEL_CLASS = 'text-xs leading-4 font-semibold text-eod-foreground'

/** Pole tekstowe/liczbowe/daty w panelu filtrów (lewy padding dobiera komponent). */
export const EOD_FILTER_FIELD_CLASS =
  'h-10 rounded-(--eod-radius-sm) border-eod-border bg-eod-surface pr-[13px] text-[13px] leading-4 font-medium text-eod-foreground placeholder:font-normal placeholder:text-eod-muted-foreground md:text-[13px]'

/** Komunikat błędu walidacji pod sekcją panelu filtrów. */
export const EOD_FILTER_ERROR_CLASS =
  'text-xs leading-4 font-medium text-eod-status-rejected-foreground'
