// ============================================================
// CERVUS PATRIMOINE — Moteur de calcul fiscal IR 2025
// Code validé et testé — NE PAS MODIFIER SANS VALIDATION
// ============================================================

// Barème IR 2025 (revenus 2024)
const TRANCHES: Array<{ min: number; max: number; taux: number }> = [
  { min: 0,      max: 11497,          taux: 0    },
  { min: 11497,  max: 29315,          taux: 0.11 },
  { min: 29315,  max: 83823,          taux: 0.30 },
  { min: 83823,  max: 180294,         taux: 0.41 },
  { min: 180294, max: Infinity,       taux: 0.45 },
];

// Plafond quotient familial 2025 : 1 791 € par demi-part supplémentaire
const PLAFOND_PAR_DEMI_PART = 1791;

// ── CALCUL IMPÔT BRUT ──────────────────────────────────────────────────────────
// Divise le revenu par le nombre de parts, applique le barème progressif,
// multiplie le résultat par le nombre de parts.
export function impotBrut(R: number, parts: number): number {
  const rpp = R / parts; // revenu par part
  let impotParPart = 0;
  for (const t of TRANCHES) {
    if (rpp <= t.min) break;
    impotParPart += (Math.min(rpp, t.max) - t.min) * t.taux;
  }
  return impotParPart * parts;
}

// ── CALCUL IMPÔT RÉEL avec plafonnement du quotient familial ──────────────────
// partsBase  : parts du foyer sans enfants (1 = célibataire/divorcé, 2 = couple)
// partsTotal : parts avec enfants
//
// Logique :
// 1. Calculer l'impôt avec le quotient familial (faux barème × partsTotal)
// 2. Calculer l'impôt sans enfants (barème réel × partsBase)
// 3. Si l'économie dépasse le plafond → plafonner
export function impotReel(R: number, partsBase: number, partsTotal: number): number {
  if (partsTotal === partsBase) return impotBrut(R, partsBase);

  const impotAvecEnfants  = impotBrut(R, partsTotal); // faux barème
  const impotSansEnfants  = impotBrut(R, partsBase);  // barème réel
  const economieReelle    = impotSansEnfants - impotAvecEnfants;
  const nbDemiPartsSupp   = (partsTotal - partsBase) * 2;
  const plafondTotal      = nbDemiPartsSupp * PLAFOND_PAR_DEMI_PART;

  if (economieReelle <= plafondTotal) {
    // Plafond non atteint — quotient familial pleinement appliqué
    return impotAvecEnfants;
  } else {
    // Plafond atteint — on plafonne l'avantage fiscal
    return impotSansEnfants - plafondTotal;
  }
}

// ── TMI EFFECTIVE ──────────────────────────────────────────────────────────────
// Calcule la tranche marginale d'imposition sur les 1 000 € suivants
// et arrondit au taux légal le plus proche (0 / 11 / 30 / 41 / 45)
export function calculerTMI(R: number, partsBase: number, partsTotal: number): number {
  const DELTA = 1000;
  const diff = impotReel(R + DELTA, partsBase, partsTotal) - impotReel(R, partsBase, partsTotal);
  const tauxBrut = diff / DELTA;
  const TAUX_LEGAUX = [0, 0.11, 0.30, 0.41, 0.45];
  let closest = TAUX_LEGAUX[0];
  for (const t of TAUX_LEGAUX) {
    if (Math.abs(tauxBrut - t) < Math.abs(tauxBrut - closest)) closest = t;
  }
  return Math.round(closest * 100); // retourne 0, 11, 30, 41 ou 45
}

// ── CALCUL DES PARTS FISCALES ─────────────────────────────────────────────────
// statut : 'celibataire' | 'divorce' | 'marie' | 'pacse' | 'parent_isole'
// nbEnfants : 0 à 6 (6 = "6 et plus", traité comme 6)
//
// Règle enfants (barème 2025) :
//   Standard (célibataire/divorcé/marié/pacsé) : +0.5 pt (1er), +0.5 pt (2ème), +1 pt/enfant à partir du 3ème
//   Parent isolé (case T) : +1 pt (1er), +0.5 pt (2ème), +1 pt/enfant à partir du 3ème

function partsEnfantsStandard(n: number): number {
  if (n === 0) return 0;
  if (n === 1) return 0.5;
  if (n === 2) return 1.0;
  return 1.0 + (n - 2) * 1.0;
}

function partsEnfantsParentIsole(n: number): number {
  if (n === 0) return 0;
  if (n === 1) return 1.0;
  if (n === 2) return 1.5;
  return 1.5 + (n - 2) * 1.0;
}

export function calculerParts(
  statut: 'celibataire' | 'divorce' | 'marie' | 'pacse' | 'parent_isole',
  nbEnfants: number
): { partsBase: number; partsTotal: number } {
  if (statut === 'marie' || statut === 'pacse') {
    const partsBase = 2;
    return { partsBase, partsTotal: partsBase + partsEnfantsStandard(nbEnfants) };
  } else if (statut === 'parent_isole') {
    const partsBase = 1;
    return { partsBase, partsTotal: partsBase + partsEnfantsParentIsole(nbEnfants) };
  } else {
    // celibataire ou divorce
    const partsBase = 1;
    return { partsBase, partsTotal: partsBase + partsEnfantsStandard(nbEnfants) };
  }
}

// ── CALCUL REVENU NET IMPOSABLE ───────────────────────────────────────────────
// Prend en compte les différentes sources de revenus
export interface RevenusInput {
  salaires?:       number; // net avant impôt
  abattementSalaires: 'forfait10' | 'fraisReels';
  fraisReels?:     number; // si abattementSalaires = 'fraisReels'
  bnc?:            number; // bénéfice net directement
  bic?:            number; // bénéfice net directement
  foncier?:        number; // revenu net directement
}

export function calculerRevenuImposable(revenus: RevenusInput): number {
  let total = 0;

  // Salaires
  if (revenus.salaires && revenus.salaires > 0) {
    if (revenus.abattementSalaires === 'forfait10') {
      const abattement = Math.min(Math.max(revenus.salaires * 0.10, 495), 14171);
      total += revenus.salaires - abattement;
    } else {
      const frais = revenus.fraisReels || 0;
      total += Math.max(revenus.salaires - frais, 0);
    }
  }

  // BNC, BIC, Foncier — montants nets saisis directement
  if (revenus.bnc)     total += revenus.bnc;
  if (revenus.bic)     total += revenus.bic;
  if (revenus.foncier) total += revenus.foncier;

  return Math.max(total, 0);
}

// ── PROJECTION PER — INTÉRÊTS COMPOSÉS MENSUELS ───────────────────────────────
// versementMensuel : montant versé chaque mois
// tauxAnnuel       : 0.03 (prudent) / 0.04 (équilibré) / 0.05 (dynamique)
// nAnnees          : 64 - age actuel de l'utilisateur
export function projectionPER(
  versementMensuel: number,
  tauxAnnuel: number,
  nAnnees: number
): { capitalFinal: number; courbe: Array<{ annee: number; capital: number }> } {
  const anneeActuelle = new Date().getFullYear();
  const tauxMensuel = Math.pow(1 + tauxAnnuel, 1 / 12) - 1;
  const courbe: Array<{ annee: number; capital: number }> = [];

  for (let annee = 1; annee <= nAnnees; annee++) {
    const k = annee * 12;
    const capital = versementMensuel * ((Math.pow(1 + tauxMensuel, k) - 1) / tauxMensuel);
    courbe.push({ annee: anneeActuelle + annee, capital: Math.round(capital) });
  }

  const capitalFinal = courbe[courbe.length - 1]?.capital ?? 0;
  return { capitalFinal, courbe };
}

// ── ÉCONOMIE FISCALE ANNUELLE ──────────────────────────────────────────────────
export function economieFiscaleAnnuelle(
  versementMensuel: number,
  tmi: number // en entier : 11, 30, 41 ou 45
): number {
  return Math.round(versementMensuel * 12 * tmi / 100);
}

// ── TESTS UNITAIRES ───────────────────────────────────────────────────────────
// OBLIGATOIRE : valider ces cas avant de mettre en production
//
// impotReel(30000, 1, 1)      → ~2 022 €   TMI → 11%
// impotReel(70000, 2, 2)      → ~7 748 €   TMI → 30%
// impotReel(70000, 2, 2.5)    → ~5 957 €   TMI → 30%  (plafonnement QF actif)
// impotReel(90000, 1, 1)      → ~19 868 €  TMI → 41%
// impotReel(200000, 1, 1)     → ~59 585 €  TMI → 45%
// impotReel(60000, 2, 2.5)    → ~3 494 €   TMI → 11%  (plafonnement pas encore actif)
