/**
 * Registre unique des champs de la vue client (Outil RDV — Lot 1).
 *
 * Source de vérité partagée par : lecture Pipedrive (`getClientView`), écriture
 * (`saveDecouverteRDV`), et rendu UI. Aucun nom de champ n'est dupliqué ailleurs.
 *
 * Règle Simulation / Découverte RDV (MD §4.1) :
 *  - `simName`  = champ "Simulation" existant (écrit par le site public), LECTURE SEULE.
 *  - `decName`  = champ "Découverte RDV" (créé au Lot 1), éditable en RDV.
 *  - Affichage : Découverte si renseigné en base, sinon pré-remplissage visuel par
 *    Simulation (JAMAIS d'écriture auto — voir RdvClientProvider).
 *
 * ⚠️ Isomorphe : ce module ne contient AUCUN secret (que des libellés) → importable
 * côté client ET serveur. Le token Pipedrive vit uniquement dans `pipedrive.ts`.
 */

export type FieldEntity = "person" | "deal";
export type FieldKind = "text" | "number" | "money";

export interface RdvFieldDef {
  /** Identifiant stable côté code (clé de l'état local, jamais affiché). */
  id: string;
  /** Libellé affiché dans la vue client / le panneau. */
  label: string;
  /** Person ou Deal — détermine l'objet Pipedrive lu/écrit. */
  entity: FieldEntity;
  kind: FieldKind;
  /** Section logique pour le regroupement visuel. */
  section: "situation" | "professionnel" | "revenus" | "profil" | "epargne" | "patrimoine" | "notes";
  /** Nom exact du champ "Simulation" (lecture seule). Absent si pas de miroir. */
  simName?: string;
  /** Nom exact du champ "Découverte RDV" (éditable). */
  decName: string;
  /**
   * `true` = champ NON rendu comme `DiscoveryField` dans sa section (lecture/écriture/
   * hydratation/save héritées de la machinerie RDV_FIELDS, mais rendu par un bloc dédié).
   * Ex. `estTNS` (Lot 8) : affiché par le switch du bloc « Plafond de versement PER ».
   */
  hiddenInDiscovery?: boolean;
}

/**
 * Les 30 champs éditables de la vue client (hors identité/code, gérés à part).
 * L'ordre définit l'ordre d'affichage par section.
 */
export const RDV_FIELDS: RdvFieldDef[] = [
  // ── Situation ──────────────────────────────────────────────────────────────
  { id: "statutMarital", label: "Statut marital", entity: "person", kind: "text", section: "situation", simName: "Statut marital", decName: "Statut marital (Découverte RDV)" },
  { id: "partsFiscales", label: "Parts fiscales", entity: "person", kind: "number", section: "situation", decName: "Parts fiscales (Découverte RDV)" },
  { id: "nbEnfants", label: "Nombre d'enfants", entity: "person", kind: "number", section: "situation", simName: "Nombre d'enfants", decName: "Nombre d'enfants (Découverte RDV)" },
  { id: "garde", label: "Garde", entity: "person", kind: "text", section: "situation", decName: "Garde (Découverte RDV)" },
  { id: "anneeNaissance", label: "Année de naissance", entity: "person", kind: "number", section: "situation", simName: "Année de naissance", decName: "Année de naissance (Découverte RDV)" },

  // ── Professionnel ──────────────────────────────────────────────────────────
  { id: "profession", label: "Profession", entity: "person", kind: "text", section: "professionnel", decName: "Profession (Découverte RDV)" },
  { id: "statutPro", label: "Statut professionnel", entity: "person", kind: "text", section: "professionnel", simName: "Statut professionnel", decName: "Statut professionnel (Découverte RDV)" },

  // ── Revenus ────────────────────────────────────────────────────────────────
  { id: "revenuImposable", label: "Revenu imposable", entity: "person", kind: "number", section: "revenus", simName: "Revenu imposable", decName: "Revenu imposable (Découverte RDV)" },
  { id: "salaireMensuel", label: "Salaire mensuel", entity: "person", kind: "number", section: "revenus", simName: "Salaire mensuel", decName: "Salaire mensuel (Découverte RDV)" },
  { id: "revenuConjoint", label: "Revenu conjoint", entity: "person", kind: "number", section: "revenus", simName: "Revenu conjoint", decName: "Revenu conjoint (Découverte RDV)" },
  { id: "foncier", label: "Foncier", entity: "deal", kind: "money", section: "revenus", simName: "Foncier", decName: "Foncier (Découverte RDV)" },
  { id: "bnc", label: "BNC", entity: "deal", kind: "money", section: "revenus", simName: "BNC", decName: "BNC (Découverte RDV)" },
  { id: "bic", label: "BIC", entity: "deal", kind: "money", section: "revenus", simName: "BIC", decName: "BIC (Découverte RDV)" },
  { id: "tmi", label: "TMI", entity: "person", kind: "number", section: "revenus", simName: "TMI", decName: "TMI (Découverte RDV)" },
  { id: "ageRetraite", label: "Âge retraite", entity: "person", kind: "number", section: "revenus", simName: "Âge retraite", decName: "Âge retraite (Découverte RDV)" },
  // RFR réel (avis d'imposition) — override optionnel du RFR approximatif pour CEHR/CDHR (Chantier C).
  { id: "rfrReel", label: "RFR réel (avis d'imposition)", entity: "person", kind: "money", section: "revenus", decName: "RFR réel (avis d'imposition) (Découverte RDV)" },

  // ── Profil investisseur ────────────────────────────────────────────────────
  { id: "profil", label: "Profil investisseur", entity: "deal", kind: "text", section: "profil", simName: "Profil investisseur", decName: "Profil investisseur (Découverte RDV)" },

  // ── Épargne existante ──────────────────────────────────────────────────────
  { id: "versementInitial", label: "Versement PER initial", entity: "deal", kind: "money", section: "epargne", simName: "Versement initial", decName: "Versement initial (Découverte RDV)" },
  { id: "versementMensuel", label: "Versement PER mensuel", entity: "deal", kind: "money", section: "epargne", simName: "Versement mensuel", decName: "Versement mensuel (Découverte RDV)" },
  { id: "immobilier", label: "Immobilier", entity: "person", kind: "money", section: "epargne", decName: "Immobilier (Découverte RDV)" },
  // Statut TNS (Lot 8) — déclencheur du plafond Madelin. Stocké en texte "Oui"/vide
  // (Pipedrive n'a pas de booléen natif). Rendu par le bloc « Plafond de versement PER »
  // (hiddenInDiscovery), pas comme DiscoveryField. Champ Pipedrive créé à la main.
  { id: "estTNS", label: "Est TNS", entity: "person", kind: "text", section: "epargne", decName: "Est TNS (Découverte RDV)", hiddenInDiscovery: true },

  // ── Patrimoine financier (Chantier D + Lot 9) — enveloppes par stock (encours global).
  // Entité Person (global par client). Découverte-only (aucun miroir Simulation).
  // Consommables par le Lot 9 (Pyramide de l'épargne) via useRdvClient().
  { id: "encoursAv", label: "Encours AV total", entity: "person", kind: "money", section: "patrimoine", decName: "Encours AV total (Découverte RDV)" },
  // Lot 9 : part FONDS EUROS de l'AV (capital garanti). L'AV en UC se déduit :
  // encoursAv − encoursFondsEuros. Champ Pipedrive créé à la main (Person, monetary).
  { id: "encoursFondsEuros", label: "Encours AV fonds euros", entity: "person", kind: "money", section: "patrimoine", decName: "Encours AV fonds euros (Découverte RDV)" },
  { id: "encoursPea", label: "Encours PEA", entity: "person", kind: "money", section: "patrimoine", decName: "Encours PEA (Découverte RDV)" },
  // Lot 9 : encours PER détenu (stock), distinct du versement de scénario
  // (versementInitial/Mensuel = Deal). Champ Pipedrive créé à la main (Person, monetary).
  { id: "encoursPer", label: "Encours PER", entity: "person", kind: "money", section: "patrimoine", decName: "Encours PER (Découverte RDV)" },
  { id: "livretsReglementes", label: "Livrets réglementés", entity: "person", kind: "money", section: "patrimoine", decName: "Livrets réglementés (Découverte RDV)" },
  { id: "livretsBoostes", label: "Livrets boostés / fiscalisés", entity: "person", kind: "money", section: "patrimoine", decName: "Livrets boostés / fiscalisés (Découverte RDV)" },
  { id: "cto", label: "Compte-titres ordinaire", entity: "person", kind: "money", section: "patrimoine", decName: "Compte-titres ordinaire (Découverte RDV)" },
  { id: "crypto", label: "Crypto-actifs", entity: "person", kind: "money", section: "patrimoine", decName: "Crypto-actifs (Découverte RDV)" },
  // Résiduel relabellisé (ancien « Autre épargne ») — decName Pipedrive inchangé (zéro migration).
  { id: "autreEpargne", label: "Autre épargne financière", entity: "person", kind: "money", section: "patrimoine", decName: "Autre épargne (Découverte RDV)" },
  // Lot 9 : capacité d'épargne mensuelle nette — sert à la cible de précaution
  // (6 × capacité). Flux (pas un stock) mais affiché en section patrimoine. Créé à la main.
  { id: "capaciteEpargneMensuelle", label: "Capacité d'épargne mensuelle", entity: "person", kind: "money", section: "patrimoine", decName: "Capacité d'épargne mensuelle (Découverte RDV)" },
];

/** Champ Notes libres (Person) — traité à part (masqué par défaut, MD §4.2). */
export const NOTES_FIELD = {
  id: "notes",
  label: "Notes libres",
  entity: "person" as const,
  decName: "Notes libres (Découverte RDV)",
};

/** Champ Code client (Deal). Système — pas dans RDV_FIELDS. */
export const CODE_CLIENT_FIELD_NAME = "Code client";

export const SECTION_LABELS: Record<RdvFieldDef["section"], string> = {
  situation: "Situation",
  professionnel: "Professionnel",
  revenus: "Revenus",
  profil: "Profil investisseur",
  epargne: "Épargne existante",
  patrimoine: "Patrimoine financier",
  notes: "Notes",
};

/** Sections dans l'ordre d'affichage. */
export const SECTION_ORDER: RdvFieldDef["section"][] = [
  "situation",
  "professionnel",
  "revenus",
  "profil",
  "epargne",
  "patrimoine",
];

export function fieldsBySection(section: RdvFieldDef["section"]): RdvFieldDef[] {
  return RDV_FIELDS.filter((f) => f.section === section);
}
