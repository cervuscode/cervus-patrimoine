"use client";

import { useEffect, useRef } from "react";
import { useRdvClient } from "./RdvClientProvider";
import { TAUX_PAR_PROFIL, type PerProfil } from "@/lib/per-quick";
import {
  encodePresentationParams,
  PRESENT_MSG_IDENTITY,
  PRESENT_MSG_RECORD,
  PRESENT_MSG_REQUEST,
  type ClientIdentity,
  type HypoValues,
} from "@/lib/presentation-bridge";
import { normalizeGarde, normalizeStatutLabel } from "@/lib/impot-sim";
import type { SimRecordDraft } from "@/lib/sim-history";

function toNum(v: string, fallback = 0): number {
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}
function toProfil(v: string): PerProfil {
  const s = v.toLowerCase();
  if (s.includes("prudent")) return "prudent";
  if (s.includes("dynam")) return "dynamique";
  return "equilibre";
}

/**
 * Pont côté FICHE (Lot F). Monté dans le contexte RdvClient. Deux rôles :
 *  (a) bouton « Accéder aux présentations clients » → ouvre l'espace présentation
 *      en _blank avec l'identité + les seeds d'hypothèses encodés ;
 *  (b) répondeur postMessage : renvoie l'identité COURANTE lue depuis la fiche
 *      (donc une correction faite dans le panneau est rapatriée par « Actualiser »).
 */
export default function PresentationBridge() {
  const { client, activeDeal, getValue, fiscalState, recordSim } = useRdvClient();
  const personId = client?.personId ?? null;
  // recordSim est stable (useCallback []), mais on le passe par ref car le listener
  // est monté une seule fois ([] deps) et doit toujours appeler la version courante.
  const recordSimRef = useRef(recordSim);
  recordSimRef.current = recordSim;

  // Identité = état fiscal PARTAGÉ (Lot 2) : revenu net, parts, TMI calculés une fois.
  const identity: ClientIdentity = {
    revenuImposable: fiscalState.revenuNetImposable,
    parts: fiscalState.partsTotal,
    anneeNaissance: toNum(getValue("anneeNaissance"), 1980),
    tmi: fiscalState.tmi,
  };
  // Ref TOUJOURS à jour : le répondeur lit l'identité COURANTE au moment de la
  // réception du message (fix « Actualiser » : jamais figée au montage). `identity`
  // est recalculée à chaque changement (fiscalState mémoïsé) → re-render → ref fraîche.
  const identityRef = useRef(identity);
  identityRef.current = identity;

  // Répond aux requêtes « Actualiser » de l'onglet présentation (window.opener).
  // Listener monté une fois ; il lit identityRef.current (et non une capture figée).
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      // (a) Requête « Actualiser » → renvoie l'identité courante.
      if (event.data?.type === PRESENT_MSG_REQUEST) {
        const source = event.source as WindowProxy | null;
        source?.postMessage(
          { type: PRESENT_MSG_IDENTITY, simId: event.data.simId, identity: identityRef.current },
          event.origin
        );
        return;
      }
      // (b) Lot 3 : variante testée en présentation → historique de session.
      if (event.data?.type === PRESENT_MSG_RECORD) {
        const draft = event.data.draft as SimRecordDraft | undefined;
        if (
          draft &&
          (draft.simId === "per-quick" ||
            draft.simId === "per-full" ||
            draft.simId === "impot")
        ) {
          recordSimRef.current(draft);
        }
        return;
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function ouvrir() {
    if (personId == null) return;
    const ageRetraite = toNum(getValue("ageRetraite"));
    const horizonCalc =
      identity.anneeNaissance && ageRetraite
        ? ageRetraite - (new Date().getFullYear() - identity.anneeNaissance)
        : 0;
    const profil = toProfil(getValue("profil"));
    const hypo: HypoValues = {
      versementMensuel: toNum(getValue("versementMensuel")),
      versementInitial: toNum(getValue("versementInitial")),
      horizon: horizonCalc > 0 ? horizonCalc : 20,
      profil,
      // Taux par défaut = celui du profil (Lot I), ajustable en présentation.
      taux: TAUX_PAR_PROFIL[profil],
      // Tranche de sortie par défaut = TMI partagée (Lot 2).
      trancheSortie: fiscalState.tmi,
      ageConversion: 67,
      // Hypothèses du simulateur d'impôt (Lot 4), pré-remplies depuis la fiche.
      // Tout reste éditable en présentation (revenu + situation familiale inclus).
      impot: {
        statut: normalizeStatutLabel(getValue("statutMarital")),
        nbEnfants: toNum(getValue("nbEnfants")),
        garde: normalizeGarde(getValue("garde")),
        demiPartHandicap: false,
        revenuImposable: fiscalState.revenuNetImposable,
      },
    };
    const code = activeDeal?.code ?? client?.deals.find((d) => d.code)?.code ?? null;
    const params = encodePresentationParams(identity, hypo, code, "per");
    // Pas de "noopener" : on conserve window.opener pour le bouton « Actualiser ».
    window.open(`/presentation/${personId}?${params.toString()}`, "_blank");
  }

  return (
    <button
      type="button"
      onClick={ouvrir}
      disabled={personId == null}
      className="inline-flex items-center gap-2 rounded-[50px] bg-cervus-gold px-6 py-3 text-sm font-medium text-cervus-bronze transition-colors hover:bg-cervus-gold-dark disabled:opacity-40"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h20v12H2z" />
        <path d="M12 15v6M8 21h8" />
      </svg>
      Accéder aux présentations clients
    </button>
  );
}
