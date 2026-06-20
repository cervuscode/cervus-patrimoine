"use client";

import { useState } from "react";

/**
 * Éditeur de notes en ONGLET DÉDIÉ (route /app/notes/[personId], ouverte en _blank).
 * - Le texte est visible directement (l'onglet séparé EST la protection : il
 *   n'apparaît pas dans un partage d'écran de l'onglet/fenêtre Meet).
 * - Éditable, persistance via le MÊME endpoint /api/rdv/save (champ Person
 *   "Notes libres (Découverte RDV)") + MÊME pattern « Enregistrer » explicite.
 * - Pas de contexte React partagé avec l'onglet principal (document séparé) :
 *   l'état est local à cet onglet, la synchro se fait par la persistance Pipedrive.
 */
export default function NotesEditor({
  personId,
  initialNotes,
  clientCode,
}: {
  personId: number;
  initialNotes: string;
  clientCode: string | null;
}) {
  const [value, setValue] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // initialNotes est figée au montage (prop serveur) → comparaison directe fiable.
  const dirty = value !== initialNotes;

  async function save() {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/rdv/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, notes: value }),
      });
      setToast(res.ok ? "Enregistré" : "Échec de l'enregistrement");
      setTimeout(() => setToast(null), 2500);
    } catch {
      setToast("Échec de l'enregistrement");
      setTimeout(() => setToast(null), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cervus-gold-light">
            Notes confidentielles
          </p>
          <h1 className="font-cormorant text-3xl font-semibold text-cervus-bronze">
            {clientCode ?? "Client"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {toast && (
            <span className={toast === "Enregistré" ? "text-xs text-emerald-400" : "text-xs text-amber-400"}>
              {toast}
            </span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="rounded-[50px] bg-cervus-gold px-6 py-2.5 text-sm font-medium text-cervus-bronze transition-colors hover:bg-cervus-gold-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </header>

      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-h-[60vh] flex-1 resize-none rounded-2xl border border-cervus-gold/30 bg-cervus-dark/60 px-4 py-3 text-base leading-relaxed text-cervus-bronze focus:border-cervus-gold focus:outline-none"
        placeholder="Notes confidentielles sur le client (visibles uniquement dans cet onglet)…"
      />

      {dirty && !saving && (
        <p className="text-xs text-amber-400">● modifications non enregistrées</p>
      )}
    </main>
  );
}
