/**
 * Simulateur Assurance-vie « version conseiller » — STANDALONE.
 *
 * Module ISOLÉ et isomorphe (aucun secret, aucun import serveur) : consomme en
 * LECTURE SEULE le moteur `av-engine.ts` (`calculerAV`). Ne modifie JAMAIS le moteur.
 *
 * Distinct du Comparateur AV / PER (Lot 7, qui ne lit que `capitalNetSansCervus` et
 * jette le reste) : ICI on expose toute la richesse du moteur — capital brut,
 * capital net, capital net OPTIMISÉ, gain de l'optimisation, trajectoire de la
 * valeur du contrat année par année.
 *
 * ⚠️ VOCABULAIRE CONFIDENTIEL : les mots « purge » / « rachat » / « avec/sans Cervus »
 * ne sortent JAMAIS de ce module vers l'UI. Les champs du moteur sont renommés ici en
 * libellés neutres : `capitalNetAvecCervus` → `capitalNetOptimise` (« Capital net
 * optimisé » côté composants), `purgeUtile` → `optimisationUtile`, `gainNetCervus` →
 * `gainOptimisation`. La courbe exposée est UNIQUE (valeur du contrat), jamais
 * l'opposition de deux trajectoires.
 */

import { calculerAV, type AVProfil } from "./av-engine";

export interface AvSimInputs {
  versementInitial: number;
  versementMensuel: number;
  dureeAnnees: number; // horizon, borné 2–40
  profil: AVProfil; // prudent | equilibre | responsable | dynamique
  marie: boolean; // abattement 9 200 € (couple) vs 4 600 € (seul)
}

export const DEFAULT_AV_INPUTS: AvSimInputs = {
  versementInitial: 0,
  versementMensuel: 0,
  dureeAnnees: 15,
  profil: "equilibre",
  marie: false,
};

/**
 * Profils AV (4 valeurs NATIVES du moteur, dont « responsable » = 4 %, absent des
 * autres simulateurs conseiller qui ne connaissent que les 3 profils PER).
 */
export const AV_PROFIL_OPTIONS: { value: AVProfil; label: string; taux: number }[] = [
  { value: "prudent", label: "Prudent", taux: 3 },
  { value: "equilibre", label: "Équilibré", taux: 4 },
  { value: "responsable", label: "Responsable", taux: 4 },
  { value: "dynamique", label: "Dynamique", taux: 5 },
];

export const AV_PROFIL_LABELS: Record<AVProfil, string> = {
  prudent: "Prudent",
  equilibre: "Équilibré",
  responsable: "Responsable",
  dynamique: "Dynamique",
};

export const AV_DUREE_MIN = 2;
export const AV_DUREE_MAX = 40;

export function isAvProfil(v: unknown): v is AVProfil {
  return v === "prudent" || v === "equilibre" || v === "responsable" || v === "dynamique";
}

/** Sécurise une valeur arbitraire en `AVProfil` (défaut équilibré). */
export function asAvProfil(v: unknown): AVProfil {
  return isAvProfil(v) ? v : "equilibre";
}

/** Normalise un libellé français libre (champ Pipedrive) vers un `AVProfil`. */
export function normalizeAvProfil(label: unknown): AVProfil {
  const s = String(label ?? "").toLowerCase();
  if (s.includes("prudent")) return "prudent";
  if (s.includes("dynam")) return "dynamique";
  if (s.includes("responsable")) return "responsable";
  return "equilibre";
}

export interface AvSimResult {
  capitalFinalBrut: number; // valeur du contrat au terme, avant fiscalité de sortie
  capitalNet: number; // après PS + impôt (= capitalNetSansCervus du moteur)
  capitalNetOptimise: number; // libellé pudique (= capitalNetAvecCervus du moteur)
  gainOptimisation: number; // = gainNetCervus ; n'a de sens que si optimisationUtile
  optimisationUtile: boolean; // = purgeUtile (jamais le mot exposé)
  totalVerse: number;
  /** Trajectoire de la valeur du contrat (brut) année par année — courbe UNIQUE. */
  courbe: { annee: number; valeur: number }[];
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function clampDuree(d: number): number {
  return Math.min(AV_DUREE_MAX, Math.max(AV_DUREE_MIN, Math.round(d)));
}

export function computeAvSim(input: AvSimInputs): AvSimResult {
  const versementInitial = Math.max(0, num(input.versementInitial));
  const versementMensuel = Math.max(0, num(input.versementMensuel));
  const dureeAnnees = clampDuree(num(input.dureeAnnees, DEFAULT_AV_INPUTS.dureeAnnees));
  const profil = asAvProfil(input.profil);
  const marie = !!input.marie;

  const av = calculerAV({ versementInitial, versementMensuel, dureeAnnees, profil, marie });

  return {
    capitalFinalBrut: av.capitalFinalBrut,
    capitalNet: av.capitalNetSansCervus,
    capitalNetOptimise: av.capitalNetAvecCervus,
    gainOptimisation: av.gainNetCervus,
    optimisationUtile: av.purgeUtile,
    totalVerse: Math.round(versementInitial + versementMensuel * 12 * dureeAnnees),
    // Courbe neutre = valeur du contrat (trajectoire « sans rachat » du moteur), jamais
    // l'opposition avec/sans optimisation.
    courbe: av.courbe.map((pt) => ({ annee: pt.annee, valeur: pt.capitalSans })),
  };
}
