"use client";

import { useState } from "react";
import Link from "next/link";
import { useRdvClient } from "./RdvClientProvider";
import ClientCodeBadge from "./ClientCodeBadge";
import DiscoverySections from "./DiscoverySections";
import SaveBar from "./SaveBar";

/**
 * Panneau persistant (« petite tête »), monté globalement dans le layout conseiller.
 * - Lanceur fixe en bas (barre fine pleine largeur mobile / encart bas-droite desktop).
 * - Ouvert : bottom sheet (mobile) / panneau latéral droit (desktop).
 * - Filet de sécurité (stratégie C) : enregistrement auto à la fermeture si modifs en attente.
 */
export default function PersistentPanel() {
  const { client, activeDeal, hasUnsavedChanges, save, fiscalState } = useRdvClient();
  const [open, setOpen] = useState(false);

  async function close() {
    if (hasUnsavedChanges) {
      await save(); // filet de sécurité
    }
    setOpen(false);
  }

  const code = activeDeal?.code ?? null;

  return (
    <>
      {/* Lanceur */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-between gap-3 border-t border-cervus-gold/30 bg-cervus-dark/95 px-4 backdrop-blur sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-12 sm:w-72 sm:rounded-[50px] sm:border"
          aria-label="Ouvrir le panneau client"
        >
          <span className="flex items-center gap-2 text-sm text-cervus-bronze">
            <span className="text-cervus-gold-light">●</span>
            {code ? code : client ? "Client ouvert" : "Aucun client"}
            {hasUnsavedChanges && <span className="text-amber-400">●</span>}
          </span>
          <span className="text-xs text-cervus-bronze/60">Ouvrir ▴</span>
        </button>
      )}

      {/* Panneau ouvert */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <div
            className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-cervus-gold/30 bg-cervus-dark sm:inset-y-0 sm:left-auto sm:right-0 sm:bottom-auto sm:h-full sm:max-h-none sm:w-[380px] sm:rounded-none sm:rounded-l-2xl sm:border-l sm:border-t-0"
          >
            <div className="flex items-center justify-between border-b border-cervus-gold/20 p-4">
              <h2 className="font-cormorant text-2xl text-cervus-bronze">Fiche client</h2>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-1 text-cervus-bronze/70 hover:text-cervus-bronze"
                aria-label="Fermer le panneau"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Lien rapide vers la référence fiscale (dispo même sans client). */}
              <Link
                href="/reference-fiscale"
                onClick={() => setOpen(false)}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-cervus-gold-light hover:text-cervus-bronze"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                </svg>
                Référence fiscale 2026
              </Link>
              {!client ? (
                <p className="text-sm text-cervus-bronze/50">
                  Aucun client ouvert. Recherchez un client pour commencer.
                </p>
              ) : (
                <div className="flex flex-col gap-5">
                  {code && <ClientCodeBadge code={code} />}
                  {/* Indicateur fiscal partagé (Lot 2) — calculé une fois. */}
                  {fiscalState.revenuNetImposable > 0 && (
                    <p className="text-xs text-cervus-bronze/70">
                      <span className="text-cervus-gold-light">TMI {fiscalState.tmi} %</span>
                      {" · "}
                      {fiscalState.partsTotal} part{fiscalState.partsTotal > 1 ? "s" : ""}
                      {" · revenu net "}
                      {Math.round(fiscalState.revenuNetImposable).toLocaleString("fr-FR")} €
                    </p>
                  )}
                  <DiscoverySections compact />
                </div>
              )}
            </div>

            {client && (
              <div className="border-t border-cervus-gold/20 p-4">
                <SaveBar />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
