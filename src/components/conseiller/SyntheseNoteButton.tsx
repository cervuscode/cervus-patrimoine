"use client";

import { useState } from "react";
import { useRdvClient } from "./RdvClientProvider";

/**
 * Bouton « Générer la note de synthèse » (Lot 3).
 * Compile les champs Découverte RDV courants + l'historique de session des
 * simulations → note HTML écrite sur le Deal actif (jamais sur les champs).
 * Manuel, cliqué en fin de RDV. Mobile-first.
 */
export default function SyntheseNoteButton() {
  const { activeDealId, simHistory, generateSyntheseNote, generatingNote } = useRdvClient();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  // Sans deal actif, pas de cible d'écriture (note attachée à un deal).
  if (activeDealId == null) {
    return (
      <p className="text-[11px] leading-relaxed text-cervus-bronze/40">
        Sélectionnez un deal pour générer la note de synthèse.
      </p>
    );
  }

  async function onClick() {
    setStatus("idle");
    const ok = await generateSyntheseNote();
    setStatus(ok ? "ok" : "error");
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={generatingNote}
        className="w-full rounded-[50px] border border-cervus-gold/50 bg-cervus-gold/10 px-4 py-3 text-sm font-medium text-cervus-bronze transition-colors hover:bg-cervus-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generatingNote ? "Écriture…" : "Générer la note de synthèse"}
      </button>
      <p className="text-[11px] text-cervus-bronze/50">
        {simHistory.length === 0
          ? "Aucune simulation consultée — la note ne contiendra que la Découverte."
          : `${simHistory.length} simulation${simHistory.length > 1 ? "s" : ""} dans l'historique de session.`}
      </p>
      {status === "ok" && (
        <p className="text-[11px] font-medium text-emerald-400">Note ajoutée au deal ✓</p>
      )}
      {status === "error" && (
        <p className="text-[11px] font-medium text-red-400">
          Échec de l&apos;écriture — réessayez.
        </p>
      )}
    </div>
  );
}
