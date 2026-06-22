/**
 * Contributions sur les hauts revenus — CEHR (art. 223 sexies CGI) et CDHR (art. 224 CGI).
 *
 * Module PUR isomorphe (aucun secret). OUTIL CONSEILLER UNIQUEMENT — jamais branché sur
 * le site public (cervuspatrimoine.fr). Ne consomme PAS `fiscal-engine` : l'assiette est
 * le RFR, sans quotient familial.
 *
 * ── SOURCE DE VÉRITÉ : moteur officiel DGFiP (docs/dgfip-source/, licence CeCILL 2.1) ──
 * Constantes vérifiées dans `chap-thr.m` + `tgvI.m` (millésime « calcul 2025 / revenus
 * 2024 ») :
 *   CEHR (règle 80000) : LIMHR1=250000, LIMHR2=500000, TXHR1=3 %, TXHR2=4 %.
 *     Base = REVKIREHR (le RFR), comparé à LIMHR1×(1+couple) → aucune division par les
 *     parts (QF exclu). Le lissage/quotient des revenus exceptionnels (HRBASELISSE…) est
 *     HORS PÉRIMÈTRE RDV (non implémenté).
 *   CDHR (règles 80050-80090) : TX20=20 %, LIM_DHRCDV=330000 (décote), TX825=82,5 %,
 *     MAJCOUPDHR=12500, MAJPERSDHR=1500. ⚠️ Dans le moteur du rôle, la CDHR est codée mais
 *     NEUTRALISÉE (× 0) pour ce millésime (recouvrement par acompte séparé) ; la formule
 *     canonique est en commentaires de chap-thr.m (lignes 135, 157, 201-203) et reproduite
 *     ici. Seuils reconduits par la LF 2026.
 *
 * Les seuils sont DOUBLÉS pour les couples soumis à imposition commune (BOOL_0AM=1 dans la
 * DGFiP → facteur 2). Tout est étiqueté « estimation » côté UI : le RFR par défaut est
 * approximatif (override manuel du RFR réel de l'avis d'imposition prévu).
 */

// ── CEHR (art. 223 sexies CGI) ────────────────────────────────────────────────
export const CEHR_SEUIL1 = 250000; // LIMHR1 (×2 si couple)
export const CEHR_SEUIL2 = 500000; // LIMHR2 (×2 si couple)
export const CEHR_TAUX1 = 0.03; // TXHR1
export const CEHR_TAUX2 = 0.04; // TXHR2

export interface CEHRResult {
  /** Contribution due, arrondie à l'euro. */
  contribution: number;
  /** RFR retenu (base de calcul). */
  base: number;
  /** Facteur foyer : 1 (personne seule) ou 2 (couple, seuils doublés). */
  facteurFoyer: number;
  seuil1: number;
  seuil2: number;
  /** `true` si la première tranche mord (RFR > seuil1). */
  assujetti: boolean;
}

/** CEHR : 3 % entre seuil1 et seuil2, 4 % au-delà. Assiette = RFR (QF exclu). */
export function computeCEHR(rfr: number, couple: boolean): CEHRResult {
  const f = couple ? 2 : 1;
  const seuil1 = CEHR_SEUIL1 * f;
  const seuil2 = CEHR_SEUIL2 * f;
  const base = Math.max(0, rfr);
  const tranche1 = Math.max(0, Math.min(base, seuil2) - seuil1) * CEHR_TAUX1;
  const tranche2 = Math.max(0, base - seuil2) * CEHR_TAUX2;
  return {
    contribution: Math.round(tranche1 + tranche2),
    base,
    facteurFoyer: f,
    seuil1,
    seuil2,
    assujetti: base > seuil1,
  };
}

// ── CDHR (art. 224 CGI) ───────────────────────────────────────────────────────
export const CDHR_TAUX = 0.2; // TX20 — taux plancher 20 %
export const CDHR_SEUIL = 250000; // LIMHR1 (×2 si couple) — assujettissement
export const CDHR_DECOTE_PLAFOND = 330000; // LIM_DHRCDV (×2 si couple) — borne haute de la décote
export const CDHR_DECOTE_COEF = 0.825; // TX825
export const CDHR_MAJ_COUPLE = 12500; // MAJCOUPDHR
export const CDHR_MAJ_PAC = 1500; // MAJPERSDHR

export interface CDHRInput {
  /** RFR retraité (approximé ou saisi manuellement). */
  rfr: number;
  /** IR recalculé du foyer (impotReel). */
  ir: number;
  /** CEHR non lissée (computeCEHR.contribution). */
  cehr: number;
  couple: boolean;
  /** Nombre de personnes à charge (majoration 1 500 €/PAC). */
  personnesCharge: number;
}

export interface CDHRResult {
  /** Contribution différentielle due, arrondie à l'euro. */
  contribution: number;
  /** `true` si RFR > seuil d'assujettissement. */
  assujetti: boolean;
  /** Cotisation brute = 20 % × RFR. */
  cotisationBrute: number;
  /** Décote d'entrée (art. 224 V), 0 hors bande [seuil ; plafond décote]. */
  decote: number;
  decoteApplicable: boolean;
  /** Imposition reconstituée = IR + CEHR + majorations foyer (terme soustrait). */
  impositionReconstituee: number;
  majorationFoyer: number;
  seuil: number;
}

/**
 * CDHR = max(0, (20 % × RFR − décote) − (IR recalculé + CEHR non lissée + majorations foyer)).
 * Décote (art. 224 V) : max(0, cotisationBrute − 82,5 % × (RFR − seuil)), uniquement dans
 * la bande [seuil ; plafond décote] (250k-330k seul / 500k-660k couple).
 */
export function computeCDHR(input: CDHRInput): CDHRResult {
  const f = input.couple ? 2 : 1;
  const seuil = CDHR_SEUIL * f;
  const plafondDecote = CDHR_DECOTE_PLAFOND * f;
  const rfr = Math.max(0, input.rfr);
  const assujetti = rfr > seuil;

  const cotisationBrute = rfr * CDHR_TAUX;

  const decoteApplicable = assujetti && rfr <= plafondDecote;
  const decote = decoteApplicable
    ? Math.max(0, cotisationBrute - CDHR_DECOTE_COEF * (rfr - seuil))
    : 0;

  const majorationFoyer =
    (input.couple ? CDHR_MAJ_COUPLE : 0) +
    Math.max(0, Math.round(input.personnesCharge)) * CDHR_MAJ_PAC;
  const impositionReconstituee =
    Math.max(0, input.ir) + Math.max(0, input.cehr) + majorationFoyer;

  const cotisationApresDecote = cotisationBrute - decote;
  const contribution = assujetti
    ? Math.max(0, Math.round(cotisationApresDecote - impositionReconstituee))
    : 0;

  return {
    contribution,
    assujetti,
    cotisationBrute: Math.round(cotisationBrute),
    decote: Math.round(decote),
    decoteApplicable,
    impositionReconstituee: Math.round(impositionReconstituee),
    majorationFoyer,
    seuil,
  };
}

// ── RFR approximatif ──────────────────────────────────────────────────────────
export interface RFRApproxSource {
  /**
   * Revenu net imposable du foyer (base barème). ⚠️ Inclut DÉJÀ foncier/BNC/BIC via
   * `computeFiscalState` (ou via la saisie « Revenu imposable » du conseiller). On ne les
   * ré-additionne donc PAS ici (ce serait un double comptage).
   */
  revenuNetImposable: number;
  /**
   * Revenus de capital taxés au PFU hors base barème (dividendes, intérêts, plus-values
   * mobilières) — réintégrés dans le RFR. Non disponibles dans la Découverte RDV
   * actuelle (réservé) ; le RFR exact se saisit via l'override manuel.
   */
  revenusCapitalHorsBareme?: number;
}

/**
 * RFR APPROXIMATIF (étiqueté « estimation » côté UI). Faute des réintégrations fines du
 * RFR (revenus exonérés réintégrés, abattements, etc.), on retient le revenu net
 * imposable + les revenus de capital hors barème éventuels. Le RFR réel de l'avis
 * d'imposition se saisit en override manuel pour un calcul exact.
 */
export function approximerRFR(src: RFRApproxSource): number {
  return Math.max(0, src.revenuNetImposable + (src.revenusCapitalHorsBareme ?? 0));
}

// ── Agrégat pratique (UI conseiller) ──────────────────────────────────────────
export interface ContributionsInput {
  rfr: number;
  /** `true` = RFR approximatif (afficher l'étiquette « à affiner ») ; `false` = override saisi. */
  rfrEstime: boolean;
  ir: number;
  couple: boolean;
  personnesCharge: number;
}

export interface ContributionsResult {
  rfr: number;
  rfrEstime: boolean;
  cehr: CEHRResult;
  cdhr: CDHRResult;
  /** `true` si le foyer est concerné (RFR au-dessus du seuil d'assujettissement). */
  concerne: boolean;
}

/** Calcule CEHR puis CDHR (qui consomme la CEHR). Aucune écriture, pur. */
export function computeContributionsHautsRevenus(i: ContributionsInput): ContributionsResult {
  const cehr = computeCEHR(i.rfr, i.couple);
  const cdhr = computeCDHR({
    rfr: i.rfr,
    ir: i.ir,
    cehr: cehr.contribution,
    couple: i.couple,
    personnesCharge: i.personnesCharge,
  });
  const concerne = Math.max(0, i.rfr) > CEHR_SEUIL1 * (i.couple ? 2 : 1);
  return { rfr: Math.max(0, i.rfr), rfrEstime: i.rfrEstime, cehr, cdhr, concerne };
}
