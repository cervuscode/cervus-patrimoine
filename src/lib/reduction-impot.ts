/**
 * Helper PUR de l'« Illustration du mécanisme de réduction d'impôt » (Lot 6).
 *
 * Montre visuellement comment un versement PER déductible fait « descendre » le
 * revenu imposable à travers les tranches du barème — colonnes avant/après par
 * tranche. Distinct du Simulateur d'impôt (Lot 4, qui ne donne qu'un montant) :
 * celui-ci est volontairement visuel et pédagogique.
 *
 * Consommation LECTURE SEULE de `fiscal-engine.ts` (jamais modifié) : les chiffres
 * d'impôt / TMI / parts viennent TOUJOURS du vrai moteur via `computeImpot`
 * (impotReel → plafonnement, décote, case T, handicap). Le découpage en tranches
 * ci-dessous est ILLUSTRATIF (somme = impôt brut au quotient) — sa seule fonction
 * est le rendu visuel.
 *
 * Les seuils de tranches sont RECOPIÉS ici en constante d'affichage (miroir de
 * `fiscal-engine` TRANCHES) plutôt que d'exporter `TRANCHES` du moteur : zéro ajout
 * au moteur. Mise à jour annuelle = ce seul tableau (comme bareme-reference-2026).
 *
 * Isomorphe (aucun secret, aucun import serveur) → importable client (sim +
 * présentation) ET serveur (prefill des routes connectées).
 */

import { computeImpot, resolveParts, type ImpotInputs } from "./impot-sim";

/**
 * Miroir des tranches du barème 2026 (`fiscal-engine` TRANCHES) — AFFICHAGE SEUL.
 * Le calcul d'impôt autoritatif reste `impotReel`. Couleurs = charte Cervus
 * (crème → bronze foncé), intensité croissante avec le taux.
 */
export const TRANCHES_AFFICHAGE: Array<{
  taux: number; // 0, 0.11, 0.30, 0.41, 0.45
  min: number; // borne basse (revenu par part)
  max: number; // borne haute (revenu par part), Infinity pour la dernière
  label: string; // « 0 % », « 11 % »…
  color: string; // couleur du bloc (charte)
}> = [
  { taux: 0, min: 0, max: 11600, label: "0 %", color: "#F2EDE8" },
  { taux: 0.11, min: 11600, max: 29579, label: "11 %", color: "#a07d62" },
  { taux: 0.3, min: 29579, max: 84577, label: "30 %", color: "#795D48" },
  { taux: 0.41, min: 84577, max: 181917, label: "41 %", color: "#5D4738" },
  { taux: 0.45, min: 181917, max: Infinity, label: "45 %", color: "#3a2c22" },
];

/** Tout est « hypothèse » (comme le Lot 4) + le montant du versement à illustrer. */
export interface ReductionInputs extends ImpotInputs {
  /** Versement PER déductible à illustrer (€/an). */
  versementPer: number;
}

export const DEFAULT_REDUCTION_INPUTS: ReductionInputs = {
  statut: "Célibataire",
  nbEnfants: 0,
  garde: "classique",
  demiPartHandicap: false,
  revenuImposable: 0,
  versementPer: 0,
};

/** Un segment de revenu situé dans une tranche (pour le rendu d'une colonne). */
export interface BracketSlice {
  taux: number;
  label: string;
  color: string;
  /** Montant de revenu (foyer) tombant dans cette tranche (€). */
  montant: number;
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Découpe le revenu imposable du FOYER en segments par tranche. Le barème
 * s'applique au revenu PAR PART ; on multiplie donc les seuils par le nombre de
 * parts pour raisonner en euros foyer. Ne renvoie que les tranches effectivement
 * occupées (montant > 0).
 */
export function decoupeParTranche(revenu: number, partsTotal: number): BracketSlice[] {
  const R = Math.max(0, num(revenu));
  const parts = Math.max(1, num(partsTotal, 1));
  const slices: BracketSlice[] = [];
  for (const t of TRANCHES_AFFICHAGE) {
    const lo = t.min * parts;
    const hi = t.max === Infinity ? Infinity : t.max * parts;
    const montant = Math.max(0, Math.min(R, hi) - lo);
    if (montant > 0) {
      slices.push({ taux: t.taux, label: t.label, color: t.color, montant });
    }
  }
  return slices;
}

export interface ReductionResult {
  /** Revenu imposable avant versement (= saisi). */
  revenuAvant: number;
  /** Revenu imposable après versement déductible (borné ≥ 0). */
  revenuApres: number;
  /** Montant réellement déduit (= min(versement, revenu)). */
  montantEfface: number;
  /** Impôt + TMI + parts AVANT versement (vrai moteur). */
  avant: ReturnType<typeof computeImpot>;
  /** Impôt + TMI + parts APRÈS versement (vrai moteur). */
  apres: ReturnType<typeof computeImpot>;
  /** Économie d'impôt = impôt avant − impôt après (€). */
  economie: number;
  /** `true` si la TMI change entre avant et après. */
  tmiChange: boolean;
  /** Segments par tranche de la colonne « sans versement ». */
  slicesAvant: BracketSlice[];
  /** Segments par tranche de la colonne « avec versement ». */
  slicesApres: BracketSlice[];
  /**
   * Portions de revenu retirées par tranche (avant − après), tranches hautes en
   * premier. Sert au bloc « fantôme » (ce qui sort des tranches hautes).
   */
  tranchesEffacees: Array<{ taux: number; label: string; montant: number }>;
}

/**
 * Calcul complet de l'illustration, déterministe, en consommation seule du moteur.
 * Les montants d'impôt et la TMI viennent de `computeImpot` (= impotReel). Le
 * découpage par tranche est purement visuel.
 */
export function computeReduction(input: ReductionInputs): ReductionResult {
  const revenuAvant = Math.max(0, num(input.revenuImposable));
  const versement = Math.max(0, num(input.versementPer));
  const montantEfface = Math.min(versement, revenuAvant);
  const revenuApres = revenuAvant - montantEfface;

  const avant = computeImpot(input);
  const apres = computeImpot({ ...input, revenuImposable: revenuApres });

  // Parts retenues par le moteur (identiques avant/après : le versement ne change
  // que le revenu) → base du découpage en euros foyer.
  const { partsTotal } = resolveParts(input);

  const slicesAvant = decoupeParTranche(revenuAvant, partsTotal);
  const slicesApres = decoupeParTranche(revenuApres, partsTotal);

  // Portions retirées par tranche = différence avant − après, tranches hautes
  // d'abord (sens « le sommet du revenu sort en premier »).
  const tranchesEffacees: ReductionResult["tranchesEffacees"] = [];
  for (let i = TRANCHES_AFFICHAGE.length - 1; i >= 0; i--) {
    const t = TRANCHES_AFFICHAGE[i];
    const mAvant = slicesAvant.find((s) => s.taux === t.taux)?.montant ?? 0;
    const mApres = slicesApres.find((s) => s.taux === t.taux)?.montant ?? 0;
    const retiree = Math.max(0, mAvant - mApres);
    if (retiree > 0.5) {
      tranchesEffacees.push({ taux: t.taux, label: t.label, montant: retiree });
    }
  }

  return {
    revenuAvant,
    revenuApres,
    montantEfface,
    avant,
    apres,
    economie: Math.max(0, avant.impotNet - apres.impotNet),
    tmiChange: avant.tmi !== apres.tmi,
    slicesAvant,
    slicesApres,
    tranchesEffacees,
  };
}
