"use client";

import { useMemo } from "react";
import {
  computeReduction,
  type ReductionInputs,
} from "@/lib/reduction-impot";
import { GARDE_OPTIONS, type GardeRegime } from "@/lib/impot-sim";
import { STATUT_MARITAL_OPTIONS, mapStatutToParts } from "@/lib/fiscal-state";
import { formatEuro } from "@/lib/per-quick";
import type { ClientIdentity, HypoValues } from "@/lib/presentation-bridge";
import { reductionDraft, type SimRecordDraft } from "@/lib/sim-history";
import KeepResultButton from "../KeepResultButton";
import ReductionStacks from "../ReductionStacks";
import { BigResult, HypoNumber, HypoPills } from "./controls";

/**
 * Vue présentation de l'illustration réduction d'impôt (Lot 6). Comme le Lot 4 :
 * aucune identité en lecture seule — TOUT est éditable (revenu, situation, versement).
 * Le visuel avant/après est mis en avant ; les champs restent secondaires.
 * L'identité partagée (`identity`) n'est pas utilisée → « Actualiser » est sans
 * effet sur cet onglet (cohérent avec « tout est hypothèse, jamais écrasé »).
 */
export default function ReductionPresentation({
  hypo,
  onHypo,
  onRecord,
}: {
  identity: ClientIdentity;
  hypo: HypoValues;
  onHypo: <K extends keyof HypoValues>(key: K, value: HypoValues[K]) => void;
  onRecord?: (draft: SimRecordDraft) => boolean;
}) {
  const inputs = hypo.reduction;
  const result = useMemo(() => computeReduction(inputs), [inputs]);

  function setRed<K extends keyof ReductionInputs>(key: K, value: ReductionInputs[K]) {
    onHypo("reduction", { ...inputs, [key]: value });
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
        reductionDraft(
          {
            statut: inputs.statut,
            nbEnfants: Math.max(0, Math.round(inputs.nbEnfants)),
            garde: gardePertinente ? inputs.garde : "classique",
            demiPartHandicap: inputs.demiPartHandicap,
            revenuImposable: inputs.revenuImposable,
            versementPer: inputs.versementPer,
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
          onSelect={(v) => setRed("statut", v)}
        />
        <HypoNumber
          label="Nombre d'enfants"
          value={inputs.nbEnfants}
          onChange={(v) => setRed("nbEnfants", v)}
        />
        {gardePertinente && (
          <HypoPills<GardeRegime>
            label="Régime de garde"
            options={GARDE_OPTIONS}
            active={inputs.garde}
            onSelect={(v) => setRed("garde", v)}
          />
        )}
        <HypoNumber
          label="Revenu net imposable"
          value={inputs.revenuImposable}
          onChange={(v) => setRed("revenuImposable", v)}
          suffix="€"
        />
        <HypoNumber
          label="Versement PER à illustrer"
          value={inputs.versementPer}
          onChange={(v) => setRed("versementPer", v)}
          suffix="€"
        />
        <label className="flex items-center gap-2.5 self-end pb-2.5 sm:col-span-2">
          <input
            type="checkbox"
            checked={inputs.demiPartHandicap}
            onChange={(e) => setRed("demiPartHandicap", e.target.checked)}
            className="h-4 w-4 accent-cervus-gold"
          />
          <span className="text-sm text-cervus-bronze/80">
            Invalidité ou handicap (demi-part supplémentaire)
          </span>
        </label>
      </div>

      {/* Le visuel avant/après — en avant */}
      <ReductionStacks result={result} />

      {/* Résultats — en avant */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BigResult label="Impôt sans versement" value={formatEuro(result.avant.impotNet)} />
        <BigResult label="Impôt avec versement" value={formatEuro(result.apres.impotNet)} />
        <BigResult label="Économie d'impôt / an" value={formatEuro(result.economie)} highlight />
      </div>

      {result.tmiChange && (
        <p className="rounded-2xl border border-cervus-gold/30 bg-cervus-gold/10 px-4 py-3 text-sm text-cervus-bronze">
          Le versement fait passer la tranche marginale de <b>{result.avant.tmi} %</b> à{" "}
          <b>{result.apres.tmi} %</b>.
        </p>
      )}

      {onRecord && (
        <KeepResultButton
          onKeep={keep}
          disabled={inputs.revenuImposable <= 0 || inputs.versementPer <= 0}
          className="w-full sm:w-auto sm:self-end"
        />
      )}
    </div>
  );
}
