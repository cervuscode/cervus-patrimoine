"use client";

import { useState } from "react";
import { useRdvClient } from "./RdvClientProvider";

/**
 * Notes libres — MASQUÉES par défaut (sécurité partage d'écran, MD §4.2).
 * Le contenu n'existe à l'écran QUE tant que le modal est ouvert. Fermé → masque.
 */
export default function NotesField() {
  const { notes, setNotes, notesDirty } = useRdvClient();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-cervus-bronze/70">
          Notes libres {notesDirty && <span className="text-amber-400">● non enregistré</span>}
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-[50px] border border-cervus-gold/50 px-3 py-1 text-xs font-medium text-cervus-bronze hover:bg-cervus-gold/20"
          aria-label="Afficher les notes"
        >
          {/* icône œil */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Afficher
        </button>
      </div>
      {/* Masque permanent : jamais le contenu réel */}
      <div className="rounded-lg border border-cervus-gold/20 bg-cervus-dark/60 px-3 py-2 text-sm tracking-widest text-cervus-bronze/40 select-none">
        {notes.trim() ? "••••••••••••" : "— aucune note —"}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-cervus-gold/30 bg-cervus-dark p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-cormorant text-2xl text-cervus-bronze">Notes libres</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-cervus-bronze/70 hover:text-cervus-bronze"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <textarea
              autoFocus
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              className="w-full resize-y rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2 text-sm text-cervus-bronze focus:border-cervus-gold focus:outline-none"
              placeholder="Notes confidentielles sur le client…"
            />
            <p className="mt-2 text-[11px] text-cervus-bronze/40">
              Pensez à « Enregistrer » dans le panneau pour persister les notes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
