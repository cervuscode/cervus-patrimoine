"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRdvClient, type ClientView as ClientViewData } from "./RdvClientProvider";
import DealSelector from "./DealSelector";
import ClientCodeBadge from "./ClientCodeBadge";
import GenerateCodeBox from "./GenerateCodeBox";
import DiscoverySections from "./DiscoverySections";
import SaveBar from "./SaveBar";
import PresentationBridge from "./PresentationBridge";

/**
 * Vue client complète (page). Reçoit le snapshot serveur `initial` et hydrate le
 * contexte partagé (le panneau persistant lit le même état → synchro instantanée).
 */
export default function ClientView({ initial }: { initial: ClientViewData }) {
  const { setClient, activeDeal, activeDealId } = useRdvClient();
  const [showIdentity, setShowIdentity] = useState(false);

  // Hydrate / re-hydrate quand le snapshot serveur change (ex. après router.refresh).
  useEffect(() => {
    setClient(initial);
  }, [initial, setClient]);

  const codeForActive = activeDeal?.code ?? null;
  const needsCode = activeDealId != null && activeDeal != null && !activeDeal.code;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 pb-28 sm:px-6 sm:py-10">
      {/* En-tête : code en évidence, identité masquée par défaut (partage d'écran) */}
      <header className="flex flex-col gap-3">
        {codeForActive ? (
          <ClientCodeBadge code={codeForActive} />
        ) : (
          <span className="text-sm text-cervus-bronze/50">
            {activeDealId == null ? "Sélectionnez un dossier" : "Dossier sans code client"}
          </span>
        )}
        <div className="flex items-center gap-2 text-xs text-cervus-bronze/50">
          <button
            type="button"
            onClick={() => setShowIdentity((v) => !v)}
            className="rounded-[50px] border border-cervus-gold/40 px-3 py-1 hover:bg-cervus-gold/10"
          >
            {showIdentity ? "Masquer l'identité" : "Afficher l'identité"}
          </button>
          {showIdentity && (
            <span className="text-cervus-bronze/70">
              {initial.name}
              {initial.email ? ` · ${initial.email}` : ""}
            </span>
          )}
        </div>
      </header>

      {/* Accès proéminent à l'espace présentation client (ouvre un onglet dédié). */}
      <PresentationBridge />

      <DealSelector />

      {/* Accès rapide aux simulateurs en mode connecté (pré-rempli depuis la fiche). */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/client/${initial.personId}/simulateur-per`}
          className="inline-flex items-center gap-2 rounded-[50px] border border-cervus-gold/40 px-4 py-2 text-sm font-medium text-cervus-bronze hover:bg-cervus-gold/10"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="m7 14 4-4 3 3 5-6" />
          </svg>
          Simulateur PER rapide
        </Link>
        <Link
          href={`/client/${initial.personId}/simulateur-per-complet`}
          className="inline-flex items-center gap-2 rounded-[50px] border border-cervus-gold/40 px-4 py-2 text-sm font-medium text-cervus-bronze hover:bg-cervus-gold/10"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="m7 14 4-4 3 3 5-6" />
          </svg>
          Simulateur PER complet
        </Link>
        <Link
          href={`/client/${initial.personId}/simulateur-impot`}
          className="inline-flex items-center gap-2 rounded-[50px] border border-cervus-gold/40 px-4 py-2 text-sm font-medium text-cervus-bronze hover:bg-cervus-gold/10"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="m7 14 4-4 3 3 5-6" />
          </svg>
          Simulateur d&apos;impôt
        </Link>
      </div>

      {needsCode && <GenerateCodeBox dealId={activeDealId!} />}

      <DiscoverySections />

      {/* Barre d'enregistrement (également dans le panneau persistant) */}
      <div className="sticky bottom-16 z-30 mt-2 rounded-2xl border border-cervus-gold/30 bg-cervus-dark/95 p-3 backdrop-blur">
        <SaveBar />
      </div>
    </div>
  );
}
