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
import { DEFAULT_IMPOT_INPUTS, type GardeRegime, type ImpotInputs } from "./impot-sim";
import { DEFAULT_REDUCTION_INPUTS, type ReductionInputs } from "./reduction-impot";
import { DEFAULT_COMPARATEUR_INPUTS, type ComparateurInputs } from "./comparateur-av-per";

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
  /**
   * Hypothèses du « Simulateur d'impôt » (Lot 4). Sous-objet groupé : additif,
   * IGNORÉ par les vues PER. Particularité : ICI tout est hypothèse (y compris
   * revenu et situation familiale), aucun champ en lecture seule → l'onglet impôt
   * n'utilise PAS `ClientIdentity` (« Actualiser » est sans effet sur cet onglet).
   */
  impot: ImpotInputs;
  /**
   * Hypothèses de l'« Illustration réduction d'impôt » (Lot 6). Sous-objet dédié
   * (additif, IGNORÉ par les autres vues) : reprend les champs situation du Lot 4
   * + le montant du versement PER à illustrer. Même particularité : tout est
   * hypothèse, n'utilise PAS `ClientIdentity`.
   */
  reduction: ReductionInputs;
  /**
   * Hypothèses du « Comparateur AV / PER » (Lot 7). Sous-objet dédié (additif,
   * IGNORÉ par les autres vues). Ne porte QUE les hypothèses : revenu/parts/TMI
   * viennent de `ClientIdentity` (rafraîchissables via Actualiser, comme les vues
   * PER). `marie` (abattement AV) est ici car éditable.
   */
  comparateur: ComparateurHypo;
}

/** Portion « hypothèses » du comparateur (revenu/parts viennent de l'identité). */
export type ComparateurHypo = Omit<ComparateurInputs, "revenuImposable" | "parts">;

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
  impot: DEFAULT_IMPOT_INPUTS,
  reduction: DEFAULT_REDUCTION_INPUTS,
  comparateur: {
    marie: DEFAULT_COMPARATEUR_INPUTS.marie,
    effortNetMensuel: DEFAULT_COMPARATEUR_INPUTS.effortNetMensuel,
    effortNetInitial: DEFAULT_COMPARATEUR_INPUTS.effortNetInitial,
    horizon: DEFAULT_COMPARATEUR_INPUTS.horizon,
    profil: DEFAULT_COMPARATEUR_INPUTS.profil,
    trancheSortie: DEFAULT_COMPARATEUR_INPUTS.trancheSortie,
  },
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
    // Hypothèses du simulateur d'impôt (Lot 4).
    is: hypo.impot.statut,
    ie: String(hypo.impot.nbEnfants),
    ig: hypo.impot.garde,
    ih: hypo.impot.demiPartHandicap ? "1" : "0",
    ir: String(hypo.impot.revenuImposable),
    // Hypothèses de l'illustration réduction d'impôt (Lot 6).
    xs: hypo.reduction.statut,
    xe: String(hypo.reduction.nbEnfants),
    xg: hypo.reduction.garde,
    xh: hypo.reduction.demiPartHandicap ? "1" : "0",
    xr: String(hypo.reduction.revenuImposable),
    xv: String(hypo.reduction.versementPer),
    // Hypothèses du comparateur AV / PER (Lot 7) — revenu/parts viennent de l'identité.
    cem: String(hypo.comparateur.effortNetMensuel),
    cei: String(hypo.comparateur.effortNetInitial),
    ch: String(hypo.comparateur.horizon),
    cpr: hypo.comparateur.profil,
    cts: String(hypo.comparateur.trancheSortie),
    cma: hypo.comparateur.marie ? "1" : "0",
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
  const gardeRaw = get("ig");
  const garde: GardeRegime =
    gardeRaw === "alternee" || gardeRaw === "isole" ? gardeRaw : "classique";
  const xgRaw = get("xg");
  const gardeReduction: GardeRegime =
    xgRaw === "alternee" || xgRaw === "isole" ? xgRaw : "classique";
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
      impot: {
        statut: get("is") ?? DEFAULT_IMPOT_INPUTS.statut,
        nbEnfants: num(get("ie")),
        garde,
        demiPartHandicap: get("ih") === "1",
        revenuImposable: num(get("ir")),
      },
      reduction: {
        statut: get("xs") ?? DEFAULT_REDUCTION_INPUTS.statut,
        nbEnfants: num(get("xe")),
        garde: gardeReduction,
        demiPartHandicap: get("xh") === "1",
        revenuImposable: num(get("xr")),
        versementPer: num(get("xv")),
      },
      comparateur: {
        effortNetMensuel: num(get("cem")),
        effortNetInitial: num(get("cei")),
        horizon: num(get("ch"), 20),
        profil: asProfil(get("cpr")),
        trancheSortie: num(get("cts")),
        marie: get("cma") === "1",
      },
    },
    code: get("cc") ?? null,
    activeSim: get("sim") ?? "per",
  };
}
