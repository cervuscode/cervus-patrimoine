/**
 * État fiscal partagé (Lot 2) — calcul UNIQUE de revenu net imposable, parts et TMI.
 *
 * Module PUR isomorphe (aucun secret) : LA règle « calculé une seule fois », appelée
 * des deux côtés — par `RdvClientProvider` (contexte client, mémoïsé) ET par les
 * routes simulateur connectées côté serveur (prefill). Plus aucun `calculerTMI`
 * dispersé dans les simulateurs : ils consomment ce résultat.
 *
 * Consomme `fiscal-engine.ts` en LECTURE SEULE. Ne le modifie jamais.
 */

import { calculerParts, calculerRevenuImposable, calculerTMI } from "./fiscal-engine";

export type StatutParts =
  | "celibataire"
  | "divorce"
  | "marie"
  | "pacse"
  | "parent_isole"
  | "garde_partagee";

/**
 * Valeurs du menu déroulant « Statut marital » (Lot 2). Le `label` est écrit
 * TEL QUEL dans le champ texte libre Pipedrive « Statut marital (Découverte RDV) »
 * → la lecture devient une correspondance DIRECTE et fiable (plus de mapping flou).
 * `statut` = correspondance vers l'enum `calculerParts` (Veuf(ve) = 1 part = célib).
 */
export const STATUT_MARITAL_OPTIONS: { label: string; statut: StatutParts }[] = [
  { label: "Célibataire", statut: "celibataire" },
  { label: "Marié(e)", statut: "marie" },
  { label: "Pacsé(e)", statut: "pacse" },
  { label: "Divorcé(e)", statut: "divorce" },
  { label: "Veuf(ve)", statut: "celibataire" },
];

/**
 * Lecture statut → enum. Correspondance DIRECTE sur les libellés garantis par le
 * menu ; repli tolérant uniquement pour d'anciennes valeurs texte libre (saisies
 * avant ce changement, ou via l'import manuel Volet B). Défaut : célibataire.
 */
export function mapStatutToParts(raw?: string): StatutParts {
  if (!raw) return "celibataire";
  const exact = STATUT_MARITAL_OPTIONS.find((o) => o.label === raw);
  if (exact) return exact.statut;
  const s = raw.toLowerCase();
  if (s.includes("mari")) return "marie";
  if (s.includes("pacs")) return "pacse";
  if (s.includes("divorc")) return "divorce";
  if (s.includes("isol")) return "parent_isole";
  if (s.includes("alt") || s.includes("partag")) return "garde_partagee";
  return "celibataire"; // inclut « Veuf(ve) » et valeurs inconnues
}

/** Champs sources déjà résolus (priorité Découverte RDV > Simulation faite en amont). */
export interface FiscalSource {
  // Champs explicites prioritaires.
  revenuImposable?: number;
  partsFiscales?: number;
  // Repli revenu.
  salaireMensuel?: number;
  revenuConjoint?: number;
  foncier?: number;
  bnc?: number;
  bic?: number;
  // Repli parts.
  statutMarital?: string;
  nbEnfants?: number;
}

export interface FiscalState {
  revenuNetImposable: number;
  partsBase: number;
  partsTotal: number;
  tmi: number; // 0 | 11 | 30 | 41 | 45
}

export const EMPTY_FISCAL_STATE: FiscalState = {
  revenuNetImposable: 0,
  partsBase: 1,
  partsTotal: 1,
  tmi: 0,
};

function pos(v: number | undefined): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

/**
 * Calcul unique. Priorité au champ explicite (revenuImposable, partsFiscales) s'il
 * est renseigné ; sinon repli via fiscal-engine (calculerRevenuImposable / calculerParts).
 */
export function computeFiscalState(src: FiscalSource): FiscalState {
  // ── Revenu net imposable ──
  const revenuNetImposable = pos(src.revenuImposable)
    ? src.revenuImposable
    : calculerRevenuImposable({
        salaires: (src.salaireMensuel ?? 0) * 12,
        abattementSalaires: "forfait10",
        salaireConjoint: src.revenuConjoint,
        foncier: src.foncier,
        bnc: src.bnc,
        bic: src.bic,
      });

  // ── Parts ──
  let partsBase: number;
  let partsTotal: number;
  if (pos(src.partsFiscales)) {
    // Valeur explicite du conseiller : convention partsBase = partsTotal.
    partsBase = src.partsFiscales;
    partsTotal = src.partsFiscales;
  } else {
    const p = calculerParts(
      mapStatutToParts(src.statutMarital),
      Math.max(0, Math.round(src.nbEnfants ?? 0))
    );
    partsBase = p.partsBase;
    partsTotal = p.partsTotal;
  }

  const tmi = revenuNetImposable > 0 ? calculerTMI(revenuNetImposable, partsBase, partsTotal) : 0;

  return { revenuNetImposable, partsBase, partsTotal, tmi };
}
