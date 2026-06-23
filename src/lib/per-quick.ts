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

/** Bornes du slider de taux de rendement (Lot I), en décimal. */
export const TAUX_MIN = 0;
export const TAUX_MAX = 0.1; // 10 %

export function clampTaux(t: number): number {
  return Math.min(TAUX_MAX, Math.max(TAUX_MIN, t));
}

// ── Plafond de déductibilité PER (épargne retraite) ───────────────────────────
// Source DGFiP (docs/dgfip-source/chap-perp.m règle 31015, tgvI.m) :
//   plafond = max( min(10 % × revenus_pro_nets, 10 % × 8 × PASS), 10 % × PASS )
// Constantes du moteur DGFiP (revenus 2024, PASS 2024 = 46 368) : TX_PERPPLAF=10 %,
// LIM_PERPMIN=4637, LIM_PERPMAX=37094 — vérifiées : 10 % × 46 368 = 4 636,8 ≈ 4 637 et
// 10 % × 8 × 46 368 = 37 094,4 ≈ 37 094 (le millésime DGFiP cale bien le plafond sur le
// PASS de l'année de revenus).
//
// ⚠️ MILLÉSIME CERVUS = VERSEMENTS 2026 → PASS 2026 = 48 060 € :
//   plancher 4 806 €, plafond 38 448 €.
// CHOIX ASSUMÉ (pédagogique/indicatif) : on applique le PASS de l'année de VERSEMENT.
//  • TNS / Madelin (art. 154 bis) : la déduction se calcule sur le bénéfice de l'année
//    même du versement → versements 2026 = PASS 2026, strictement correct.
//  • Salarié (art. 163 quatervingts) : le plafond officiel de l'avis est calculé sur les
//    revenus N-1 avec le PASS N-1 (donc versements 2026 → techniquement PASS 2025). On
//    retient ici PASS 2026 comme ESTIMATION PROSPECTIVE de la capacité de l'année courante,
//    cohérent avec l'usage indicatif de l'outil (qui ne calcule déjà pas les reliquats N-3).
// OUTIL CONSEILLER UNIQUEMENT (jamais le site public). Alerte non bloquante.
export const PASS_2026 = 48060;
export const PER_PLAFOND_TAUX = 0.1;
export const PER_PLANCHER = 4806; // 10 % × PASS 2026
export const PER_PLAFOND_MAX = 38448; // 10 % × 8 × PASS 2026

export interface PlafondPERResult {
  /** Plafond annuel de déduction (€). */
  plafond: number;
  /** Assiette retenue = revenus professionnels nets (revenu imposable − foncier). */
  assietteProNet: number;
  /** Versement annuel comparé (mensuel × 12 + apport initial de l'année). */
  versementAnnuel: number;
  /** `true` = plancher PASS appliqué (assiette faible/nulle). */
  plancherApplique: boolean;
  /** `true` = plafond 8×PASS appliqué (assiette très élevée). */
  plafondMaxApplique: boolean;
  /** `true` = versement annuel > plafond (déclenche l'alerte non bloquante). */
  depassement: boolean;
  depassementMontant: number;
}

/**
 * Plafond PER pur (consommation seule des constantes DGFiP mises à jour). `revenuProNet`
 * = revenus professionnels nets (foncier exclu — conforme à l'assiette DGFiP). Ne calcule
 * PAS les reliquats des 3 années précédentes (non disponibles) : mention UI seulement.
 */
export function computePlafondPER(revenuProNet: number, versementAnnuel: number): PlafondPERResult {
  const assiette = Math.max(0, num(revenuProNet));
  const dixPourcent = assiette * PER_PLAFOND_TAUX;
  const plafond = Math.max(PER_PLANCHER, Math.min(dixPourcent, PER_PLAFOND_MAX));
  const va = Math.max(0, num(versementAnnuel));
  return {
    plafond,
    assietteProNet: assiette,
    versementAnnuel: va,
    plancherApplique: dixPourcent <= PER_PLANCHER,
    plafondMaxApplique: dixPourcent >= PER_PLAFOND_MAX,
    depassement: va > plafond,
    depassementMontant: Math.max(0, va - plafond),
  };
}

/** Taux effectif : valeur du slider si fournie (clampée), sinon défaut du profil. */
export function resolveTaux(profil: PerProfil, taux?: number): number {
  return taux != null && Number.isFinite(taux) ? clampTaux(taux) : TAUX_PAR_PROFIL[profil];
}

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
  /**
   * Foyer en couple (marié/pacsé) ? Sert UNIQUEMENT en mode autonome à
   * reconstruire partsBase (2 si couple, sinon 1) pour que calculerTMI détecte
   * le plafonnement du quotient familial. Absent → personne seule (partsBase 1).
   * Ignoré en mode connecté (la TMI vient de opts.tmi). Hors encode/decode.
   */
  couple?: boolean;
  /**
   * Revenu foncier (€/an), exclu de l'assiette du plafond de déductibilité PER
   * (conforme DGFiP : assiette = revenus professionnels nets). Optionnel, défaut 0.
   * Hors encode/decode (info conseiller).
   */
  foncier?: number;
  /**
   * Taux de rendement annuel (décimal, ex. 0.04). Optionnel (Lot I) : hypothèse
   * ajustable au slider. Absent → défaut = TAUX_PAR_PROFIL[profil].
   */
  taux?: number;
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

/**
 * Calcul complet, déterministe, en consommation seule du moteur fiscal.
 *
 * `opts.tmi` (Lot 2) : TMI partagée déjà calculée par `computeFiscalState` au niveau
 * du contexte client (mode CONNECTÉ) → injectée pour ne PAS la recalculer. Absente
 * (mode autonome / sans contexte) → calcul local au quotient R/parts (inchangé).
 */
export function computePerQuick(input: PerQuickInputs, opts?: { tmi?: number }): PerQuickResult {
  const revenuImposable = Math.max(0, num(input.revenuImposable));
  const parts = Math.max(1, num(input.parts, 1));
  const versementMensuel = Math.max(0, num(input.versementMensuel));
  const versementInitial = Math.max(0, num(input.versementInitial));
  const horizon = Math.max(1, Math.round(num(input.horizon, 1)));
  const profil: PerProfil = input.profil in TAUX_PAR_PROFIL ? input.profil : "equilibre";
  const taux = resolveTaux(profil, input.taux);

  // TMI EFFECTIVE : marginal réel incluant le plafonnement du quotient familial.
  // partsBase reconstruit depuis `couple` (2 si couple, sinon 1), partsTotal = parts.
  // L'écart base↔total laisse calculerTMI/impotReel détecter le plafonnement.
  // En connecté, opts.tmi (= fiscalState.tmi déjà correct) prime.
  const partsBase = Math.min(input.couple ? 2 : 1, parts);
  const tmi =
    opts?.tmi != null
      ? opts.tmi
      : revenuImposable > 0
        ? calculerTMI(revenuImposable, partsBase, parts)
        : 0;
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
