"use client";

import { SERIE_META, type SerieKey } from "@/lib/market-data";

/**
 * Boutons on/off par série (Lot 10). Pastille couleur + libellé ; cible tactile
 * 44 px ; wrap mobile-first sous le graphe. Une série désactivée est grisée.
 */
export default function SeriesToggles({
  series,
  visibleKeys,
  onToggle,
}: {
  series: SerieKey[];
  visibleKeys: Set<SerieKey>;
  onToggle: (key: SerieKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {series.map((k) => {
        const on = visibleKeys.has(k);
        return (
          <button
            key={k}
            type="button"
            onClick={() => onToggle(k)}
            aria-pressed={on}
            className={`inline-flex min-h-[36px] items-center gap-2 rounded-[50px] border px-3 py-1.5 text-xs font-medium transition-colors ${
              on
                ? "border-cervus-gold/50 bg-cervus-gold/10 text-cervus-bronze"
                : "border-cervus-gold/20 text-cervus-bronze/40"
            }`}
          >
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: on ? SERIE_META[k].color : "transparent", border: `1.5px solid ${SERIE_META[k].color}` }}
            />
            {SERIE_META[k].label}
          </button>
        );
      })}
    </div>
  );
}
