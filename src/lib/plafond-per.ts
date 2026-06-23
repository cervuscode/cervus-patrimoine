/**
 * Plafonds de déductibilité PER — TNS / Madelin (art. 154 bis CGI) + cumul (Lot 8).
 *
 * Module PUR isomorphe (aucun secret, aucun import serveur) → importable côté client
 * (fiche + bloc plafond) ET serveur. RÉUTILISE les constantes PASS 2026 et la fonction
 * `computePlafondPER` de `per-quick.ts` — AUCUNE duplication des constantes.
 *
 * Consommation LECTURE SEULE de la logique fiscale ; aucune écriture Pipedrive.
 * OUTIL CONSEILLER UNIQUEMENT (jamais le site public). Alerte non bloquante.
 *
 * Règles fiscales validées (PASS 2026 = 48 060 €) :
 *  • Plafond salarié (art. 163 quatervingts) — déjà dans `computePlafondPER` :
 *      max( min(10 % × (revenu net imposable − foncier), 10 % × 8 PASS), 10 % × PASS )
 *  • Plafond TNS / Madelin (art. 154 bis), assiette « bénéfice » = BNC + BIC :
 *      10 % × min(bénéfice, 8 PASS) + 15 % × max(0, min(bénéfice, 8 PASS) − PASS)
 *      plancher = 10 % × PASS = 4 806 €
 *      plafond max = 10 % × 8 PASS + 15 % × 7 PASS = 38 448 + 50 463 = 88 911 €
 *  • Cumul : tout TNS additionne les DEUX plafonds (salarié sur la part revenu net
 *    imposable − foncier, TNS sur BNC + BIC). Pas l'un OU l'autre.
 */

import {
  computePlafondPER,
  PASS_2026,
  PER_PLAFOND_TAUX,
  PER_PLANCHER,
} from "./per-quick";

/** Assiette « bénéfice » TNS bornée à 8 PASS (art. 154 bis : limite haute commune aux deux termes). */
export const HUIT_PASS = 8 * PASS_2026; // 384 480 €
/** Taux de la tranche supplémentaire Madelin (entre 1 et 8 PASS). */
export const TX_MADELIN_SUP = 0.15;
/** Plafond TNS maximum théorique = 10 % × 8 PASS + 15 % × 7 PASS = 88 911 €. */
export const PER_TNS_PLAFOND_MAX =
  HUIT_PASS * PER_PLAFOND_TAUX + 7 * PASS_2026 * TX_MADELIN_SUP;

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export interface PlafondTNSResult {
  /** Plafond Madelin annuel (€). */
  plafond: number;
  detail: {
    /** Bénéfice brut retenu = BNC + BIC (≥ 0). */
    benefice: number;
    /** Bénéfice borné à 8 PASS (assiette des deux termes). */
    beneficePlafonne: number;
    /** Part à 10 % (sur bénéfice plafonné). */
    part10: number;
    /** Part à 15 % (fraction comprise entre 1 et 8 PASS). */
    part15: number;
    /** `true` = plancher 10 % PASS appliqué (bénéfice faible/nul). */
    plancherApplique: boolean;
    /** `true` = plafond maximum 88 911 € atteint (bénéfice ≥ 8 PASS). */
    plafondMaxApplique: boolean;
  };
}

/**
 * Plafond Madelin (TNS) pur. `bnc` + `bic` = bénéfice imposable. Le bénéfice est borné
 * à 8 PASS pour les DEUX termes (10 % et 15 %), conformément à l'art. 154 bis — sans ce
 * cap, un bénéfice > 8 PASS surévaluerait le plafond. Plancher = 10 % PASS.
 */
export function computePlafondTNS(bnc: number, bic: number): PlafondTNSResult {
  const benefice = Math.max(0, num(bnc) + num(bic));
  const beneficePlafonne = Math.min(benefice, HUIT_PASS);
  const part10 = beneficePlafonne * PER_PLAFOND_TAUX;
  const part15 = Math.max(0, beneficePlafonne - PASS_2026) * TX_MADELIN_SUP;
  const brut = part10 + part15;
  const plafond = Math.max(PER_PLANCHER, brut);
  return {
    plafond,
    detail: {
      benefice,
      beneficePlafonne,
      part10,
      part15,
      plancherApplique: brut <= PER_PLANCHER,
      plafondMaxApplique: benefice >= HUIT_PASS,
    },
  };
}

export interface PlafondTotalInput {
  /** Revenu net imposable du foyer (€/an). */
  revenuImposable: number;
  /** Revenu foncier (€/an), exclu de l'assiette salariée (conforme DGFiP). Défaut 0. */
  foncier?: number;
  /** Bénéfice BNC (€/an), assiette TNS. Défaut 0. */
  bnc?: number;
  /** Bénéfice BIC (€/an), assiette TNS. Défaut 0. */
  bic?: number;
  /** Le client est-il TNS ? Unique déclencheur du calcul Madelin (switch fiche). */
  estTNS: boolean;
}

export interface PlafondTotalResult {
  estTNS: boolean;
  /** Plafond salarié (toujours calculé, plancher 10 % PASS inclus). */
  plafondSalarie: number;
  /** Plafond Madelin (0 si non-TNS). */
  plafondTNS: number;
  /** Cumul salarié + TNS. */
  plafondTotal: number;
}

/**
 * Plafond total cumulé. Le plafond salarié est TOUJOURS calculé (avec son plancher
 * 10 % PASS, cf. formule art. 163 quatervingts) ; le plafond TNS s'y AJOUTE seulement si
 * `estTNS`. Un TNS sans salaire obtient donc le plancher salarié 4 806 € + son Madelin.
 */
export function computePlafondTotal(input: PlafondTotalInput): PlafondTotalResult {
  const proNet = Math.max(0, num(input.revenuImposable) - num(input.foncier));
  const plafondSalarie = computePlafondPER(proNet, 0).plafond;
  const estTNS = !!input.estTNS;
  const plafondTNS = estTNS ? computePlafondTNS(num(input.bnc), num(input.bic)).plafond : 0;
  return { estTNS, plafondSalarie, plafondTNS, plafondTotal: plafondSalarie + plafondTNS };
}
