/**
 * Helper PUR du « Simulateur d'impôt » conseiller (Lot 4).
 *
 * Simple interface AU-DESSUS de `fiscal-engine.ts` — ZÉRO ajout au moteur : il
 * calcule déjà l'IR complet (impotReel, calculerTMI, calculerParts, plafonnement
 * QF, décote, case T, demi-part handicap). On ne fait que l'exposer clairement.
 *
 * Consommation LECTURE SEULE de `fiscal-engine.ts` (jamais modifié).
 *
 * Isomorphe (aucun secret, aucun import serveur) → importable côté client (sim +
 * présentation) ET serveur (prefill des routes connectées).
 *
 * Particularité vs les simulateurs PER : ICI tout est « hypothèse ». Aucun champ
 * en lecture seule — y compris le revenu et la situation familiale sont librement
 * modifiables pour tester des scénarios (« et si le revenu changeait », « et si la
 * situation familiale changeait »).
 */

import { calculerParts, calculerTMI, impotBrut, impotReel } from "./fiscal-engine";
import {
  mapStatutToParts,
  STATUT_MARITAL_OPTIONS,
  type StatutParts,
} from "./fiscal-state";

/**
 * Régime de garde des enfants. Pertinent UNIQUEMENT pour un foyer non marié/pacsé
 * avec au moins un enfant. Modélise les trois branches du moteur :
 *  - classique → barème standard (parts enfants pleines) ;
 *  - alternee  → `garde_partagee` (quart de part par enfant) ;
 *  - isole     → `parent_isole` + case T (part entière pour le 1er enfant).
 * Mutuellement exclusifs (la case T suppose une garde exclusive, pas alternée).
 */
export type GardeRegime = "classique" | "alternee" | "isole";

export const GARDE_OPTIONS: { value: GardeRegime; label: string }[] = [
  { value: "classique", label: "Garde principale" },
  { value: "alternee", label: "Garde alternée" },
  { value: "isole", label: "Parent isolé (case T)" },
];

/** Libellé par défaut du menu déroulant « Statut marital » (premier de la liste). */
export const DEFAULT_STATUT_LABEL = STATUT_MARITAL_OPTIONS[0].label; // « Célibataire »

/**
 * Normalise une valeur texte (champ Découverte « Statut marital » ou Simulation)
 * vers un libellé EXACT du menu → garantit l'état actif des menus/pills. Repli
 * tolérant pour d'anciennes saisies en texte libre ; défaut « Célibataire ».
 */
export function normalizeStatutLabel(raw?: string | null): string {
  if (!raw) return DEFAULT_STATUT_LABEL;
  const exact = STATUT_MARITAL_OPTIONS.find((o) => o.label === raw);
  if (exact) return exact.label;
  const s = raw.toLowerCase();
  if (s.includes("mari")) return "Marié(e)";
  if (s.includes("pacs")) return "Pacsé(e)";
  if (s.includes("divorc")) return "Divorcé(e)";
  if (s.includes("veuf") || s.includes("veuv")) return "Veuf(ve)";
  return DEFAULT_STATUT_LABEL;
}

/** Normalise une valeur texte « Garde » (Découverte) vers un régime de garde. */
export function normalizeGarde(raw?: string | null): GardeRegime {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("altern") || s.includes("partag")) return "alternee";
  if (s.includes("isol")) return "isole";
  return "classique";
}

export interface ImpotInputs {
  /** Libellé exact du menu « Statut marital » (cf. STATUT_MARITAL_OPTIONS). */
  statut: string;
  /** Nombre d'enfants à charge (0–6+). */
  nbEnfants: number;
  /** Régime de garde (ignoré si couple ou 0 enfant). */
  garde: GardeRegime;
  /** Demi-part supplémentaire invalidité/handicap (case à cocher). */
  demiPartHandicap: boolean;
  /** Revenu net imposable du foyer (€/an). */
  revenuImposable: number;
}

export const DEFAULT_IMPOT_INPUTS: ImpotInputs = {
  statut: DEFAULT_STATUT_LABEL,
  nbEnfants: 0,
  garde: "classique",
  demiPartHandicap: false,
  revenuImposable: 0,
};

export interface ImpotResult {
  /** Impôt net sur le revenu (€). */
  impotNet: number;
  /** Tranche marginale d'imposition (0, 11, 30, 41, 45). */
  tmi: number;
  /** Parts du foyer sans enfants (1 ou 2). */
  partsBase: number;
  /** Parts totales retenues (avec enfants / handicap). */
  partsTotal: number;
  /** Taux moyen d'imposition = impôt net / revenu (décimal). */
  tauxMoyen: number;
  /** `true` si le plafonnement du quotient familial mord (mention pédagogique). */
  plafonnementActif: boolean;
  /** Statut effectivement retenu pour le calcul des parts (après garde/case T). */
  statutEffectif: StatutParts;
  /** `true` si la case T (parent isolé) est appliquée. */
  caseT: boolean;
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Résout le statut effectif + le contexte de plafonnement à partir des champs
 * saisis. Combine le statut marital, le nombre d'enfants et le régime de garde,
 * en respectant les contraintes du moteur (case T = garde exclusive).
 */
export function resolveParts(input: ImpotInputs): {
  statutEffectif: StatutParts;
  partsBase: number;
  partsTotal: number;
  caseT: boolean;
} {
  const baseStatut = mapStatutToParts(input.statut);
  const nbEnfants = Math.max(0, Math.round(num(input.nbEnfants)));
  const isCouple = baseStatut === "marie" || baseStatut === "pacse";

  let statutEffectif: StatutParts = baseStatut;
  let caseT = false;

  if (!isCouple && nbEnfants > 0) {
    if (input.garde === "isole") {
      statutEffectif = "parent_isole";
      caseT = true;
    } else if (input.garde === "alternee") {
      statutEffectif = "garde_partagee";
    }
    // "classique" → on garde le statut marital de base (celibataire/divorce).
  }

  const { partsBase, partsTotal } = calculerParts(
    statutEffectif,
    nbEnfants,
    input.demiPartHandicap
  );
  return { statutEffectif, partsBase, partsTotal, caseT };
}

/**
 * Calcul complet de l'impôt, déterministe, en consommation seule du moteur.
 *
 * Le plafonnement du QF est DÉTECTÉ sans toucher au moteur : on compare l'avantage
 * enfants réel (impotReel sans/avec enfants) à l'avantage non plafonné théorique
 * (impotBrut sans/avec, pur quotient familial). S'ils diffèrent → plafond a mordu.
 */
export function computeImpot(input: ImpotInputs): ImpotResult {
  const R = Math.max(0, num(input.revenuImposable));
  const { statutEffectif, partsBase, partsTotal, caseT } = resolveParts(input);
  const ctx = { caseT, handicap: input.demiPartHandicap };

  const impotNet = Math.round(impotReel(R, partsBase, partsTotal, ctx));
  const tmi = R > 0 ? calculerTMI(R, partsBase, partsTotal, ctx) : 0;
  const tauxMoyen = R > 0 ? impotNet / R : 0;

  // Détection du plafonnement du quotient familial (mention pédagogique).
  let plafonnementActif = false;
  if (partsTotal > partsBase && R > 0) {
    const avantageReel =
      impotReel(R, partsBase, partsBase, {}) - impotReel(R, partsBase, partsTotal, ctx);
    const avantageNonPlafonne = impotBrut(R, partsBase) - impotBrut(R, partsTotal);
    // Marge de 1 € pour absorber les arrondis ; un écart franc = plafond mordu.
    plafonnementActif = avantageReel < avantageNonPlafonne - 1;
  }

  return {
    impotNet,
    tmi,
    partsBase,
    partsTotal,
    tauxMoyen,
    plafonnementActif,
    statutEffectif,
    caseT,
  };
}

/** Formate un taux décimal en pourcentage français (ex. 0.123 → « 12,3 % »). */
export function formatPourcent(t: number): string {
  const v = t * 100;
  return `${v.toFixed(v % 1 === 0 ? 0 : 1).replace(".", ",")} %`;
}
