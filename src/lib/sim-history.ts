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

export type SimRecord = PerQuickRecord | PerFullRecord;

/** Enregistrement candidat (sans id/ts, ajoutés par le contexte à la capture). */
export type SimRecordDraft =
  | Omit<PerQuickRecord, "id" | "ts">
  | Omit<PerFullRecord, "id" | "ts">;

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

function fmtTaux(t: number): string {
  return `${(t * 100).toFixed(t * 100 % 1 === 0 ? 0 : 1).replace(".", ",")} %`;
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
