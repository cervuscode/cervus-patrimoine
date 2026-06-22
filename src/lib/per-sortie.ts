/**
 * Moteur de SORTIE du PER « version conseiller complète » (Lot 5 du MD).
 *
 * Module ISOLÉ et isomorphe (aucun secret) : consomme `fiscal-engine.ts` en
 * LECTURE SEULE (`projectionPER`, `calculerTMI`, `impotReel`) et `per-quick.ts`
 * (`PerProfil`, `TAUX_PAR_PROFIL`) — exactement comme `per-quick.ts`. Ne modifie
 * JAMAIS `fiscal-engine.ts`.
 *
 * Règles fiscales VALIDÉES par Auguste (ne rien inventer au-delà) :
 *  - Sortie 1 (capital intégral) : versements → tranche marginale sélectionnée ;
 *    plus-value → PFU 30 % (12,8 % IR + 17,2 % PS).
 *  - Sortie 2 (fractionnement 20 ans) : retrait fixe = capital/20 par an ; solde
 *    non-sorti capitalisé à 2 %/an ; chaque fraction suit la règle de la Sortie 1 ;
 *    le résiduel d'intérêts (2 %) est versé en année 20 et taxé au PFU 30 %.
 *  - Sortie 3 (rente Abeille Retraite Plurielle, TGF05, taux technique 0 %,
 *    éd. oct. 2024) : taux de conversion par tranche de naissance × âge (64/67) ;
 *    fiscalité RVTO = fraction imposable (40 % à 64/67 ans) imposée au barème
 *    (option b : delta `impotReel(R+fraction) − impotReel(R)`) + PS 17,2 %.
 */

import { calculerTMI, impotReel, projectionPER } from "./fiscal-engine";
import { resolveTaux, TAUX_PAR_PROFIL, type PerProfil } from "./per-quick";
// Plafond de déductibilité PER : source unique (per-quick), réutilisé tel quel ici.
export { computePlafondPER, PASS_2025, PER_PLANCHER, PER_PLAFOND_MAX, type PlafondPERResult } from "./per-quick";

// ── Constantes fiscalité de sortie ────────────────────────────────────────────
export const PFU_TAUX = 0.3; // 12,8 % IR + 17,2 % PS
export const PFU_IR = 0.128;
export const PFU_PS = 0.172;
export const FONDS_EURO_TAUX = 0.02; // rendement du solde non-sorti (Sortie 2)
export const FRACTIONNEMENT_ANNEES = 20;
export const PS_RENTE = 0.172; // prélèvements sociaux sur fraction imposable (Sortie 3)

// ── Table de conversion capital → rente (Abeille Retraite Plurielle) ──────────
// taux64 === null : conversion à 64 ans non proposée pour cette génération.
export interface LigneConversion {
  naissance: number;
  taux64: number | null;
  taux67: number;
}

export const TABLE_CONVERSION_ABEILLE: LigneConversion[] = [
  { naissance: 1957, taux64: null, taux67: 0.0365 },
  { naissance: 1962, taux64: 0.0323, taux67: 0.0355 },
  { naissance: 1967, taux64: 0.0315, taux67: 0.0346 },
  { naissance: 1972, taux64: 0.0308, taux67: 0.0337 },
  { naissance: 1977, taux64: 0.0301, taux67: 0.0329 },
  { naissance: 1982, taux64: 0.0294, taux67: 0.0322 },
  { naissance: 1987, taux64: 0.0288, taux67: 0.0314 },
  { naissance: 1992, taux64: 0.0283, taux67: 0.0308 },
  { naissance: 1997, taux64: 0.0277, taux67: 0.0302 },
  { naissance: 2002, taux64: 0.0272, taux67: 0.0296 },
];

export type AgeConversion = 64 | 67;

/** Rattachement à la ligne (tranche de 5 ans) la plus proche — AUCUNE interpolation. */
export function ligneConversionLaPlusProche(anneeNaissance: number): LigneConversion {
  return TABLE_CONVERSION_ABEILLE.reduce((best, l) =>
    Math.abs(l.naissance - anneeNaissance) < Math.abs(best.naissance - anneeNaissance) ? l : best
  );
}

// ── Barème RVTO — fraction imposable selon l'âge au 1er versement de la rente ──
// Table COMPLÈTE (réutilisable Lot 14 / autres âges) ; avec 64-67 ans → 40 %.
export interface TrancheRVTO {
  ageMaxExclusive: number;
  fraction: number;
}

export const BAREME_RVTO: TrancheRVTO[] = [
  { ageMaxExclusive: 50, fraction: 0.7 }, // moins de 50 ans
  { ageMaxExclusive: 60, fraction: 0.5 }, // 50 à 59 ans
  { ageMaxExclusive: 70, fraction: 0.4 }, // 60 à 69 ans
  { ageMaxExclusive: Infinity, fraction: 0.3 }, // 70 ans et plus
];

export function fractionImposableRente(agePremierVersement: number): number {
  return (
    BAREME_RVTO.find((t) => agePremierVersement < t.ageMaxExclusive) ??
    BAREME_RVTO[BAREME_RVTO.length - 1]
  ).fraction;
}

// ── Entrées / sorties ─────────────────────────────────────────────────────────
export interface PerSortieInputs {
  // IDENTITÉ (lecture seule en présentation)
  revenuImposable: number;
  parts: number;
  anneeNaissance: number;
  // HYPOTHÈSES (éditables)
  versementMensuel: number;
  versementInitial: number;
  horizon: number;
  profil: PerProfil;
  /** Taux de rendement annuel (décimal) — slider (Lot I). Absent → défaut profil. */
  taux?: number;
  trancheSortie: number; // 0 | 11 | 30 | 41 | 45
  ageConversion: AgeConversion; // 64 | 67
  /**
   * Foyer en couple (marié/pacsé) ? Mode autonome uniquement : reconstruit
   * partsBase pour le défaut de tranche de sortie (defaultTrancheSortie).
   * Ignoré en connecté (TMI/parts viennent de la fiche). Hors encode/decode.
   */
  couple?: boolean;
  /**
   * Revenu foncier (€/an), exclu de l'assiette du plafond de déductibilité PER.
   * Optionnel, défaut 0. Hors encode/decode (info conseiller).
   */
  foncier?: number;
}

export interface Sortie1Result {
  impotVersements: number;
  impotPlusValue: number;
  impotTotal: number;
  capitalNet: number;
}

export interface FluxFractionnement {
  annee: number;
  retrait: number;
  interet: number;
  soldeFin: number;
}

export interface Sortie2Result {
  retraitAnnuel: number;
  equivalentMensuel: number;
  interetsFondsEuro: number; // résiduel versé en année 20 (taxé PFU)
  capitalBrutTotal: number; // capitalFinal + intérêts
  impotTotal: number;
  capitalNet: number;
  flux: FluxFractionnement[];
}

export interface Sortie3Result {
  disponible: boolean; // false si conversion à 64 ans non proposée (taux64 null)
  ligne: LigneConversion;
  tauxApplique: number | null;
  renteAnnuelle: number;
  renteMensuelle: number;
  fractionImposable: number;
  montantImposable: number;
  impotIR: number;
  impotPS: number;
  renteNetteAnnuelle: number;
}

export interface PerSortieResult {
  capitalFinal: number;
  versementsCumules: number;
  plusValue: number;
  taux: number;
  courbe: Array<{ annee: number; capital: number }>;
  sortie1: Sortie1Result;
  sortie2: Sortie2Result;
  sortie3: Sortie3Result;
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

/**
 * TMI courante du foyer — sert de défaut à la tranche de sortie (consommation seule).
 * `couple` (mode autonome) reconstruit partsBase (2 si couple, sinon 1) pour que
 * calculerTMI détecte le plafonnement du quotient familial (TMI effective).
 */
export function defaultTrancheSortie(revenuImposable: number, parts: number, couple = false): number {
  const r = Math.max(0, num(revenuImposable));
  const p = Math.max(1, num(parts, 1));
  const partsBase = Math.min(couple ? 2 : 1, p);
  return r > 0 ? calculerTMI(r, partsBase, p) : 0;
}

export const DEFAULT_PER_SORTIE_INPUTS: PerSortieInputs = {
  revenuImposable: 0,
  parts: 1,
  anneeNaissance: 1980,
  versementMensuel: 0,
  versementInitial: 0,
  horizon: 20,
  profil: "equilibre",
  trancheSortie: 30,
  ageConversion: 67,
};

export function computePerSortie(input: PerSortieInputs): PerSortieResult {
  const revenuImposable = Math.max(0, num(input.revenuImposable));
  const parts = Math.max(1, num(input.parts, 1));
  const anneeNaissance = Math.round(num(input.anneeNaissance, 1980));
  const versementMensuel = Math.max(0, num(input.versementMensuel));
  const versementInitial = Math.max(0, num(input.versementInitial));
  const horizon = Math.max(1, Math.round(num(input.horizon, 1)));
  const profil: PerProfil = input.profil in TAUX_PAR_PROFIL ? input.profil : "equilibre";
  const tranche = num(input.trancheSortie);
  const ageConversion: AgeConversion = input.ageConversion === 64 ? 64 : 67;
  const taux = resolveTaux(profil, input.taux);

  const { capitalFinal, courbe } = projectionPER(versementMensuel, taux, horizon, versementInitial);
  const versementsCumules = versementInitial + versementMensuel * 12 * horizon;
  const plusValue = Math.max(0, capitalFinal - versementsCumules);

  // ── Sortie 1 — capital intégral ─────────────────────────────────────────────
  const s1ImpotVersements = versementsCumules * (tranche / 100);
  const s1ImpotPlusValue = plusValue * PFU_TAUX;
  const s1ImpotTotal = s1ImpotVersements + s1ImpotPlusValue;
  const sortie1: Sortie1Result = {
    impotVersements: Math.round(s1ImpotVersements),
    impotPlusValue: Math.round(s1ImpotPlusValue),
    impotTotal: Math.round(s1ImpotTotal),
    capitalNet: Math.round(capitalFinal - s1ImpotTotal),
  };

  // ── Sortie 2 — fractionnement 20 ans, non-sorti à 2 % ───────────────────────
  const retraitAnnuel = capitalFinal / FRACTIONNEMENT_ANNEES;
  const flux: FluxFractionnement[] = [];
  let solde = capitalFinal;
  for (let annee = 1; annee <= FRACTIONNEMENT_ANNEES; annee++) {
    const soldeApresRetrait = solde - retraitAnnuel;
    const interet = Math.max(0, soldeApresRetrait) * FONDS_EURO_TAUX;
    solde = soldeApresRetrait + interet;
    flux.push({
      annee,
      retrait: Math.round(retraitAnnuel),
      interet: Math.round(interet),
      soldeFin: Math.round(Math.max(0, solde)),
    });
  }
  // Les 20 retraits fixes rendent exactement le capital ; le solde résiduel = total
  // des intérêts 2 %, versé en année 20 et taxé au PFU.
  const interetsFondsEuro = Math.max(0, solde);
  const s2ImpotVersements = versementsCumules * (tranche / 100); // fractions cumulées = versements
  const s2ImpotPVAccum = plusValue * PFU_TAUX;
  const s2ImpotInterets = interetsFondsEuro * PFU_TAUX;
  const s2ImpotTotal = s2ImpotVersements + s2ImpotPVAccum + s2ImpotInterets;
  const capitalBrutTotal = capitalFinal + interetsFondsEuro;
  const sortie2: Sortie2Result = {
    retraitAnnuel: Math.round(retraitAnnuel),
    equivalentMensuel: Math.round(retraitAnnuel / 12),
    interetsFondsEuro: Math.round(interetsFondsEuro),
    capitalBrutTotal: Math.round(capitalBrutTotal),
    impotTotal: Math.round(s2ImpotTotal),
    capitalNet: Math.round(capitalBrutTotal - s2ImpotTotal),
    flux,
  };

  // ── Sortie 3 — rente viagère (Abeille) ──────────────────────────────────────
  const ligne = ligneConversionLaPlusProche(anneeNaissance);
  const tauxApplique = ageConversion === 64 ? ligne.taux64 : ligne.taux67;
  const disponible = tauxApplique != null;
  const renteAnnuelle = disponible ? capitalFinal * (tauxApplique as number) : 0;
  const fractionImposable = fractionImposableRente(ageConversion);
  const montantImposable = renteAnnuelle * fractionImposable;
  // Option (b) : vrai delta d'impôt marginal sur le revenu courant (lecture seule).
  const impotIR = disponible
    ? Math.max(
        0,
        impotReel(revenuImposable + montantImposable, parts, parts) -
          impotReel(revenuImposable, parts, parts)
      )
    : 0;
  const impotPS = montantImposable * PS_RENTE;
  const sortie3: Sortie3Result = {
    disponible,
    ligne,
    tauxApplique,
    renteAnnuelle: Math.round(renteAnnuelle),
    renteMensuelle: Math.round(renteAnnuelle / 12),
    fractionImposable,
    montantImposable: Math.round(montantImposable),
    impotIR: Math.round(impotIR),
    impotPS: Math.round(impotPS),
    renteNetteAnnuelle: Math.round(renteAnnuelle - impotIR - impotPS),
  };

  return {
    capitalFinal,
    versementsCumules: Math.round(versementsCumules),
    plusValue: Math.round(plusValue),
    taux,
    courbe,
    sortie1,
    sortie2,
    sortie3,
  };
}

// ── Encode / decode query params ──────────────────────────────────────────────
export function encodePerSortieInputs(input: PerSortieInputs): URLSearchParams {
  return new URLSearchParams({
    r: String(input.revenuImposable),
    p: String(input.parts),
    an: String(input.anneeNaissance),
    vm: String(input.versementMensuel),
    vi: String(input.versementInitial),
    h: String(input.horizon),
    pr: input.profil,
    ts: String(input.trancheSortie),
    ac: String(input.ageConversion),
  });
}

export function decodePerSortieInputs(
  params: URLSearchParams | Record<string, string | undefined>
): PerSortieInputs {
  const get = (k: string): string | undefined =>
    params instanceof URLSearchParams ? params.get(k) ?? undefined : params[k];
  const profilRaw = get("pr");
  const profil: PerProfil =
    profilRaw === "prudent" || profilRaw === "equilibre" || profilRaw === "dynamique"
      ? profilRaw
      : "equilibre";
  const ac = num(get("ac"), 67);
  return {
    revenuImposable: num(get("r")),
    parts: num(get("p"), 1),
    anneeNaissance: num(get("an"), 1980),
    versementMensuel: num(get("vm")),
    versementInitial: num(get("vi")),
    horizon: num(get("h"), 20),
    profil,
    trancheSortie: num(get("ts")),
    ageConversion: ac === 64 ? 64 : 67,
  };
}
