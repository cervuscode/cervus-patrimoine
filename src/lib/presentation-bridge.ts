/**
 * Pont de l'espace « Présentations clients » (Lot F) — ISOMORPHE (aucun secret).
 *
 * Sépare formellement les deux familles de champs et porte le protocole same-origin
 * entre la fiche client (onglet opener, source d'identité) et l'onglet présentation :
 *  - IDENTITÉ : revenu, parts, année de naissance → viennent de la fiche, lecture
 *    seule en présentation, rapatriables via « Actualiser ».
 *  - HYPOTHÈSES : versement, horizon, profil, tranche de sortie, âge de conversion →
 *    éditables en direct dans l'onglet présentation, JAMAIS écrasées par Actualiser.
 */

import type { PerProfil } from "./per-quick";
import type { AgeConversion } from "./per-sortie";
import type { SimRecordDraft } from "./sim-history";

export interface ClientIdentity {
  revenuImposable: number; // = revenu net imposable de l'état fiscal partagé (Lot 2)
  parts: number; // = partsTotal de l'état fiscal partagé
  anneeNaissance: number;
  tmi: number; // TMI partagée, calculée une fois côté fiche (Lot 2)
}

export interface HypoValues {
  versementMensuel: number;
  versementInitial: number;
  horizon: number;
  profil: PerProfil;
  /** Taux de rendement annuel (décimal) — slider (Lot I). */
  taux: number;
  trancheSortie: number;
  ageConversion: AgeConversion;
}

export const DEFAULT_IDENTITY: ClientIdentity = {
  revenuImposable: 0,
  parts: 1,
  anneeNaissance: 1980,
  tmi: 0,
};

export const DEFAULT_HYPO: HypoValues = {
  versementMensuel: 0,
  versementInitial: 0,
  horizon: 20,
  profil: "equilibre",
  taux: 0.04, // = TAUX_PAR_PROFIL.equilibre
  trancheSortie: 30,
  ageConversion: 67,
};

// ── Protocole postMessage (étendu avec simId) ─────────────────────────────────
// Toujours vérifier `event.origin === window.location.origin` ET le `type`.
export const PRESENT_MSG_REQUEST = "cervus:present:request" as const;
export const PRESENT_MSG_IDENTITY = "cervus:present:identity" as const;
// Lot 3 (extension) : l'onglet présentation transmet chaque variante stabilisée à
// l'opener (la fiche) pour l'ajouter à l'historique de session, exactement comme
// une simulation testée dans un simulateur connecté.
export const PRESENT_MSG_RECORD = "cervus:present:record" as const;

export interface PresentRequestMessage {
  type: typeof PRESENT_MSG_REQUEST;
  simId: string;
}
export interface PresentIdentityMessage {
  type: typeof PRESENT_MSG_IDENTITY;
  simId: string;
  identity: ClientIdentity;
}
export interface PresentRecordMessage {
  type: typeof PRESENT_MSG_RECORD;
  draft: SimRecordDraft;
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}
function asProfil(v: unknown): PerProfil {
  return v === "prudent" || v === "equilibre" || v === "dynamique" ? v : "equilibre";
}

// ── Encode / decode de l'URL de présentation ──────────────────────────────────
export function encodePresentationParams(
  identity: ClientIdentity,
  hypo: HypoValues,
  code: string | null,
  activeSim: string
): URLSearchParams {
  const p = new URLSearchParams({
    r: String(identity.revenuImposable),
    p: String(identity.parts),
    an: String(identity.anneeNaissance),
    tmi: String(identity.tmi),
    vm: String(hypo.versementMensuel),
    vi: String(hypo.versementInitial),
    h: String(hypo.horizon),
    pr: hypo.profil,
    tx: String(hypo.taux),
    ts: String(hypo.trancheSortie),
    ac: String(hypo.ageConversion),
    sim: activeSim,
  });
  if (code) p.set("cc", code);
  return p;
}

export interface DecodedPresentation {
  identity: ClientIdentity;
  hypo: HypoValues;
  code: string | null;
  activeSim: string;
}

export function decodePresentationParams(
  params: URLSearchParams | Record<string, string | undefined>
): DecodedPresentation {
  const get = (k: string): string | undefined =>
    params instanceof URLSearchParams ? params.get(k) ?? undefined : params[k];
  const ac = num(get("ac"), 67);
  return {
    identity: {
      revenuImposable: num(get("r")),
      parts: num(get("p"), 1),
      anneeNaissance: num(get("an"), 1980),
      tmi: num(get("tmi")),
    },
    hypo: {
      versementMensuel: num(get("vm")),
      versementInitial: num(get("vi")),
      horizon: num(get("h"), 20),
      profil: asProfil(get("pr")),
      taux: num(get("tx"), 0.04),
      trancheSortie: num(get("ts"), 30),
      ageConversion: (ac === 64 ? 64 : 67) as AgeConversion,
    },
    code: get("cc") ?? null,
    activeSim: get("sim") ?? "per",
  };
}
