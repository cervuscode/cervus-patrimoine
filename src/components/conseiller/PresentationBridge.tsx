"use client";

import { useEffect, useRef } from "react";
import { useRdvClient } from "./RdvClientProvider";
import { defaultTrancheSortie } from "@/lib/per-sortie";
import type { PerProfil } from "@/lib/per-quick";
import {
  encodePresentationParams,
  PRESENT_MSG_IDENTITY,
  PRESENT_MSG_REQUEST,
  type ClientIdentity,
  type HypoValues,
} from "@/lib/presentation-bridge";

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
  const { client, activeDeal, getValue } = useRdvClient();
  const personId = client?.personId ?? null;

  const identity: ClientIdentity = {
    revenuImposable: toNum(getValue("revenuImposable")),
    parts: toNum(getValue("partsFiscales"), 1),
    anneeNaissance: toNum(getValue("anneeNaissance"), 1980),
  };
  // Ref à jour : le répondeur lit l'identité au moment de la requête (pas figée).
  const identityRef = useRef(identity);
  identityRef.current = identity;

  // Répond aux requêtes « Actualiser » de l'onglet présentation (window.opener).
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== PRESENT_MSG_REQUEST) return;
      const source = event.source as WindowProxy | null;
      source?.postMessage(
        { type: PRESENT_MSG_IDENTITY, simId: event.data.simId, identity: identityRef.current },
        event.origin
      );
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
    const hypo: HypoValues = {
      versementMensuel: toNum(getValue("versementMensuel")),
      versementInitial: toNum(getValue("versementInitial")),
      horizon: horizonCalc > 0 ? horizonCalc : 20,
      profil: toProfil(getValue("profil")),
      trancheSortie: defaultTrancheSortie(identity.revenuImposable, identity.parts),
      ageConversion: 67,
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
