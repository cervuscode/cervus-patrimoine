"use client";

import { useState } from "react";

/**
 * Bouton « Garder ce résultat » (Lot 3) — capture MANUELLE explicite d'une variante
 * de simulation dans l'historique de session. Remplace l'ancienne capture
 * automatique debouncée (qui polluait la note avec les valeurs intermédiaires des
 * sliders). Mobile-first : zone tactile confortable.
 *
 * `onKeep()` exécute la capture (recordSim en sim connecté, postMessage vers l'opener
 * en présentation) et renvoie :
 *  - true  → capture prise en compte → feedback « Gardé ✓ » ;
 *  - false → non transmise (présentation : fenêtre fiche fermée) → « Fiche fermée ».
 */
export default function KeepResultButton({
  onKeep,
  disabled = false,
  className = "",
}: {
  onKeep: () => boolean | void;
  disabled?: boolean;
  className?: string;
}) {
  const [feedback, setFeedback] = useState<null | "ok" | "ko">(null);

  function click() {
    const res = onKeep();
    const ok = res !== false;
    setFeedback(ok ? "ok" : "ko");
    setTimeout(() => setFeedback(null), 1500);
  }

  return (
    <button
      type="button"
      onClick={click}
      disabled={disabled || feedback !== null}
      aria-label="Garder ce résultat dans la note de synthèse"
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[50px] border border-cervus-gold/50 bg-cervus-gold/10 px-5 py-2.5 text-sm font-medium text-cervus-bronze transition-colors hover:bg-cervus-gold/20 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {feedback === "ok" ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Gardé&nbsp;!
        </>
      ) : feedback === "ko" ? (
        "Fiche fermée"
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
            <path d="M17 21v-8H7v8M7 3v5h8" />
          </svg>
          Garder ce résultat
        </>
      )}
    </button>
  );
}
