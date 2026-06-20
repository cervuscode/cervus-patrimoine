"use client";

import { useRdvClient } from "./RdvClientProvider";

const STATUS_LABEL: Record<string, string> = {
  open: "Ouvert",
  won: "Gagné",
  lost: "Perdu",
};

/**
 * Décision 2 — sélecteur de deal explicite. Si plusieurs deals (PER + AV…),
 * Auguste choisit lequel ouvrir comme deal actif avant code + champs Découverte Deal.
 */
export default function DealSelector() {
  const { client, activeDealId, selectDeal } = useRdvClient();
  if (!client) return null;
  const { deals } = client;

  if (deals.length === 0) {
    return (
      <p className="rounded-xl border border-cervus-gold/20 bg-cervus-dark/40 p-4 text-sm text-cervus-bronze/60">
        Aucun deal rattaché à ce client dans Pipedrive.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-cervus-gold-light">
        {deals.length > 1 ? "Choisir le dossier à ouvrir" : "Dossier"}
      </p>
      <div className="flex flex-wrap gap-2">
        {deals.map((d) => {
          const active = d.id === activeDealId;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => selectDeal(d.id)}
              className={`rounded-xl border px-4 py-2 text-left transition-colors ${
                active
                  ? "border-cervus-gold bg-cervus-gold/20"
                  : "border-cervus-gold/30 hover:border-cervus-gold/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-cervus-bronze">
                  {d.produit ?? "Sans produit"}
                </span>
                <span className="text-[10px] text-cervus-bronze/50">
                  {d.status ? STATUS_LABEL[d.status] ?? d.status : ""}
                </span>
              </div>
              <span className="text-[11px] text-cervus-bronze/50">
                {d.code ? d.code : "sans code"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
