"use client";

import { RDV_FIELDS } from "@/lib/rdv-fields";
import { useRdvClient } from "./RdvClientProvider";

const STATE_BADGE: Record<string, { text: string; cls: string } | null> = {
  vide: null,
  prefill: { text: "pré-rempli (Simulation)", cls: "text-cervus-gold-light" },
  saved: { text: "corrigé en RDV", cls: "text-emerald-400" },
  edited: { text: "● non enregistré", cls: "text-amber-400" },
};

export default function DiscoveryField({ fieldId }: { fieldId: string }) {
  const def = RDV_FIELDS.find((f) => f.id === fieldId);
  const { getValue, setValue, fieldState, getSim } = useRdvClient();
  if (!def) return null;

  const state = fieldState(fieldId);
  const badge = STATE_BADGE[state];
  const sim = getSim(fieldId);
  const showSim = sim != null && String(sim) !== "" && (state === "saved" || state === "edited");

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`f-${fieldId}`} className="text-xs font-medium text-cervus-bronze/70">
          {def.label}
        </label>
        {badge && <span className={`text-[10px] ${badge.cls}`}>{badge.text}</span>}
      </div>
      <input
        id={`f-${fieldId}`}
        type={def.kind === "text" ? "text" : "text"}
        inputMode={def.kind === "text" ? "text" : "decimal"}
        value={getValue(fieldId)}
        onChange={(e) => setValue(fieldId, e.target.value)}
        className="w-full rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2 text-sm text-cervus-bronze placeholder-cervus-bronze/30 focus:border-cervus-gold focus:outline-none"
        placeholder="—"
      />
      {showSim && (
        <p className="text-[10px] text-cervus-bronze/40">
          Simulation : {String(sim)}
          {def.kind === "money" ? " €" : ""}
        </p>
      )}
    </div>
  );
}
