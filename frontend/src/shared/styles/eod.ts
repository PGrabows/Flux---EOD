/**
 * Wspólne klasy przycisków w stylu EOD (Figma) – używane przez wiele feature'ów i widoków.
 * Prymitywy w `components/ui/` zostają nietknięte; styl nakładamy przez `class`.
 */

/** Przycisk „outline” w stylu EOD (Filtry, Sortuj, Szczegóły, Spróbuj ponownie, Rok…). */
export const EOD_OUTLINE_BUTTON_CLASS =
  'h-auto gap-2 rounded-(--eod-radius-sm) border-eod-border bg-eod-surface px-4 py-[11px] text-[13px] leading-4 font-semibold text-eod-foreground hover:bg-eod-input hover:text-eod-foreground aria-expanded:bg-eod-input aria-expanded:text-eod-foreground'

/** Przycisk główny w stylu EOD (Dodaj dokument, Pokaż wyniki). */
export const EOD_PRIMARY_BUTTON_CLASS =
  'h-auto gap-2 rounded-(--eod-radius-sm) bg-eod-primary px-4 py-[11px] text-[13px] leading-4 font-semibold text-eod-primary-foreground hover:bg-eod-primary/90'
