// ─────────────────────────────────────────────────────────────────────────────
// Moteur d'intérêts composés — calcul pur, 100 % côté client (aucune dépendance
// serveur/réseau). Utilisé par le simulateur public /simulateur-interets-composes.
//
// CONVENTIONS DE CALCUL (documentées pour audit) :
//  • Versements en FIN de période (annuité de fin de période / ordinary annuity).
//  • Fréquence « mensuel » → capitalisation MENSUELLE au taux équivalent
//      rMois = (1 + r)^(1/12) − 1   (et NON r/12),
//    de sorte que 12 mois composés reproduisent exactement le taux annuel r.
//  • Fréquence « annuel » → capitalisation ANNUELLE au taux r.
//  • Fiscalité : prélevée UNIQUEMENT sur les gains (intérêts), de façon forfaitaire
//    au taux choisi, comme un prélèvement à la sortie. impôt = max(0, intérêts) × taux.
//    Les taux proposés sont génériques (aucune enveloppe précise — PEA/AV/PER — n'est
//    nommée ni supposée) : « Aucune », « PFU 30 % », « Prélèvements sociaux 17,2 % ».
//  • Inflation (optionnelle) : on déflate le capital net par (1 + infl)^n pour
//    exprimer le pouvoir d'achat en euros constants d'aujourd'hui.
// ─────────────────────────────────────────────────────────────────────────────

export type Frequence = "mensuel" | "annuel";
export type Fiscalite = "aucune" | "pfu" | "ps";

// Taux forfaitaires appliqués sur les GAINS uniquement.
export const TAUX_FISCALITE: Record<Fiscalite, number> = {
  aucune: 0,
  pfu: 0.3, // flat tax (prélèvement forfaitaire unique)
  ps: 0.172, // prélèvements sociaux seuls
};

export interface InteretsComposesParams {
  capitalInitial: number; // €
  versementPeriodique: number; // € par période (selon `frequence`)
  frequence: Frequence;
  tauxAnnuel: number; // en %, ex. 5 = 5 %/an (borné 0–10 côté UI)
  dureeAnnees: number; // années (borné 1–40 côté UI)
  inflationActive: boolean;
  inflationTaux: number; // en %, ex. 2 = 2 %/an
  fiscalite: Fiscalite;
}

export interface PointCourbe {
  annee: number; // 0 = aujourd'hui
  capitalBrut: number; // valeur totale du placement
  totalVerse: number; // versements cumulés (capital initial inclus)
  interets: number; // capitalBrut − totalVerse
}

export interface InteretsComposesResult {
  capitalFinalBrut: number; // valeur au terme, avant fiscalité
  totalVerse: number; // total des sommes versées (initial + périodiques)
  interets: number; // gains générés = brut − total versé
  impotSurGains: number; // fiscalité forfaitaire sur les gains (0 si « Aucune »)
  capitalNet: number; // brut − impôt sur les gains
  capitalReel: number; // pouvoir d'achat du net en € constants (= capitalNet si inflation off)
  facteurInflation: number; // (1 + infl)^n (1 si inflation off)
  courbe: PointCourbe[]; // trajectoire annuelle (année 0 → n) pour le graphique
}

const round = (x: number): number => Math.round(x);

export function calculerInteretsComposes(
  p: InteretsComposesParams
): InteretsComposesResult {
  const r = Math.max(0, p.tauxAnnuel) / 100;
  const n = Math.max(0, Math.floor(p.dureeAnnees));
  const v = Math.max(0, p.versementPeriodique);
  const cap0 = Math.max(0, p.capitalInitial);

  const courbe: PointCourbe[] = [
    { annee: 0, capitalBrut: round(cap0), totalVerse: round(cap0), interets: 0 },
  ];

  let capital = cap0;
  let totalVerse = cap0;

  if (p.frequence === "mensuel") {
    const rMois = Math.pow(1 + r, 1 / 12) - 1;
    for (let y = 1; y <= n; y++) {
      for (let m = 0; m < 12; m++) {
        capital = capital * (1 + rMois) + v; // intérêts puis versement (fin de mois)
        totalVerse += v;
      }
      courbe.push({
        annee: y,
        capitalBrut: round(capital),
        totalVerse: round(totalVerse),
        interets: round(capital - totalVerse),
      });
    }
  } else {
    for (let y = 1; y <= n; y++) {
      capital = capital * (1 + r) + v; // intérêts puis versement (fin d'année)
      totalVerse += v;
      courbe.push({
        annee: y,
        capitalBrut: round(capital),
        totalVerse: round(totalVerse),
        interets: round(capital - totalVerse),
      });
    }
  }

  const capitalFinalBrut = capital;
  const interets = Math.max(0, capitalFinalBrut - totalVerse);
  const taux = TAUX_FISCALITE[p.fiscalite] ?? 0;
  const impotSurGains = interets * taux;
  const capitalNet = capitalFinalBrut - impotSurGains;

  const facteurInflation = p.inflationActive
    ? Math.pow(1 + Math.max(0, p.inflationTaux) / 100, n)
    : 1;
  const capitalReel = capitalNet / facteurInflation;

  return {
    capitalFinalBrut: round(capitalFinalBrut),
    totalVerse: round(totalVerse),
    interets: round(interets),
    impotSurGains: round(impotSurGains),
    capitalNet: round(capitalNet),
    capitalReel: round(capitalReel),
    facteurInflation,
    courbe,
  };
}
