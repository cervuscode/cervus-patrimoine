"use client";

import { TAUX_MAX, TAUX_MIN, clampTaux } from "@/lib/per-quick";

/**
 * Slider du taux de rendement annuel (Lot I) — hypothèse ajustable en direct.
 * Tactile natif (`<input type="range">`, classe `.cervus-range`) + saisie clavier
 * exacte. `value`/`onChange` en DÉCIMAL (ex. 0.04). Affichage en %.
 */
export default function TauxSlider({
  value,
  onChange,
  label = "Taux de performance",
}: {
  value: number;
  onChange: (taux: number) => void;
  label?: string;
}) {
  const pct = Math.round(clampTaux(value) * 1000) / 10; // 0.04 → 4.0
  const minPct = TAUX_MIN * 100;
  const maxPct = TAUX_MAX * 100;

  const setFromPct = (raw: string) => {
    const p = parseFloat(raw.replace(",", "."));
    onChange(Number.isFinite(p) ? clampTaux(p / 100) : 0);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-cervus-bronze/70">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min={minPct}
            max={maxPct}
            value={pct}
            onChange={(e) => setFromPct(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-16 rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-2 py-1 text-right text-sm text-cervus-bronze focus:border-cervus-gold focus:outline-none"
            aria-label={`${label} en pourcentage`}
          />
          <span className="text-sm text-cervus-bronze/60">%</span>
        </div>
      </div>
      <input
        type="range"
        min={minPct}
        max={maxPct}
        step="0.1"
        value={pct}
        onChange={(e) => setFromPct(e.target.value)}
        className="cervus-range w-full"
        aria-label={label}
      />
    </div>
  );
}
