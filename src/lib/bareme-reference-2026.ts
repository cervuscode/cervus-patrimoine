/**
 * Tableau de RÉFÉRENCE fiscal 2026 (Lot G) — données en dur du document interne
 * `Cervus_Tableau_Fiscal_2026_v4.pdf`, validé contre DGFiP/BOFiP (même référence
 * que `fiscal-engine.ts`).
 *
 * ⚠️ La GRILLE est en dur (consultation / vérification croisée rapide en RDV).
 * SEULE EXCEPTION (décision validée) : la carte « revenu libre » de
 * `lookupImpotReference` calcule sa TMI en DIRECT via `calculerTMI` (fiscal-engine),
 * pour être exacte à l'euro près y compris dans la zone de transition du
 * plafonnement du quotient familial (où le rattachement à la colonne la plus proche
 * donnerait une TMI fausse). L'impôt net de la carte reste interpolé sur la grille.
 * Les calculs personnalisés passent toujours par les simulateurs. Isomorphe.
 *
 * Mise à jour annuelle = remplacer ce SEUL fichier quand le barème change. La colonne
 * TMI de la grille a été régénérée depuis le moteur (TMI effective, plafonnement QF
 * inclus) : elle peut donc différer de la tranche « avis d'imposition » R/parts.
 */

import { calculerTMI } from "./fiscal-engine";

// Revenus testés dans le document (en €), dans l'ordre des colonnes.
export const REVENUS_REF = [
  15000, 20000, 25000, 30000, 35000, 40000, 50000, 60000, 70000, 80000, 100000, 120000, 150000,
  200000, 300000,
];

// Une case = [impôt net €, TMI %] ; `null` = « — » (non applicable dans le document).
export type RefCell = [impotNet: number, tmi: number] | null;

export interface SituationRef {
  id: string;
  label: string;
  parts: number; // = partsTotal
  /** Parts du foyer SANS enfants : 1 = personne seule, 2 = couple. Pour la TMI live. */
  partsBase: number;
  /** Parent isolé (case T) : plafond QF spécifique. Pour la TMI live. */
  caseT?: boolean;
  cells: RefCell[]; // aligné sur REVENUS_REF
}

// ── TABLEAU 1 — Impôt net & TMI par situation × revenu ────────────────────────
// NB : la colonne TMI ci-dessous = TMI EFFECTIVE (régénérée depuis le moteur,
// plafonnement QF inclus). Les montants d'impôt net sont inchangés.
export const TABLE_IMPOT_NET: SituationRef[] = [
  {
    id: "celib-0", label: "Célibataire 0 enfant", parts: 1, partsBase: 1,
    cells: [null, [445, 11], [1244, 11], [2104, 30], [3604, 30], [5104, 30], [8104, 30], [11104, 30], [14104, 30], [17104, 30], [24801, 41], [33001, 41], [45301, 41], [66524, 45], [111524, 45]],
  },
  {
    id: "celib-1", label: "Célibataire 1 enfant", parts: 1.5, partsBase: 1,
    cells: [null, null, [317, 11], [1116, 11], [1915, 11], [3297, 30], [6297, 30], [9297, 30], [12297, 30], [15297, 30], [22994, 41], [31194, 41], [43494, 41], [64717, 45], [109717, 45]],
  },
  {
    id: "celib-2", label: "Célibataire 2 enfants", parts: 2, partsBase: 1,
    cells: [null, null, null, [189, 11], [988, 11], [1787, 11], [4490, 30], [7490, 30], [10490, 30], [13490, 30], [21187, 41], [29387, 41], [41687, 41], [62910, 45], [107910, 45]],
  },
  {
    id: "celib-3", label: "Célibataire 3 enfants", parts: 3, partsBase: 1,
    cells: [null, null, null, null, null, null, [1532, 11], [3876, 30], [6876, 30], [9876, 30], [17573, 41], [25773, 41], [38073, 41], [59296, 45], [104296, 45]],
  },
  {
    id: "celib-4", label: "Célibataire 4 enfants", parts: 4, partsBase: 1,
    cells: [null, null, null, null, null, null, null, [1276, 11], [3262, 30], [6262, 30], [13959, 41], [22159, 41], [34459, 41], [55682, 45], [100682, 45]],
  },
  {
    id: "isole-1", label: "Parent isolé 1 enfant", parts: 2, partsBase: 1, caseT: true,
    cells: [null, null, null, [189, 11], [988, 11], [1787, 11], [3842, 30], [6842, 30], [9842, 30], [12842, 30], [20539, 41], [28739, 41], [41039, 41], [62262, 45], [107262, 45]],
  },
  {
    id: "isole-2", label: "Parent isolé 2 enfants", parts: 2.5, partsBase: 1, caseT: true,
    cells: [null, null, null, null, [62, 11], [861, 11], [2310, 11], [5035, 30], [8035, 30], [11035, 30], [18732, 41], [26932, 41], [39232, 41], [60455, 45], [105455, 45]],
  },
  {
    id: "isole-3", label: "Parent isolé 3 enfants", parts: 3.5, partsBase: 1, caseT: true,
    cells: [null, null, null, null, null, null, [605, 11], [2134, 11], [4421, 30], [7421, 30], [15118, 41], [23318, 41], [35618, 41], [56841, 45], [101841, 45]],
  },
  {
    id: "couple-0", label: "Couple 0 enfant", parts: 2, partsBase: 2,
    cells: [null, null, null, null, [402, 11], [1201, 11], [2799, 11], [4208, 30], [7208, 30], [10208, 30], [16208, 30], [22208, 30], [31208, 30], [49601, 41], [90601, 41]],
  },
  {
    id: "couple-1", label: "Couple 1 enfant", parts: 2.5, partsBase: 2,
    cells: [null, null, null, null, null, [275, 11], [1872, 11], [3410, 11], [5401, 30], [8401, 30], [14401, 30], [20401, 30], [29401, 30], [47794, 41], [88794, 41]],
  },
  {
    id: "couple-2", label: "Couple 2 enfants", parts: 3, partsBase: 2,
    cells: [null, null, null, null, null, null, [946, 11], [2543, 11], [3872, 11], [6594, 30], [12594, 30], [18594, 30], [27594, 30], [45987, 41], [86987, 41]],
  },
  {
    id: "couple-3", label: "Couple 3 enfants", parts: 4, partsBase: 2,
    cells: [null, null, null, null, null, null, null, [690, 11], [2288, 11], [3696, 11], [8980, 30], [14980, 30], [23980, 30], [42373, 41], [83373, 41]],
  },
  {
    id: "couple-4", label: "Couple 4 enfants", parts: 5, partsBase: 2,
    cells: [null, null, null, null, null, null, null, null, [434, 11], [2032, 11], [5366, 30], [11366, 30], [20366, 30], [38759, 41], [79759, 41]],
  },
];

// ── TABLEAU 2 — Économie fiscale PER (versement × TMI) ────────────────────────
export const TMI_REF = [11, 30, 41, 45] as const;
export const VERSEMENTS_REF = [1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000, 25000, 30000, 40000, 50000];

// economie[i] aligné sur VERSEMENTS_REF ; chaque ligne alignée sur TMI_REF.
export const TABLE_ECONOMIE_PER: number[][] = [
  [110, 300, 410, 450],
  [220, 600, 820, 900],
  [330, 900, 1230, 1350],
  [550, 1500, 2050, 2250],
  [770, 2100, 2870, 3150],
  [1100, 3000, 4100, 4500],
  [1650, 4500, 6150, 6750],
  [2200, 6000, 8200, 9000],
  [2750, 7500, 10250, 11250],
  [3300, 9000, 12300, 13500],
  [4400, 12000, 16400, 18000],
  [5500, 15000, 20500, 22500],
];

// ── PARAMÈTRES DU BARÈME 2026 ─────────────────────────────────────────────────
export const BAREME_2026_PARAMS = {
  tranches: [
    { taux: 0, plafond: 11600 },
    { taux: 11, plafond: 29579 },
    { taux: 30, plafond: 84577 },
    { taux: 41, plafond: 181917 },
    { taux: 45, plafond: null },
  ],
  plafondDemiPart: 1807,
  plafondCaseT: 4262,
  quartDePart: 903.5,
  decoteCelibataire: { seuil: 1983, formule: "IR − max(0 ; 897 − 0,4525 × IR)" },
  decoteCouple: { seuil: 3278, formule: "IR − max(0 ; 1 483 − 0,4525 × IR)" },
  source: "Cervus_Tableau_Fiscal_2026_v4.pdf — validé DGFiP/BOFiP",
};

// ── Lookup express (consultation) ─────────────────────────────────────────────
export interface ImpotLookup {
  impotNet: number;
  tmi: number;
  /** true = valeur interpolée entre deux tranches ; false = correspond à une colonne. */
  interpole: boolean;
  /** Index de la colonne de référence la plus proche (pour le surlignage). */
  colonneProche: number;
}

/**
 * Pour un revenu libre : interpole linéairement l'impôt NET entre les deux colonnes
 * non-nulles encadrantes (confort de lecture, « ≈ référence »), MAIS calcule la TMI
 * en DIRECT via le moteur (`calculerTMI` avec partsBase/caseT de la situation) → TMI
 * effective exacte, plafonnement QF inclus, même dans la zone de transition.
 */
export function lookupImpotReference(situation: SituationRef, revenu: number): ImpotLookup | null {
  const pts = situation.cells
    .map((c, i) => (c ? { revenu: REVENUS_REF[i], impotNet: c[0], i } : null))
    .filter((p): p is { revenu: number; impotNet: number; i: number } => p != null);
  if (pts.length === 0) return null;

  // TMI effective calculée par le moteur (exacte, plafonnement inclus).
  const ctx = situation.caseT ? { caseT: true } : {};
  const tmi = revenu > 0 ? calculerTMI(Math.round(revenu), situation.partsBase, situation.parts, ctx) : 0;

  // Colonne de référence la plus proche (surlignage uniquement).
  const proche = pts.reduce((best, p) =>
    Math.abs(p.revenu - revenu) < Math.abs(best.revenu - revenu) ? p : best
  );

  // Clamp hors bornes.
  if (revenu <= pts[0].revenu) {
    return { impotNet: pts[0].impotNet, tmi, interpole: false, colonneProche: pts[0].i };
  }
  const last = pts[pts.length - 1];
  if (revenu >= last.revenu) {
    return { impotNet: last.impotNet, tmi, interpole: false, colonneProche: last.i };
  }

  // Interpolation linéaire de l'impôt net entre les deux points encadrants.
  for (let k = 0; k < pts.length - 1; k++) {
    const lo = pts[k];
    const hi = pts[k + 1];
    if (revenu >= lo.revenu && revenu <= hi.revenu) {
      const t = (revenu - lo.revenu) / (hi.revenu - lo.revenu);
      const impotNet = Math.round(lo.impotNet + t * (hi.impotNet - lo.impotNet));
      const exact = revenu === lo.revenu || revenu === hi.revenu;
      return { impotNet, tmi, interpole: !exact, colonneProche: proche.i };
    }
  }
  return { impotNet: proche.impotNet, tmi, interpole: false, colonneProche: proche.i };
}
