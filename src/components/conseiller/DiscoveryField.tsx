"use client";

import { RDV_FIELDS } from "@/lib/rdv-fields";
import { STATUT_MARITAL_OPTIONS } from "@/lib/fiscal-state";
import { PROFIL_LABELS } from "@/lib/per-quick";
import { useRdvClient } from "./RdvClientProvider";

// Libellés écrits tels quels dans le champ texte libre « Profil investisseur »
// (orthographe garantie → lecture pickProfil en correspondance directe).
const PROFIL_OPTIONS = [PROFIL_LABELS.prudent, PROFIL_LABELS.equilibre, PROFIL_LABELS.dynamique];

// Statut professionnel (Lot 10) — même pattern que statut marital / profil : menu
// déroulant côté outil, champ Pipedrive reste texte libre (orthographe garantie).
// Un ancien « Indépendant » (Simulation) s'affiche vide → re-sélection en RDV.
const STATUT_PRO_OPTIONS = [
  "Salarié",
  "TNS",
  "Dirigeant salarié",
  "Profession libérale",
  "Fonctionnaire",
  "Retraité",
  "Sans activité",
];

// Sous-texte d'aide par champ (optionnel).
const FIELD_HINTS: Record<string, string> = {
  rfrReel: "Optionnel — si connu, remplace l'estimation automatique (CEHR/CDHR).",
};

const STATE_BADGE: Record<string, { text: string; cls: string } | null> = {
  vide: null,
  prefill: { text: "pré-rempli (Simulation)", cls: "text-cervus-gold-light" },
  saved: { text: "corrigé en RDV", cls: "text-emerald-400" },
  edited: { text: "● non enregistré", cls: "text-amber-400" },
};

export default function DiscoveryField({ fieldId }: { fieldId: string }) {
  const def = RDV_FIELDS.find((f) => f.id === fieldId);
  const { getValue, setValue, fieldState, getSim } = useRdvClient();
  if (!def) return null;

  const state = fieldState(fieldId);
  const badge = STATE_BADGE[state];
  const sim = getSim(fieldId);
  const showSim = sim != null && String(sim) !== "" && (state === "saved" || state === "edited");

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`f-${fieldId}`} className="text-xs font-medium text-cervus-bronze/70">
          {def.label}
        </label>
        {badge && <span className={`text-[10px] ${badge.cls}`}>{badge.text}</span>}
      </div>
      {/* Menus déroulants à valeurs fixes (Lot 2 / H) → orthographe garantie écrite
          dans le champ texte libre Pipedrive → lecture fiable (correspondance directe).
          Statut marital + Profil investisseur. */}
      {fieldId === "statutMarital" || fieldId === "profil" || fieldId === "statutPro" ? (
        <select
          id={`f-${fieldId}`}
          value={getValue(fieldId)}
          onChange={(e) => setValue(fieldId, e.target.value)}
          className="w-full rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2 text-sm text-cervus-bronze focus:border-cervus-gold focus:outline-none"
        >
          <option value="" className="bg-cervus-dark">—</option>
          {(fieldId === "statutMarital"
            ? STATUT_MARITAL_OPTIONS.map((o) => o.label)
            : fieldId === "statutPro"
              ? STATUT_PRO_OPTIONS
              : PROFIL_OPTIONS
          ).map((label) => (
            <option key={label} value={label} className="bg-cervus-dark">
              {label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={`f-${fieldId}`}
          type="text"
          inputMode={def.kind === "text" ? "text" : "decimal"}
          value={getValue(fieldId)}
          onChange={(e) => setValue(fieldId, e.target.value)}
          className="w-full rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2 text-sm text-cervus-bronze placeholder-cervus-bronze/30 focus:border-cervus-gold focus:outline-none"
          placeholder="—"
        />
      )}
      {FIELD_HINTS[fieldId] && (
        <p className="text-[10px] text-cervus-bronze/40">{FIELD_HINTS[fieldId]}</p>
      )}
      {showSim && (
        <p className="text-[10px] text-cervus-bronze/40">
          Simulation : {String(sim)}
          {def.kind === "money" ? " €" : ""}
        </p>
      )}
    </div>
  );
}
