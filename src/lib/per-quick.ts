/**
 * Helper PUR du simulateur PER « version conseiller » (Lot 2, point C).
 *
 * Consommation LECTURE SEULE de `fiscal-engine.ts` (jamais modifié) : on mappe des
 * entrées minimales (2-3 chiffres) vers un résultat pertinent et immédiat. C'est la
 * structure du simulateur conseiller ; le Lot 2bis y branchera la propagation
 * d'état partagé (TMI/revenu/parts) sans repenser cette structure.
 *
 * Isomorphe (aucun secret, aucun import serveur) → importable côté client (sim +
 * présentation) ET serveur. Sert aussi de source unique d'encode/decode des query
 * params partagés entre l'onglet sim et l'onglet présentation.
 */

import {
  calculerTMI,
  economieFiscaleAnnuelle,
  projectionPER,
} from "./fiscal-engine";

export type PerProfil = "prudent" | "equilibre" | "dynamique";

/** Taux de rendement annuel prudent par profil (cohérent avec le simulateur PER public). */
export const TAUX_PAR_PROFIL: Record<PerProfil, number> = {
  prudent: 0.03,
  equilibre: 0.04,
  dynamique: 0.05,
};

export const PROFIL_LABELS: Record<PerProfil, string> = {
  prudent: "Prudent",
  equilibre: "Équilibré",
  dynamique: "Dynamique",
};

export interface PerQuickInputs {
  /** Revenu net imposable du foyer (€/an). */
  revenuImposable: number;
  /** Nombre de parts fiscales. */
  parts: number;
  /** Versement PER mensuel envisagé (€). */
  versementMensuel: number;
  /** Apport initial unique (€), optionnel. */
  versementInitial: number;
  /** Horizon de placement (années jusqu'à la retraite). */
  horizon: number;
  profil: PerProfil;
}

export interface PerQuickResult {
  /** Tranche marginale d'imposition (0, 11, 30, 41, 45). */
  tmi: number;
  /** Économie d'impôt annuelle = versement annuel × TMI. */
  economieFiscale: number;
  /** Total versé sur la période (initial + mensuels). */
  totalVerse: number;
  /** Capital projeté à l'horizon. */
  capitalFinal: number;
  /** Trajectoire annuelle (pour le graphique). */
  courbe: Array<{ annee: number; capital: number }>;
  /** Taux annuel retenu (déduit du profil). */
  taux: number;
}

export const DEFAULT_PER_INPUTS: PerQuickInputs = {
  revenuImposable: 0,
  parts: 1,
  versementMensuel: 0,
  versementInitial: 0,
  horizon: 20,
  profil: "equilibre",
};

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

/** Calcul complet, déterministe, en consommation seule du moteur fiscal. */
export function computePerQuick(input: PerQuickInputs): PerQuickResult {
  const revenuImposable = Math.max(0, num(input.revenuImposable));
  const parts = Math.max(1, num(input.parts, 1));
  const versementMensuel = Math.max(0, num(input.versementMensuel));
  const versementInitial = Math.max(0, num(input.versementInitial));
  const horizon = Math.max(1, Math.round(num(input.horizon, 1)));
  const profil: PerProfil = input.profil in TAUX_PAR_PROFIL ? input.profil : "equilibre";
  const taux = TAUX_PAR_PROFIL[profil];

  // TMI au quotient R/parts (partsBase = partsTotal → pas d'avantage QF : on veut le
  // taux marginal, pas l'impôt total). Définition standard de la TMI.
  const tmi = revenuImposable > 0 ? calculerTMI(revenuImposable, parts, parts) : 0;
  const economieFiscale = economieFiscaleAnnuelle(versementMensuel, tmi);
  const { capitalFinal, courbe } = projectionPER(
    versementMensuel,
    taux,
    horizon,
    versementInitial
  );
  const totalVerse = versementInitial + versementMensuel * 12 * horizon;

  return { tmi, economieFiscale, totalVerse, capitalFinal, courbe, taux };
}

// ── Encode / decode query params (sim ↔ présentation) ─────────────────────────
// Clés courtes et stables. La présentation recompute à partir de ces seules entrées.
export function encodePerInputs(input: PerQuickInputs): URLSearchParams {
  return new URLSearchParams({
    r: String(input.revenuImposable),
    p: String(input.parts),
    vm: String(input.versementMensuel),
    vi: String(input.versementInitial),
    h: String(input.horizon),
    pr: input.profil,
  });
}

export function decodePerInputs(params: URLSearchParams | Record<string, string | undefined>): PerQuickInputs {
  const get = (k: string): string | undefined =>
    params instanceof URLSearchParams ? params.get(k) ?? undefined : params[k];
  const profilRaw = get("pr");
  const profil: PerProfil =
    profilRaw === "prudent" || profilRaw === "equilibre" || profilRaw === "dynamique"
      ? profilRaw
      : "equilibre";
  return {
    revenuImposable: num(get("r")),
    parts: num(get("p"), 1),
    versementMensuel: num(get("vm")),
    versementInitial: num(get("vi")),
    horizon: num(get("h"), 20),
    profil,
  };
}

export function formatEuro(n: number): string {
  return Math.round(n).toLocaleString("fr-FR") + " €";
}
