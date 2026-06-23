/**
 * Moteur PUR de la « Pyramide de l'épargne » (Lot 9).
 *
 * Range les encours financiers du client en 4 niveaux (de la base sécurisée au
 * sommet dynamique) et les confronte à une répartition cible théorique, pour
 * matérialiser visuellement la sur-représentation fréquente du niveau Précaution
 * (livrets) et l'opportunité de dynamiser.
 *
 * Ne consomme AUCUN autre moteur (ni fiscal-engine, ni per-*) : il ne fait que
 * sommer/répartir des montants saisis. Isomorphe (aucun secret) → importable côté
 * client (sim + présentation + bloc fiche) ET serveur (prefill des routes connectées).
 *
 * Cible théorique (validée — répartition de bon sens patrimonial) :
 *  - Niveau 1 Précaution  : 6 × capacité d'épargne mensuelle (épargne de sécurité).
 *  - Surplus = max(0, patrimoine total − cible de précaution), réparti :
 *      Niveau 2 Projet     : 40 % du surplus,
 *      Niveau 3 Long terme : 40 % du surplus,
 *      Niveau 4 Dynamique  : 20 % du surplus.
 *  Si la capacité d'épargne n'est pas renseignée → aucune cible (statut « neutre »,
 *  la pyramide réelle reste affichée sans comparaison).
 */

/** Seuils de tolérance de l'écart réel / cible (±20 %, validés). */
export const SEUIL_BAS = 0.8;
export const SEUIL_HAUT = 1.2;

/** Nombre de mois de capacité d'épargne visés en épargne de précaution. */
export const MOIS_PRECAUTION = 6;

/** Répartition cible du surplus (au-delà de la précaution). */
export const REPARTITION_SURPLUS = {
  projet: 0.4,
  longTerme: 0.4,
  dynamique: 0.2,
} as const;

export type NiveauKey = "precaution" | "projet" | "longTerme" | "dynamique";
export type EcartStatut = "ok" | "sur" | "sous" | "neutre";

/** Encours financiers du client (€) + capacité d'épargne mensuelle (€). */
export interface PyramideInputs {
  livretsReglementes: number;
  livretsBoostes: number;
  autreEpargne: number;
  /** Part FONDS EUROS de l'AV (capital garanti). */
  encoursFondsEuros: number;
  /** Encours AV TOTAL (fonds euros + UC). L'UC se déduit : encoursAv − encoursFondsEuros. */
  encoursAv: number;
  encoursPea: number;
  encoursPer: number;
  cto: number;
  crypto: number;
  /** Capacité d'épargne mensuelle nette — base de la cible de précaution. */
  capaciteEpargneMensuelle: number;
}

export const DEFAULT_PYRAMIDE_INPUTS: PyramideInputs = {
  livretsReglementes: 0,
  livretsBoostes: 0,
  autreEpargne: 0,
  encoursFondsEuros: 0,
  encoursAv: 0,
  encoursPea: 0,
  encoursPer: 0,
  cto: 0,
  crypto: 0,
  capaciteEpargneMensuelle: 0,
};

export interface NiveauResult {
  key: NiveauKey;
  /** Libellé court (PRÉCAUTION / PROJET / LONG TERME / DYNAMIQUE). */
  label: string;
  /** Sous-titre descriptif (liquidité / horizon / risque). */
  sousTitre: string;
  /** Couleur de la couche (charte, crème → bronze foncé). */
  color: string;
  /** `true` si le texte doit être sombre (couche claire). */
  texteSombre: boolean;
  /** Montant réel détenu sur ce niveau (€). */
  montantReel: number;
  /** Part du patrimoine total (0..1). */
  pctTotal: number;
  /** Cible théorique en € (null si non calculable — capacité absente). */
  cibleMontant: number | null;
  /** Libellé de la cible théorique (« 6 mois », « 40 % », « 20 % »). */
  cibleLabel: string;
  /** Ratio réel / cible (null si pas de cible). */
  ratio: number | null;
  /** Statut de l'écart (vert/orange/rouge/gris). */
  statut: EcartStatut;
}

export interface PyramideResult {
  patrimoineTotal: number;
  /** Cible d'épargne de précaution (null si capacité non renseignée). */
  ciblePrecaution: number | null;
  /** Surplus réparti sur projet/long terme/dynamique (0 si pas de cible). */
  surplus: number;
  /** Niveaux dans l'ordre BASE → SOMMET (precaution, projet, longTerme, dynamique). */
  niveaux: NiveauResult[];
}

function pos(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Statut de l'écart à partir du ratio réel/cible (null → neutre). */
export function statutEcart(ratio: number | null): EcartStatut {
  if (ratio === null) return "neutre";
  if (ratio > SEUIL_HAUT) return "sur";
  if (ratio < SEUIL_BAS) return "sous";
  return "ok";
}

/**
 * Ratio réel/cible robuste :
 *  - cible null → null (pas de comparaison) ;
 *  - cible 0    → réel>0 ⇒ Infinity (sur-représenté), réel 0 ⇒ 1 (conforme à 0) ;
 *  - sinon réel/cible.
 */
function ratioOf(reel: number, cible: number | null): number | null {
  if (cible === null) return null;
  if (cible <= 0) return reel > 0 ? Infinity : 1;
  return reel / cible;
}

export function computePyramide(input: PyramideInputs): PyramideResult {
  const livrets = pos(input.livretsReglementes) + pos(input.livretsBoostes);
  const autre = pos(input.autreEpargne);
  const fondsEuros = pos(input.encoursFondsEuros);
  const avTotal = pos(input.encoursAv);
  const avUC = Math.max(0, avTotal - fondsEuros); // UC = AV total − fonds euros (clampé ≥ 0)
  const pea = pos(input.encoursPea);
  const per = pos(input.encoursPer);
  const cto = pos(input.cto);
  const crypto = pos(input.crypto);
  const capacite = pos(input.capaciteEpargneMensuelle);

  // Montants réels par niveau.
  const reelPrecaution = livrets + autre;
  const reelProjet = fondsEuros;
  const reelLongTerme = avUC + pea + per;
  const reelDynamique = cto + crypto;

  // Patrimoine total : le fonds euros s'annule entre niveau 2 et niveau 3, donc
  // total = AV total + PEA + PER + livrets + autre + CTO + crypto.
  const patrimoineTotal = livrets + autre + avTotal + pea + per + cto + crypto;

  // Cibles théoriques. Sans capacité → pas de cible (comparaison neutre).
  const ciblePrecaution = capacite > 0 ? MOIS_PRECAUTION * capacite : null;
  const surplus = ciblePrecaution !== null ? Math.max(0, patrimoineTotal - ciblePrecaution) : 0;
  const cibleProjet = ciblePrecaution !== null ? surplus * REPARTITION_SURPLUS.projet : null;
  const cibleLongTerme = ciblePrecaution !== null ? surplus * REPARTITION_SURPLUS.longTerme : null;
  const cibleDynamique = ciblePrecaution !== null ? surplus * REPARTITION_SURPLUS.dynamique : null;

  const pct = (m: number): number => (patrimoineTotal > 0 ? m / patrimoineTotal : 0);

  const niveaux: NiveauResult[] = [
    {
      key: "precaution",
      label: "PRÉCAUTION",
      sousTitre: "Liquide, capital garanti",
      color: "#F2EDE8",
      texteSombre: true,
      montantReel: reelPrecaution,
      pctTotal: pct(reelPrecaution),
      cibleMontant: ciblePrecaution,
      cibleLabel: `${MOIS_PRECAUTION} mois de capacité`,
      ratio: ratioOf(reelPrecaution, ciblePrecaution),
      statut: statutEcart(ratioOf(reelPrecaution, ciblePrecaution)),
    },
    {
      key: "projet",
      label: "PROJET",
      sousTitre: "Moyen terme, capital garanti",
      color: "#a07d62",
      texteSombre: false,
      montantReel: reelProjet,
      pctTotal: pct(reelProjet),
      cibleMontant: cibleProjet,
      cibleLabel: `${Math.round(REPARTITION_SURPLUS.projet * 100)} %`,
      ratio: ratioOf(reelProjet, cibleProjet),
      statut: statutEcart(ratioOf(reelProjet, cibleProjet)),
    },
    {
      key: "longTerme",
      label: "LONG TERME",
      sousTitre: "8 ans+, fiscalité optimisée",
      color: "#795D48",
      texteSombre: false,
      montantReel: reelLongTerme,
      pctTotal: pct(reelLongTerme),
      cibleMontant: cibleLongTerme,
      cibleLabel: `${Math.round(REPARTITION_SURPLUS.longTerme * 100)} %`,
      ratio: ratioOf(reelLongTerme, cibleLongTerme),
      statut: statutEcart(ratioOf(reelLongTerme, cibleLongTerme)),
    },
    {
      key: "dynamique",
      label: "DYNAMIQUE",
      sousTitre: "Risque élevé, long terme",
      color: "#5D4738",
      texteSombre: false,
      montantReel: reelDynamique,
      pctTotal: pct(reelDynamique),
      cibleMontant: cibleDynamique,
      cibleLabel: `${Math.round(REPARTITION_SURPLUS.dynamique * 100)} %`,
      ratio: ratioOf(reelDynamique, cibleDynamique),
      statut: statutEcart(ratioOf(reelDynamique, cibleDynamique)),
    },
  ];

  return { patrimoineTotal, ciblePrecaution, surplus, niveaux };
}

/** Couleur d'affichage d'un statut d'écart (charte). */
export const STATUT_COLORS: Record<EcartStatut, string> = {
  ok: "#4f7d4f", // vert sobre
  sur: "#c4862c", // orange
  sous: "#b4533a", // rouge brique
  neutre: "#8a7a6c", // gris bronze
};

/** Libellé court d'un statut d'écart. */
export const STATUT_LABELS: Record<EcartStatut, string> = {
  ok: "Conforme",
  sur: "Sur-représenté",
  sous: "Sous-représenté",
  neutre: "—",
};
