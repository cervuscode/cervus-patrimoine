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
  section: "situation" | "professionnel" | "revenus" | "profil" | "epargne" | "notes";
  /** Nom exact du champ "Simulation" (lecture seule). Absent si pas de miroir. */
  simName?: string;
  /** Nom exact du champ "Découverte RDV" (éditable). */
  decName: string;
}

/**
 * Les 21 champs éditables de la vue client (hors identité/code, gérés à part).
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

  // ── Profil investisseur ────────────────────────────────────────────────────
  { id: "profil", label: "Profil investisseur", entity: "deal", kind: "text", section: "profil", simName: "Profil investisseur", decName: "Profil investisseur (Découverte RDV)" },

  // ── Épargne existante ──────────────────────────────────────────────────────
  { id: "versementInitial", label: "Versement PER initial", entity: "deal", kind: "money", section: "epargne", simName: "Versement initial", decName: "Versement initial (Découverte RDV)" },
  { id: "versementMensuel", label: "Versement PER mensuel", entity: "deal", kind: "money", section: "epargne", simName: "Versement mensuel", decName: "Versement mensuel (Découverte RDV)" },
  { id: "avExistante", label: "AV existante", entity: "person", kind: "money", section: "epargne", decName: "AV existante (Découverte RDV)" },
  { id: "autreEpargne", label: "Autre épargne", entity: "person", kind: "money", section: "epargne", decName: "Autre épargne (Découverte RDV)" },
  { id: "immobilier", label: "Immobilier", entity: "person", kind: "money", section: "epargne", decName: "Immobilier (Découverte RDV)" },
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
  notes: "Notes",
};

/** Sections dans l'ordre d'affichage. */
export const SECTION_ORDER: RdvFieldDef["section"][] = [
  "situation",
  "professionnel",
  "revenus",
  "profil",
  "epargne",
];

export function fieldsBySection(section: RdvFieldDef["section"]): RdvFieldDef[] {
  return RDV_FIELDS.filter((f) => f.section === section);
}
