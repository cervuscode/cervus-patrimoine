/**
 * Comparateur Assurance-vie vs PER « version conseiller » (Lot 7).
 *
 * Module ISOLÉ et isomorphe (aucun secret, aucun import serveur) : consomme en
 * LECTURE SEULE les deux moteurs — `per-sortie.ts` (`computePerSortie`) et
 * `av-engine.ts` (`calculerAV`, version à jour gérant la fiscalité < 8 ans) — plus
 * `calculerTMI` (fiscal-engine) et `TAUX_PAR_PROFIL` (per-quick). Ne modifie JAMAIS
 * aucun moteur.
 *
 * Convention « EFFORT NET ÉGAL » (Option B) :
 *  - Le conseiller saisit un seul effort mensuel (+ apport initial) = ce que le client
 *    sort réellement de sa poche.
 *  - AV reçoit l'effort net tel quel.
 *  - PER reçoit l'effort MAJORÉ : effort / (1 − TMI/100). La différence = l'économie
 *    d'impôt, déjà intégrée DÈS LE VERSEMENT (pas de cumul ajouté en fin).
 *  - On compare directement `sortie1.capitalNet` (PER) à `capitalNetSansCervus` (AV).
 *
 * AV de référence = `capitalNetSansCervus` UNIQUEMENT (jamais la stratégie de purge,
 * jamais le mot « purge » exposé).
 */

import { calculerTMI } from "./fiscal-engine";
import { TAUX_PAR_PROFIL, type PerProfil } from "./per-quick";
import { computePerSortie } from "./per-sortie";
import { calculerAV, type AVProfil } from "./av-engine";

/** Seuil de quasi-parité (en % relatif) : en deçà, verdict « équivalent » (souplesse AV). */
export const SEUIL_QUASI_PARITE_PCT = 1;

export type Gagnant = "per" | "av" | "egal";

export interface ComparateurInputs {
  // ── Identité (vient de la fiche, rafraîchissable en présentation) ──
  revenuImposable: number;
  parts: number;
  marie: boolean; // abattement AV 9 200 € (couple) vs 4 600 € (seul)
  // ── Hypothèses (éditables) ──
  effortNetMensuel: number; // €/mois sortis de la poche du client
  effortNetInitial: number; // apport initial net (0 possible)
  horizon: number; // années
  profil: PerProfil; // rendement identique AV & PER (3/4/5 %)
  trancheSortie: number; // tranche PER à la sortie (0|11|30|41|45), défaut = TMI
}

export const DEFAULT_COMPARATEUR_INPUTS: ComparateurInputs = {
  revenuImposable: 0,
  parts: 1,
  marie: false,
  effortNetMensuel: 0,
  effortNetInitial: 0,
  horizon: 20,
  profil: "equilibre",
  trancheSortie: 0,
};

export interface ComparateurResult {
  tmi: number;
  taux: number;
  /** Facteur de levier = 1 / (1 − TMI/100). TMI 0 → 1 (aucune majoration). */
  facteurLevier: number;
  /** Versement PER réel (effort majoré). */
  perMensuel: number;
  perInitial: number;
  /** Économie d'impôt mensuelle/initiale = part complétée automatiquement côté PER. */
  economieMensuelle: number;
  economieInitiale: number;
  per: {
    capitalNet: number; // sortie capital (sortie1.capitalNet)
    capitalFinal: number;
    versementsCumules: number;
  };
  av: {
    capitalNetSans: number;
    capitalFinalBrut: number;
    primesVersees: number;
  };
  gagnant: Gagnant;
  /** Écart absolu (€) entre les deux capitaux nets. */
  ecart: number;
  /** Écart relatif (%) rapporté au plus grand des deux nets. */
  ecartPct: number;
}

/**
 * Message de verdict pédagogique à 3 régimes, calé sur le gagnant RÉEL + la TMI.
 * - PER nettement devant → effet de levier fiscal ;
 * - quasi-parité (|écart| ≤ 1 %) → souplesse de l'AV (sert le « décourager le PER à
 *   TMI basse » du MD, honnêtement, sans verdict numérique forcé) ;
 * - AV devant → fiscalité de sortie AV plus légère.
 */
export function verdictComparateur(r: ComparateurResult): { titre: string; message: string } {
  if (r.gagnant === "per") {
    return {
      titre: "Avantage PER",
      message: `À votre tranche (${r.tmi} %), l'effet de levier fiscal du PER à l'entrée prend l'avantage : à effort net identique, le capital net projeté est supérieur de ${Math.round(r.ecart).toLocaleString("fr-FR")} €.`,
    };
  }
  if (r.gagnant === "av") {
    return {
      titre: "Avantage assurance-vie",
      message: `À votre tranche (${r.tmi} %), l'avantage fiscal d'entrée du PER est trop faible : la fiscalité de sortie plus légère de l'assurance-vie l'emporte (${Math.round(r.ecart).toLocaleString("fr-FR")} € de mieux), tout en gardant l'épargne disponible.`,
    };
  }
  return {
    titre: "Produits quasi équivalents",
    message: `À votre tranche (${r.tmi} %), les deux solutions aboutissent à un capital net très proche. À avantage fiscal équivalent, l'assurance-vie conserve l'atout de la souplesse : épargne disponible à tout moment, non bloquée jusqu'à la retraite.`,
  };
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

/** Mappe le profil (3 valeurs partagées) vers le profil AV — rendements identiques. */
function toAVProfil(profil: PerProfil): AVProfil {
  return profil; // "prudent" | "equilibre" | "dynamique" sont communs aux deux moteurs
}

export function computeComparateur(
  input: ComparateurInputs,
  opts?: { tmi?: number }
): ComparateurResult {
  const revenuImposable = Math.max(0, num(input.revenuImposable));
  const parts = Math.max(1, num(input.parts, 1));
  const effortNetMensuel = Math.max(0, num(input.effortNetMensuel));
  const effortNetInitial = Math.max(0, num(input.effortNetInitial));
  const horizon = Math.max(1, Math.round(num(input.horizon, 1)));
  const profil: PerProfil = input.profil in TAUX_PAR_PROFIL ? input.profil : "equilibre";
  const taux = TAUX_PAR_PROFIL[profil];

  const tmi =
    opts?.tmi != null
      ? opts.tmi
      : revenuImposable > 0
        ? calculerTMI(revenuImposable, parts, parts)
        : 0;
  const trancheSortie = num(input.trancheSortie);

  // Facteur de levier de l'effort net (Option B). TMI bornée < 100 (max 45) → sûr.
  const facteurLevier = tmi > 0 && tmi < 100 ? 1 / (1 - tmi / 100) : 1;
  const perMensuel = effortNetMensuel * facteurLevier;
  const perInitial = effortNetInitial * facteurLevier;

  // ── PER : capital net en sortie capital (sortie1). anneeNaissance/ageConversion
  // n'influencent que la sortie 3 (rente) → valeurs neutres ici. ──
  const per = computePerSortie({
    revenuImposable,
    parts,
    anneeNaissance: 1980,
    versementMensuel: perMensuel,
    versementInitial: perInitial,
    horizon,
    profil,
    trancheSortie,
    ageConversion: 67,
  });

  // ── AV : effort net tel quel, capital net SANS accompagnement (jamais la purge). ──
  const av = calculerAV({
    versementInitial: effortNetInitial,
    versementMensuel: effortNetMensuel,
    dureeAnnees: horizon,
    profil: toAVProfil(profil),
    marie: !!input.marie,
  });

  const perNet = per.sortie1.capitalNet;
  const avNet = av.capitalNetSansCervus;
  const ecart = Math.abs(perNet - avNet);
  const ref = Math.max(perNet, avNet, 1);
  const ecartPct = (ecart / ref) * 100;

  let gagnant: Gagnant;
  if (ecartPct <= SEUIL_QUASI_PARITE_PCT) gagnant = "egal";
  else gagnant = perNet > avNet ? "per" : "av";

  return {
    tmi,
    taux,
    facteurLevier,
    perMensuel: Math.round(perMensuel),
    perInitial: Math.round(perInitial),
    economieMensuelle: Math.round(perMensuel - effortNetMensuel),
    economieInitiale: Math.round(perInitial - effortNetInitial),
    per: {
      capitalNet: perNet,
      capitalFinal: per.capitalFinal,
      versementsCumules: per.versementsCumules,
    },
    av: {
      capitalNetSans: avNet,
      capitalFinalBrut: av.capitalFinalBrut,
      // Primes RÉELLEMENT versées en AV (effort net), cohérentes avec le scénario
      // « sans accompagnement ». PAS `primesVerseesTotal` (qui inclut les
      // réinvestissements de la stratégie de rachat, hors périmètre de ce comparateur).
      primesVersees: Math.round(effortNetInitial + effortNetMensuel * 12 * horizon),
    },
    gagnant,
    ecart,
    ecartPct,
  };
}
