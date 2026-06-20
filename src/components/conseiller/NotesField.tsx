"use client";

import { useRdvClient } from "./RdvClientProvider";

/**
 * Notes libres dans le panneau persistant — MASQUÉES par défaut (sécurité partage
 * d'écran, MD §4.2). Le contenu n'est JAMAIS rendu ici.
 *
 * Consultation/édition : bouton qui ouvre l'onglet dédié /notes/[personId] en
 * _blank (retour d'usage RDV visio : éviter de quitter l'onglet Meet ; l'onglet
 * séparé n'apparaît pas dans un partage d'écran de l'onglet/fenêtre Meet).
 * L'édition + l'enregistrement se font dans cet onglet (même endpoint /api/rdv/save).
 */
export default function NotesField() {
  const { client, notes } = useRdvClient();
  const personId = client?.personId ?? null;

  function openNotesTab() {
    if (personId == null) return;
    window.open(`/notes/${personId}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-cervus-bronze/70">Notes libres</span>
        <button
          type="button"
          onClick={openNotesTab}
          disabled={personId == null}
          className="inline-flex items-center gap-1.5 rounded-[50px] border border-cervus-gold/50 px-3 py-1 text-xs font-medium text-cervus-bronze hover:bg-cervus-gold/20 disabled:opacity-40"
          aria-label="Ouvrir les notes dans un nouvel onglet"
        >
          {/* icône nouvel onglet */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
          </svg>
          Ouvrir dans un onglet
        </button>
      </div>
      {/* Masque permanent : jamais le contenu réel dans cet onglet (partage d'écran) */}
      <div className="rounded-lg border border-cervus-gold/20 bg-cervus-dark/60 px-3 py-2 text-sm tracking-widest text-cervus-bronze/40 select-none">
        {notes.trim() ? "••••••••••••" : "— aucune note —"}
      </div>
    </div>
  );
}
