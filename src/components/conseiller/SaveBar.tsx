"use client";

import { useState } from "react";
import { useRdvClient } from "./RdvClientProvider";

/** Bouton « Enregistrer » explicite (stratégie C validée) + indicateur dirty. */
export default function SaveBar() {
  const { hasUnsavedChanges, saving, save } = useRdvClient();
  const [toast, setToast] = useState<string | null>(null);

  async function onSave() {
    const ok = await save();
    setToast(ok ? "Enregistré" : "Échec de l'enregistrement");
    setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={!hasUnsavedChanges || saving}
        className="rounded-[50px] bg-cervus-gold px-6 py-2.5 text-sm font-medium text-cervus-bronze transition-colors hover:bg-cervus-gold-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
      {hasUnsavedChanges && !saving && (
        <span className="text-xs text-amber-400">● modifications non enregistrées</span>
      )}
      {toast && <span className="text-xs text-emerald-400">{toast}</span>}
    </div>
  );
}
