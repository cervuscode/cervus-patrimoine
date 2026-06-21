"use client";

import { useMemo } from "react";
import {
  computeImpot,
  formatPourcent,
  GARDE_OPTIONS,
  type GardeRegime,
  type ImpotInputs,
} from "@/lib/impot-sim";
import { STATUT_MARITAL_OPTIONS, mapStatutToParts } from "@/lib/fiscal-state";
import { formatEuro } from "@/lib/per-quick";
import type { ClientIdentity, HypoValues } from "@/lib/presentation-bridge";
import { impotDraft, type SimRecordDraft } from "@/lib/sim-history";
import KeepResultButton from "../KeepResultButton";
import { BigResult, HypoNumber, HypoPills } from "./controls";

/**
 * Vue présentation du Simulateur d'impôt (Lot 4). Particularité : aucune identité
 * en lecture seule — TOUT est éditable (revenu et situation familiale inclus). Les
 * résultats sont mis en avant ; les champs de saisie restent secondaires. L'identité
 * partagée (`identity`) n'est pas utilisée ici → « Actualiser » est sans effet sur
 * cet onglet (cohérent avec « tout est hypothèse, jamais écrasé »).
 */
export default function ImpotPresentation({
  hypo,
  onHypo,
  onRecord,
}: {
  identity: ClientIdentity;
  hypo: HypoValues;
  onHypo: <K extends keyof HypoValues>(key: K, value: HypoValues[K]) => void;
  onRecord?: (draft: SimRecordDraft) => boolean;
}) {
  const inputs = hypo.impot;
  const result = useMemo(() => computeImpot(inputs), [inputs]);

  function setImpot<K extends keyof ImpotInputs>(key: K, value: ImpotInputs[K]) {
    onHypo("impot", { ...inputs, [key]: value });
  }

  const isCouple = useMemo(() => {
    const s = mapStatutToParts(inputs.statut);
    return s === "marie" || s === "pacse";
  }, [inputs.statut]);
  const gardePertinente = !isCouple && Math.round(inputs.nbEnfants) > 0;

  function keep(): boolean {
    if (!onRecord) return false;
    return (
      onRecord(
        impotDraft(
          {
            statut: inputs.statut,
            nbEnfants: Math.max(0, Math.round(inputs.nbEnfants)),
            garde: gardePertinente ? inputs.garde : "classique",
            demiPartHandicap: inputs.demiPartHandicap,
            revenuImposable: inputs.revenuImposable,
          },
          result
        )
      ) !== false
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hypothèses — tout éditable */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HypoPills
          label="Statut marital"
          options={STATUT_MARITAL_OPTIONS.map((o) => ({ value: o.label, label: o.label }))}
          active={inputs.statut}
          onSelect={(v) => setImpot("statut", v)}
        />
        <HypoNumber
          label="Nombre d'enfants"
          value={inputs.nbEnfants}
          onChange={(v) => setImpot("nbEnfants", v)}
        />
        {gardePertinente && (
          <HypoPills<GardeRegime>
            label="Régime de garde"
            options={GARDE_OPTIONS}
            active={inputs.garde}
            onSelect={(v) => setImpot("garde", v)}
          />
        )}
        <HypoNumber
          label="Revenu net imposable"
          value={inputs.revenuImposable}
          onChange={(v) => setImpot("revenuImposable", v)}
          suffix="€"
        />
        <label className="flex items-center gap-2.5 self-end pb-2.5 sm:col-span-2">
          <input
            type="checkbox"
            checked={inputs.demiPartHandicap}
            onChange={(e) => setImpot("demiPartHandicap", e.target.checked)}
            className="h-4 w-4 accent-cervus-gold"
          />
          <span className="text-sm text-cervus-bronze/80">
            Invalidité ou handicap (demi-part supplémentaire)
          </span>
        </label>
      </div>

      {/* Résultats — en avant */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BigResult label="Impôt net sur le revenu" value={formatEuro(result.impotNet)} highlight />
        <BigResult label="Tranche marginale (TMI)" value={`${result.tmi} %`} />
      </div>

      <div className="rounded-3xl border border-cervus-gold/25 bg-cervus-dark/40 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Detail label="Parts fiscales retenues" value={formatNombre(result.partsTotal)} />
          <Detail label="Taux moyen d'imposition" value={formatPourcent(result.tauxMoyen)} />
        </div>
        {result.plafonnementActif && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-[50px] border border-cervus-gold/40 bg-cervus-gold/10 px-4 py-1.5 text-sm text-cervus-bronze">
            Plafonnement du quotient familial actif
          </p>
        )}
      </div>

      {/* Capture manuelle dans la note de synthèse (transmise à la fiche). */}
      {onRecord && (
        <KeepResultButton
          onKeep={keep}
          disabled={inputs.revenuImposable <= 0}
          className="w-full sm:w-auto sm:self-end"
        />
      )}
    </div>
  );
}

function formatNombre(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-cervus-gold/10 pb-2">
      <span className="text-sm text-cervus-bronze/60">{label}</span>
      <span className="font-cormorant text-2xl text-cervus-bronze">{value}</span>
    </div>
  );
}
