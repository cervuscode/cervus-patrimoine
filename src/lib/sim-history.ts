/**
 * Historique de session des simulations consultées en RDV (Lot 3).
 *
 * Module ISOMORPHE (aucun secret, aucun import serveur) : importable côté client
 * (capture dans les simulateurs + formatage de la note) ET serveur (réutilisable).
 *
 * Ne consomme PAS fiscal-engine : les résultats sont déjà calculés par les
 * simulateurs (per-quick / per-sortie) et seulement mémorisés ici, puis formatés
 * en note Pipedrive au moment où le conseiller clique « Générer la note ».
 *
 * Invariants :
 *  - purement en mémoire (state React du contexte) ; jamais persisté au fil de l'eau ;
 *  - écrit dans la note Pipedrive uniquement au clic explicite ;
 *  - dédup CONSÉCUTIF (tue les re-renders identiques, garde A→B→A = 3 variantes).
 */

import { PROFIL_LABELS, formatEuro, type PerProfil } from "./per-quick";
import type { AVProfil } from "./av-engine";

/** Libellés des profils AV (4 valeurs, dont « responsable », absent des profils PER). */
const AV_PROFIL_LABELS: Record<AVProfil, string> = {
  prudent: "Prudent",
  equilibre: "Équilibré",
  responsable: "Responsable",
  dynamique: "Dynamique",
};

// ── Type d'enregistrement ─────────────────────────────────────────────────────
export interface PerQuickRecord {
  id: string;
  ts: number;
  simId: "per-quick";
  label: "PER rapide";
  inputs: {
    versementMensuel: number;
    versementInitial: number;
    horizon: number;
    taux: number;
    profil: PerProfil;
  };
  result: {
    tmi: number;
    economieFiscale: number;
    capitalFinal: number;
    totalVerse: number;
  };
}

export interface PerFullRecord {
  id: string;
  ts: number;
  simId: "per-full";
  label: "PER complet";
  inputs: {
    versementMensuel: number;
    versementInitial: number;
    horizon: number;
    taux: number;
    profil: PerProfil;
    trancheSortie: number;
    ageConversion: number;
  };
  result: {
    capitalFinal: number;
    sortie1Net: number;
    sortie2RetraitMensuel: number;
    sortie2Net: number;
    sortie3Disponible: boolean;
    sortie3RenteMensuelle: number;
    sortie3RenteNetteMensuelle: number;
  };
}

export interface ImpotRecord {
  id: string;
  ts: number;
  simId: "impot";
  label: "Impôt sur le revenu";
  inputs: {
    statut: string;
    nbEnfants: number;
    garde: string;
    demiPartHandicap: boolean;
    revenuImposable: number;
  };
  result: {
    impotNet: number;
    tmi: number;
    partsTotal: number;
    tauxMoyen: number;
    plafonnementActif: boolean;
  };
}

export interface ReductionRecord {
  id: string;
  ts: number;
  simId: "reduction-impot";
  label: "Réduction d'impôt PER";
  inputs: {
    statut: string;
    nbEnfants: number;
    garde: string;
    demiPartHandicap: boolean;
    revenuImposable: number;
    versementPer: number;
  };
  result: {
    impotAvant: number;
    impotApres: number;
    economie: number;
    tmiAvant: number;
    tmiApres: number;
  };
}

export interface ComparateurRecord {
  id: string;
  ts: number;
  simId: "comparateur-av-per";
  label: "Comparateur AV / PER";
  inputs: {
    effortNetMensuel: number;
    effortNetInitial: number;
    horizon: number;
    profil: PerProfil;
    trancheSortie: number;
    marie: boolean;
  };
  result: {
    tmi: number;
    perNet: number;
    avNet: number;
    gagnant: "per" | "av" | "egal";
    ecart: number;
    ecartPct: number;
  };
}

export interface PyramideRecord {
  id: string;
  ts: number;
  simId: "pyramide-epargne";
  label: "Pyramide de l'épargne";
  inputs: {
    capaciteEpargneMensuelle: number;
  };
  result: {
    patrimoineTotal: number;
    /** Niveaux base → sommet (precaution … dynamique). */
    niveaux: Array<{
      key: string;
      label: string;
      montantReel: number;
      pctTotal: number;
      statut: string;
    }>;
  };
}

export interface ResilienceRecord {
  id: string;
  ts: number;
  simId: "resilience-marches";
  label: "Résilience des marchés";
  inputs: {
    versementInitial: number;
    versementMensuel: number;
    horizon: number;
  };
  result: {
    totalVerse: number;
    finalMsci: number;
    finalPrudent: number;
    finalEquilibre: number;
    finalDynamique: number;
    finalLivretA: number;
    finalFondsEuros: number;
  };
}

export interface AvRecord {
  id: string;
  ts: number;
  simId: "av";
  label: "Assurance-vie";
  inputs: {
    versementInitial: number;
    versementMensuel: number;
    dureeAnnees: number;
    profil: AVProfil;
    marie: boolean;
  };
  result: {
    capitalFinalBrut: number;
    capitalNet: number;
    capitalNetOptimise: number;
    gainOptimisation: number;
    optimisationUtile: boolean;
    totalVerse: number;
  };
}

export type SimRecord =
  | PerQuickRecord
  | PerFullRecord
  | ImpotRecord
  | ReductionRecord
  | ComparateurRecord
  | PyramideRecord
  | ResilienceRecord
  | AvRecord;

/** Enregistrement candidat (sans id/ts, ajoutés par le contexte à la capture). */
export type SimRecordDraft =
  | Omit<PerQuickRecord, "id" | "ts">
  | Omit<PerFullRecord, "id" | "ts">
  | Omit<ImpotRecord, "id" | "ts">
  | Omit<ReductionRecord, "id" | "ts">
  | Omit<ComparateurRecord, "id" | "ts">
  | Omit<PyramideRecord, "id" | "ts">
  | Omit<ResilienceRecord, "id" | "ts">
  | Omit<AvRecord, "id" | "ts">;

// ── Builders result → draft (source UNIQUE du mapping) ─────────────────────────
// Utilisés par les simulateurs connectés (PerQuickSim/PerFullSim) ET les vues de
// présentation (PerQuickPresentation/PerFullPresentation) → un seul endroit décide
// quelles hypothèses/quels résultats sont mémorisés. Types de result minimaux pour
// éviter de coupler ce module aux signatures complètes des moteurs.
export function perQuickDraft(
  inputs: { versementMensuel: number; versementInitial: number; horizon: number; profil: PerProfil },
  result: { taux: number; tmi: number; economieFiscale: number; capitalFinal: number; totalVerse: number }
): Omit<PerQuickRecord, "id" | "ts"> {
  return {
    simId: "per-quick",
    label: "PER rapide",
    inputs: {
      versementMensuel: inputs.versementMensuel,
      versementInitial: inputs.versementInitial,
      horizon: inputs.horizon,
      taux: result.taux,
      profil: inputs.profil,
    },
    result: {
      tmi: result.tmi,
      economieFiscale: result.economieFiscale,
      capitalFinal: result.capitalFinal,
      totalVerse: result.totalVerse,
    },
  };
}

export function perFullDraft(
  inputs: {
    versementMensuel: number;
    versementInitial: number;
    horizon: number;
    profil: PerProfil;
    trancheSortie: number;
    ageConversion: number;
  },
  result: {
    taux: number;
    capitalFinal: number;
    sortie1: { capitalNet: number };
    sortie2: { equivalentMensuel: number; capitalNet: number };
    sortie3: { disponible: boolean; renteMensuelle: number; renteNetteAnnuelle: number };
  }
): Omit<PerFullRecord, "id" | "ts"> {
  return {
    simId: "per-full",
    label: "PER complet",
    inputs: {
      versementMensuel: inputs.versementMensuel,
      versementInitial: inputs.versementInitial,
      horizon: inputs.horizon,
      taux: result.taux,
      profil: inputs.profil,
      trancheSortie: inputs.trancheSortie,
      ageConversion: inputs.ageConversion,
    },
    result: {
      capitalFinal: result.capitalFinal,
      sortie1Net: result.sortie1.capitalNet,
      sortie2RetraitMensuel: result.sortie2.equivalentMensuel,
      sortie2Net: result.sortie2.capitalNet,
      sortie3Disponible: result.sortie3.disponible,
      sortie3RenteMensuelle: result.sortie3.renteMensuelle,
      sortie3RenteNetteMensuelle: Math.round(result.sortie3.renteNetteAnnuelle / 12),
    },
  };
}

export function impotDraft(
  inputs: {
    statut: string;
    nbEnfants: number;
    garde: string;
    demiPartHandicap: boolean;
    revenuImposable: number;
  },
  result: {
    impotNet: number;
    tmi: number;
    partsTotal: number;
    tauxMoyen: number;
    plafonnementActif: boolean;
  }
): Omit<ImpotRecord, "id" | "ts"> {
  return {
    simId: "impot",
    label: "Impôt sur le revenu",
    inputs: {
      statut: inputs.statut,
      nbEnfants: inputs.nbEnfants,
      garde: inputs.garde,
      demiPartHandicap: inputs.demiPartHandicap,
      revenuImposable: inputs.revenuImposable,
    },
    result: {
      impotNet: result.impotNet,
      tmi: result.tmi,
      partsTotal: result.partsTotal,
      tauxMoyen: result.tauxMoyen,
      plafonnementActif: result.plafonnementActif,
    },
  };
}

export function reductionDraft(
  inputs: {
    statut: string;
    nbEnfants: number;
    garde: string;
    demiPartHandicap: boolean;
    revenuImposable: number;
    versementPer: number;
  },
  result: {
    avant: { impotNet: number; tmi: number };
    apres: { impotNet: number; tmi: number };
    economie: number;
  }
): Omit<ReductionRecord, "id" | "ts"> {
  return {
    simId: "reduction-impot",
    label: "Réduction d'impôt PER",
    inputs: {
      statut: inputs.statut,
      nbEnfants: inputs.nbEnfants,
      garde: inputs.garde,
      demiPartHandicap: inputs.demiPartHandicap,
      revenuImposable: inputs.revenuImposable,
      versementPer: inputs.versementPer,
    },
    result: {
      impotAvant: result.avant.impotNet,
      impotApres: result.apres.impotNet,
      economie: result.economie,
      tmiAvant: result.avant.tmi,
      tmiApres: result.apres.tmi,
    },
  };
}

export function comparateurDraft(
  inputs: {
    effortNetMensuel: number;
    effortNetInitial: number;
    horizon: number;
    profil: PerProfil;
    trancheSortie: number;
    marie: boolean;
  },
  result: {
    tmi: number;
    per: { capitalNet: number };
    av: { capitalNetSans: number };
    gagnant: "per" | "av" | "egal";
    ecart: number;
    ecartPct: number;
  }
): Omit<ComparateurRecord, "id" | "ts"> {
  return {
    simId: "comparateur-av-per",
    label: "Comparateur AV / PER",
    inputs: {
      effortNetMensuel: inputs.effortNetMensuel,
      effortNetInitial: inputs.effortNetInitial,
      horizon: inputs.horizon,
      profil: inputs.profil,
      trancheSortie: inputs.trancheSortie,
      marie: inputs.marie,
    },
    result: {
      tmi: result.tmi,
      perNet: result.per.capitalNet,
      avNet: result.av.capitalNetSans,
      gagnant: result.gagnant,
      ecart: result.ecart,
      ecartPct: result.ecartPct,
    },
  };
}

export function pyramideDraft(
  inputs: { capaciteEpargneMensuelle: number },
  result: {
    patrimoineTotal: number;
    niveaux: Array<{
      key: string;
      label: string;
      montantReel: number;
      pctTotal: number;
      statut: string;
    }>;
  }
): Omit<PyramideRecord, "id" | "ts"> {
  return {
    simId: "pyramide-epargne",
    label: "Pyramide de l'épargne",
    inputs: { capaciteEpargneMensuelle: inputs.capaciteEpargneMensuelle },
    result: {
      patrimoineTotal: result.patrimoineTotal,
      niveaux: result.niveaux.map((n) => ({
        key: n.key,
        label: n.label,
        montantReel: n.montantReel,
        pctTotal: n.pctTotal,
        statut: n.statut,
      })),
    },
  };
}

export function resilienceDraft(
  inputs: { versementInitial: number; versementMensuel: number; horizon: number },
  result: {
    totalVerse: number;
    finals: {
      msci?: number;
      prudent?: number;
      equilibre?: number;
      dynamique?: number;
      livretA?: number;
      fondsEuros?: number;
    };
  }
): Omit<ResilienceRecord, "id" | "ts"> {
  return {
    simId: "resilience-marches",
    label: "Résilience des marchés",
    inputs: {
      versementInitial: inputs.versementInitial,
      versementMensuel: inputs.versementMensuel,
      horizon: inputs.horizon,
    },
    result: {
      totalVerse: result.totalVerse,
      finalMsci: result.finals.msci ?? 0,
      finalPrudent: result.finals.prudent ?? 0,
      finalEquilibre: result.finals.equilibre ?? 0,
      finalDynamique: result.finals.dynamique ?? 0,
      finalLivretA: result.finals.livretA ?? 0,
      finalFondsEuros: result.finals.fondsEuros ?? 0,
    },
  };
}

export function avDraft(
  inputs: {
    versementInitial: number;
    versementMensuel: number;
    dureeAnnees: number;
    profil: AVProfil;
    marie: boolean;
  },
  result: {
    capitalFinalBrut: number;
    capitalNet: number;
    capitalNetOptimise: number;
    gainOptimisation: number;
    optimisationUtile: boolean;
    totalVerse: number;
  }
): Omit<AvRecord, "id" | "ts"> {
  return {
    simId: "av",
    label: "Assurance-vie",
    inputs: {
      versementInitial: inputs.versementInitial,
      versementMensuel: inputs.versementMensuel,
      dureeAnnees: inputs.dureeAnnees,
      profil: inputs.profil,
      marie: inputs.marie,
    },
    result: {
      capitalFinalBrut: result.capitalFinalBrut,
      capitalNet: result.capitalNet,
      capitalNetOptimise: result.capitalNetOptimise,
      gainOptimisation: result.gainOptimisation,
      optimisationUtile: result.optimisationUtile,
      totalVerse: result.totalVerse,
    },
  };
}

// ── Dédup ─────────────────────────────────────────────────────────────────────
/**
 * Signature stable d'une variante = simId + hypothèses arrondies + résultat clé.
 * Sert au dédup CONSÉCUTIF : on n'ajoute que si différent du dernier enregistrement.
 * (Ne dépend pas de l'horodatage.)
 */
export function signatureOf(rec: SimRecordDraft): string {
  if (rec.simId === "per-quick") {
    const i = rec.inputs;
    return [
      "pq",
      Math.round(i.versementMensuel),
      Math.round(i.versementInitial),
      Math.round(i.horizon),
      i.taux.toFixed(4),
      i.profil,
      Math.round(rec.result.capitalFinal),
    ].join("|");
  }
  if (rec.simId === "impot") {
    const i = rec.inputs;
    return [
      "im",
      i.statut,
      Math.round(i.nbEnfants),
      i.garde,
      i.demiPartHandicap ? "h" : "",
      Math.round(i.revenuImposable),
      Math.round(rec.result.impotNet),
    ].join("|");
  }
  if (rec.simId === "reduction-impot") {
    const i = rec.inputs;
    return [
      "ri",
      i.statut,
      Math.round(i.nbEnfants),
      i.garde,
      i.demiPartHandicap ? "h" : "",
      Math.round(i.revenuImposable),
      Math.round(i.versementPer),
      Math.round(rec.result.economie),
    ].join("|");
  }
  if (rec.simId === "comparateur-av-per") {
    const i = rec.inputs;
    return [
      "cp",
      Math.round(i.effortNetMensuel),
      Math.round(i.effortNetInitial),
      Math.round(i.horizon),
      i.profil,
      Math.round(i.trancheSortie),
      i.marie ? "m" : "",
      rec.result.gagnant,
      Math.round(rec.result.perNet),
      Math.round(rec.result.avNet),
    ].join("|");
  }
  if (rec.simId === "pyramide-epargne") {
    return [
      "py",
      Math.round(rec.inputs.capaciteEpargneMensuelle),
      Math.round(rec.result.patrimoineTotal),
      ...rec.result.niveaux.map((n) => Math.round(n.montantReel)),
    ].join("|");
  }
  if (rec.simId === "resilience-marches") {
    const i = rec.inputs;
    const r = rec.result;
    return [
      "rm",
      Math.round(i.versementInitial),
      Math.round(i.versementMensuel),
      Math.round(i.horizon),
      Math.round(r.finalPrudent),
      Math.round(r.finalEquilibre),
      Math.round(r.finalDynamique),
    ].join("|");
  }
  if (rec.simId === "av") {
    const i = rec.inputs;
    return [
      "av",
      Math.round(i.versementInitial),
      Math.round(i.versementMensuel),
      Math.round(i.dureeAnnees),
      i.profil,
      i.marie ? "m" : "",
      Math.round(rec.result.capitalNet),
      Math.round(rec.result.capitalNetOptimise),
    ].join("|");
  }
  const i = rec.inputs;
  return [
    "pf",
    Math.round(i.versementMensuel),
    Math.round(i.versementInitial),
    Math.round(i.horizon),
    i.taux.toFixed(4),
    i.profil,
    Math.round(i.trancheSortie),
    Math.round(i.ageConversion),
    Math.round(rec.result.capitalFinal),
  ].join("|");
}

// ── Formatage de la note Pipedrive (HTML léger) ───────────────────────────────
export interface DecouverteLine {
  /** Libellé de la section/ligne (ex. « Situation »). */
  label: string;
  /** Valeur formatée prête à afficher. Lignes vides ignorées par l'appelant. */
  value: string;
}

export interface FormatNoteParams {
  code: string | null;
  generatedAt: Date;
  /** Lignes Découverte déjà composées (label : valeur), seulement les renseignées. */
  decouverte: DecouverteLine[];
  history: SimRecord[];
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatNombre(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

function fmtTaux(t: number): string {
  return `${(t * 100).toFixed(t * 100 % 1 === 0 ? 0 : 1).replace(".", ",")} %`;
}

/** Pourcentage d'une fraction 0..1 (ex. 0,254 → « 25 % »). */
function fmtPct(p: number): string {
  return `${Math.round(p * 100)} %`;
}

/** Résumé une ligne d'une simulation (hypothèses → résultats). */
export function summarizeRecord(rec: SimRecord): string {
  if (rec.simId === "per-quick") {
    const i = rec.inputs;
    const r = rec.result;
    return (
      `<b>PER rapide</b> — versement ${formatEuro(i.versementMensuel)}/mois` +
      (i.versementInitial > 0 ? `, apport initial ${formatEuro(i.versementInitial)}` : "") +
      `, horizon ${Math.round(i.horizon)} ans, profil ${PROFIL_LABELS[i.profil]}, taux ${fmtTaux(i.taux)} ` +
      `→ capital projeté ${formatEuro(r.capitalFinal)}, économie fiscale ${formatEuro(r.economieFiscale)}/an`
    );
  }
  if (rec.simId === "impot") {
    const i = rec.inputs;
    const r = rec.result;
    const tauxMoyen = `${(r.tauxMoyen * 100).toFixed(1).replace(".", ",")} %`;
    return (
      `<b>Impôt sur le revenu</b> — ${esc(i.statut)}` +
      (i.nbEnfants > 0 ? `, ${i.nbEnfants} enfant${i.nbEnfants > 1 ? "s" : ""}` : "") +
      (i.demiPartHandicap ? ", demi-part invalidité" : "") +
      `, revenu ${formatEuro(i.revenuImposable)} (${formatNombre(r.partsTotal)} parts) ` +
      `→ impôt net ${formatEuro(r.impotNet)}, TMI ${r.tmi} %, taux moyen ${tauxMoyen}` +
      (r.plafonnementActif ? " · plafonnement QF actif" : "")
    );
  }
  if (rec.simId === "reduction-impot") {
    const i = rec.inputs;
    const r = rec.result;
    return (
      `<b>Réduction d'impôt PER</b> — ${esc(i.statut)}` +
      (i.nbEnfants > 0 ? `, ${i.nbEnfants} enfant${i.nbEnfants > 1 ? "s" : ""}` : "") +
      (i.demiPartHandicap ? ", demi-part invalidité" : "") +
      `, revenu ${formatEuro(i.revenuImposable)}, versement PER ${formatEuro(i.versementPer)} ` +
      `→ impôt ${formatEuro(r.impotAvant)} → ${formatEuro(r.impotApres)}, ` +
      `économie ${formatEuro(r.economie)}/an` +
      (r.tmiAvant !== r.tmiApres ? ` (TMI ${r.tmiAvant} % → ${r.tmiApres} %)` : "")
    );
  }
  if (rec.simId === "comparateur-av-per") {
    const i = rec.inputs;
    const r = rec.result;
    const verdict =
      r.gagnant === "per"
        ? "avantage PER"
        : r.gagnant === "av"
          ? "avantage assurance-vie"
          : "quasi-équivalents (souplesse AV)";
    return (
      `<b>Comparateur AV / PER</b> — effort net ${formatEuro(i.effortNetMensuel)}/mois` +
      (i.effortNetInitial > 0 ? `, apport initial ${formatEuro(i.effortNetInitial)}` : "") +
      `, horizon ${Math.round(i.horizon)} ans, profil ${PROFIL_LABELS[i.profil]}, TMI ${r.tmi} % ` +
      `→ PER net ${formatEuro(r.perNet)} vs AV net ${formatEuro(r.avNet)} ` +
      `(${verdict}, écart ${formatEuro(r.ecart)})`
    );
  }
  if (rec.simId === "pyramide-epargne") {
    const r = rec.result;
    const marque = (s: string): string =>
      s === "sur" ? " (sur-représenté)" : s === "sous" ? " (sous-représenté)" : "";
    const lignes = r.niveaux
      .map((n) => `${n.label.toLowerCase()} ${formatEuro(n.montantReel)} (${fmtPct(n.pctTotal)})${marque(n.statut)}`)
      .join(", ");
    return `<b>Pyramide de l'épargne</b> — patrimoine ${formatEuro(r.patrimoineTotal)} → ${lignes}`;
  }
  if (rec.simId === "resilience-marches") {
    const i = rec.inputs;
    const r = rec.result;
    return (
      `<b>Résilience des marchés</b> — projection ${formatEuro(i.versementMensuel)}/mois` +
      (i.versementInitial > 0 ? `, apport initial ${formatEuro(i.versementInitial)}` : "") +
      `, horizon ${Math.round(i.horizon)} ans (versé ${formatEuro(r.totalVerse)}) ` +
      `→ MSCI World ${formatEuro(r.finalMsci)} · Prudent ${formatEuro(r.finalPrudent)}, ` +
      `Équilibré ${formatEuro(r.finalEquilibre)}, Dynamique ${formatEuro(r.finalDynamique)} · ` +
      `Livret A ${formatEuro(r.finalLivretA)}, fonds euros ${formatEuro(r.finalFondsEuros)}`
    );
  }
  if (rec.simId === "av") {
    const i = rec.inputs;
    const r = rec.result;
    return (
      `<b>Assurance-vie</b> — versement ${formatEuro(i.versementMensuel)}/mois` +
      (i.versementInitial > 0 ? `, apport initial ${formatEuro(i.versementInitial)}` : "") +
      `, horizon ${Math.round(i.dureeAnnees)} ans, profil ${AV_PROFIL_LABELS[i.profil]} ` +
      `→ capital brut ${formatEuro(r.capitalFinalBrut)}, net ${formatEuro(r.capitalNet)}, ` +
      `net optimisé ${formatEuro(r.capitalNetOptimise)}` +
      (r.optimisationUtile && r.gainOptimisation > 0
        ? ` (gain optimisation +${formatEuro(r.gainOptimisation)})`
        : "")
    );
  }
  const i = rec.inputs;
  const r = rec.result;
  const rente = r.sortie3Disponible
    ? `rente viagère à ${Math.round(i.ageConversion)} ans ≈ ${formatEuro(r.sortie3RenteNetteMensuelle)}/mois net`
    : `rente viagère à ${Math.round(i.ageConversion)} ans non proposée`;
  return (
    `<b>PER complet</b> — versement ${formatEuro(i.versementMensuel)}/mois` +
    (i.versementInitial > 0 ? `, apport initial ${formatEuro(i.versementInitial)}` : "") +
    `, horizon ${Math.round(i.horizon)} ans, profil ${PROFIL_LABELS[i.profil]}, taux ${fmtTaux(i.taux)}, ` +
    `sortie tranche ${Math.round(i.trancheSortie)} % ` +
    `→ capital ${formatEuro(r.capitalFinal)} · capital net (sortie intégrale) ${formatEuro(r.sortie1Net)} · ` +
    `fractionnement 20 ans ≈ ${formatEuro(r.sortie2RetraitMensuel)}/mois (net total ${formatEuro(r.sortie2Net)}) · ` +
    rente
  );
}

/**
 * Note de synthèse complète en HTML léger (Pipedrive rend du HTML).
 * - En-tête : code client + horodatage de génération.
 * - Section Découverte RDV : seulement les lignes renseignées.
 * - Section Simulations consultées : OMISE si l'historique est vide.
 */
export function formatSyntheseNote(params: FormatNoteParams): string {
  const { code, generatedAt, decouverte, history } = params;
  const dateStr = generatedAt.toLocaleDateString("fr-FR");
  const timeStr = generatedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const parts: string[] = [];
  parts.push(`<h3>Synthèse RDV${code ? ` — ${esc(code)}` : ""}</h3>`);
  parts.push(`<p><i>Générée le ${dateStr} à ${timeStr}</i></p>`);

  const decLines = decouverte.filter((d) => d.value.trim() !== "");
  if (decLines.length > 0) {
    parts.push(`<p><b>Découverte RDV</b></p>`);
    parts.push(
      "<ul>" +
        decLines.map((d) => `<li>${esc(d.label)} : ${esc(d.value)}</li>`).join("") +
        "</ul>"
    );
  }

  if (history.length > 0) {
    parts.push(`<p><b>Simulations consultées</b> (${history.length})</p>`);
    parts.push(
      "<ol>" +
        history
          .map((rec) => `<li><i>${fmtTime(rec.ts)}</i> — ${summarizeRecord(rec)}</li>`)
          .join("") +
        "</ol>"
    );
  }

  return parts.join("\n");
}
