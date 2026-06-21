/**
 * Tableau de RÉFÉRENCE fiscal 2026 (Lot G) — données en dur du document interne
 * `Cervus_Tableau_Fiscal_2026_v4.pdf`, validé contre DGFiP/BOFiP (même référence
 * que `fiscal-engine.ts`).
 *
 * ⚠️ Ce fichier ne CALCULE rien dynamiquement : c'est un outil de consultation /
 * vérification croisée rapide en RDV. Les calculs personnalisés passent toujours
 * exclusivement par `fiscal-engine.ts`. Isomorphe (aucun secret).
 *
 * Mise à jour annuelle = remplacer ce SEUL fichier quand le barème change.
 */

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
  parts: number;
  cells: RefCell[]; // aligné sur REVENUS_REF
}

// ── TABLEAU 1 — Impôt net & TMI par situation × revenu ────────────────────────
export const TABLE_IMPOT_NET: SituationRef[] = [
  {
    id: "celib-0", label: "Célibataire 0 enfant", parts: 1,
    cells: [null, [445, 11], [1244, 11], [2104, 30], [3604, 30], [5104, 30], [8104, 30], [11104, 30], [14104, 30], [17104, 30], [24801, 41], [33001, 41], [45301, 41], [66524, 45], [111524, 45]],
  },
  {
    id: "celib-1", label: "Célibataire 1 enfant", parts: 1.5,
    cells: [null, null, [317, 11], [1116, 11], [1915, 11], [3297, 11], [6297, 30], [9297, 30], [12297, 30], [15297, 30], [22994, 30], [31194, 30], [43494, 41], [64717, 41], [109717, 45]],
  },
  {
    id: "celib-2", label: "Célibataire 2 enfants", parts: 2,
    cells: [null, null, null, [189, 11], [988, 11], [1787, 11], [4490, 11], [7490, 30], [10490, 30], [13490, 30], [21187, 30], [29387, 30], [41687, 30], [62910, 41], [107910, 41]],
  },
  {
    id: "celib-3", label: "Célibataire 3 enfants", parts: 3,
    cells: [null, null, null, null, null, null, [1532, 11], [3876, 11], [6876, 11], [9876, 11], [17573, 30], [25773, 30], [38073, 30], [59296, 30], [104296, 41]],
  },
  {
    id: "celib-4", label: "Célibataire 4 enfants", parts: 4,
    cells: [null, null, null, null, null, null, null, [1276, 11], [3262, 11], [6262, 11], [13959, 11], [22159, 30], [34459, 30], [55682, 30], [100682, 30]],
  },
  {
    id: "isole-1", label: "Parent isolé 1 enfant", parts: 2,
    cells: [null, null, null, [189, 11], [988, 11], [1787, 11], [3842, 11], [6842, 30], [9842, 30], [12842, 30], [20539, 30], [28739, 30], [41039, 30], [62262, 41], [107262, 41]],
  },
  {
    id: "isole-2", label: "Parent isolé 2 enfants", parts: 2.5,
    cells: [null, null, null, null, [62, 11], [861, 11], [2310, 11], [5035, 11], [8035, 11], [11035, 30], [18732, 30], [26932, 30], [39232, 30], [60455, 30], [105455, 41]],
  },
  {
    id: "isole-3", label: "Parent isolé 3 enfants", parts: 3.5,
    cells: [null, null, null, null, null, null, [605, 11], [2134, 11], [4421, 11], [7421, 11], [15118, 11], [23318, 30], [35618, 30], [56841, 30], [101841, 41]],
  },
  {
    id: "couple-0", label: "Couple 0 enfant", parts: 2,
    cells: [null, null, null, null, [402, 11], [1201, 11], [2799, 11], [4208, 30], [7208, 30], [10208, 30], [16208, 30], [22208, 30], [31208, 30], [49601, 41], [90601, 41]],
  },
  {
    id: "couple-1", label: "Couple 1 enfant", parts: 2.5,
    cells: [null, null, null, null, null, [275, 11], [1872, 11], [3410, 11], [5401, 11], [8401, 30], [14401, 30], [20401, 30], [29401, 30], [47794, 30], [88794, 41]],
  },
  {
    id: "couple-2", label: "Couple 2 enfants", parts: 3,
    cells: [null, null, null, null, null, null, [946, 11], [2543, 11], [3872, 11], [6594, 11], [12594, 30], [18594, 30], [27594, 30], [45987, 30], [86987, 41]],
  },
  {
    id: "couple-3", label: "Couple 3 enfants", parts: 4,
    cells: [null, null, null, null, null, null, null, [690, 11], [2288, 11], [3696, 11], [8980, 11], [14980, 30], [23980, 30], [42373, 30], [83373, 30]],
  },
  {
    id: "couple-4", label: "Couple 4 enfants", parts: 5,
    cells: [null, null, null, null, null, null, null, null, [434, 11], [2032, 11], [5366, 11], [11366, 11], [20366, 30], [38759, 30], [79759, 30]],
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
 * Pour un revenu libre : interpole linéairement l'impôt net entre les deux colonnes
 * non-nulles encadrantes, rattache la TMI à la colonne la plus proche. PAS un calcul
 * officiel — confort de lecture, à étiqueter « ≈ référence ».
 */
export function lookupImpotReference(situation: SituationRef, revenu: number): ImpotLookup | null {
  const pts = situation.cells
    .map((c, i) => (c ? { revenu: REVENUS_REF[i], impotNet: c[0], tmi: c[1], i } : null))
    .filter((p): p is { revenu: number; impotNet: number; tmi: number; i: number } => p != null);
  if (pts.length === 0) return null;

  // Colonne de référence la plus proche (pour TMI + surlignage).
  const proche = pts.reduce((best, p) =>
    Math.abs(p.revenu - revenu) < Math.abs(best.revenu - revenu) ? p : best
  );

  // Clamp hors bornes.
  if (revenu <= pts[0].revenu) {
    return { impotNet: pts[0].impotNet, tmi: pts[0].tmi, interpole: false, colonneProche: pts[0].i };
  }
  const last = pts[pts.length - 1];
  if (revenu >= last.revenu) {
    return { impotNet: last.impotNet, tmi: last.tmi, interpole: false, colonneProche: last.i };
  }

  // Interpolation linéaire de l'impôt net entre les deux points encadrants.
  for (let k = 0; k < pts.length - 1; k++) {
    const lo = pts[k];
    const hi = pts[k + 1];
    if (revenu >= lo.revenu && revenu <= hi.revenu) {
      const t = (revenu - lo.revenu) / (hi.revenu - lo.revenu);
      const impotNet = Math.round(lo.impotNet + t * (hi.impotNet - lo.impotNet));
      const exact = revenu === lo.revenu || revenu === hi.revenu;
      return { impotNet, tmi: proche.tmi, interpole: !exact, colonneProche: proche.i };
    }
  }
  return { impotNet: proche.impotNet, tmi: proche.tmi, interpole: false, colonneProche: proche.i };
}
