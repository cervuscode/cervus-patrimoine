/**
 * Registre des simulateurs « version conseiller » (Lot 2, point B).
 *
 * Source unique pour la grille d'accès rapide de l'accueil et pour les liens vers
 * les fiches client. Structuré pour accueillir d'autres simulateurs (AV, PEA/CTO,
 * SCPI… cf. MD §9 Lots 4-10) sans refonte : on ajoute une entrée ici.
 *
 * Isomorphe (aucun secret) → importable client et serveur.
 */

export interface ConseillerSim {
  /** Identifiant stable (clé d'URL / de registre). */
  id: string;
  /** Libellé affiché sur la carte. */
  label: string;
  /** Phrase d'accroche courte (usage en RDV). */
  description: string;
  /** Route du mode AUTONOME (depuis l'accueil, sans client). */
  autonomousHref: string;
  /** Construit la route du mode CONNECTÉ (depuis une fiche client). */
  clientHref: (personId: number) => string;
  /** `true` = disponible ; `false` = à venir (carte grisée, non cliquable). */
  available: boolean;
  /**
   * Champs d'IDENTITÉ/SITUATION : viennent de la fiche, LECTURE SEULE en
   * présentation, rapatriables via « Actualiser » (Lot F).
   */
  identityKeys: string[];
  /**
   * Champs d'HYPOTHÈSE : paramètres de scénario, ÉDITABLES en direct dans
   * l'espace présentation, JAMAIS écrasés par « Actualiser » (Lot F).
   */
  hypothesisKeys: string[];
}

export const CONSEILLER_SIMS: ConseillerSim[] = [
  {
    id: "per",
    label: "Simulateur PER rapide",
    description: "Économie d'impôt et capital projeté en quelques chiffres.",
    autonomousHref: "/simulateur-per",
    clientHref: (personId) => `/client/${personId}/simulateur-per`,
    available: true,
    identityKeys: ["revenuImposable", "parts"],
    hypothesisKeys: ["versementMensuel", "versementInitial", "horizon", "profil", "taux"],
  },
  {
    id: "per-complet",
    label: "Simulateur PER complet",
    description: "3 sorties : capital, fractionnement 20 ans, rente viagère.",
    autonomousHref: "/simulateur-per-complet",
    clientHref: (personId) => `/client/${personId}/simulateur-per-complet`,
    available: true,
    identityKeys: ["revenuImposable", "parts", "anneeNaissance"],
    hypothesisKeys: [
      "versementMensuel",
      "versementInitial",
      "horizon",
      "profil",
      "taux",
      "trancheSortie",
      "ageConversion",
    ],
  },
];

export function getConseillerSim(id: string): ConseillerSim | undefined {
  return CONSEILLER_SIMS.find((s) => s.id === id);
}
