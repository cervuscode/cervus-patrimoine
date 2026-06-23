"use client";

import { useMemo } from "react";
import { computePyramide, type PyramideInputs } from "@/lib/pyramide-epargne";
import { formatEuro } from "@/lib/per-quick";
import type { ClientIdentity, HypoValues } from "@/lib/presentation-bridge";
import { pyramideDraft, type SimRecordDraft } from "@/lib/sim-history";
import KeepResultButton from "../KeepResultButton";
import PyramidsView from "../PyramidsView";
import { HypoNumber } from "./controls";

/**
 * Vue présentation de la « Pyramide de l'épargne » (Lot 9). Comme l'impôt/réduction :
 * aucune identité en lecture seule — TOUT est éditable (les encours). L'identité
 * partagée n'est pas utilisée → « Actualiser » est sans effet sur cet onglet.
 */
export default function PyramidePresentation({
  hypo,
  onHypo,
  onRecord,
}: {
  identity: ClientIdentity;
  hypo: HypoValues;
  onHypo: <K extends keyof HypoValues>(key: K, value: HypoValues[K]) => void;
  onRecord?: (draft: SimRecordDraft) => boolean;
}) {
  const inputs = hypo.pyramide;
  const result = useMemo(() => computePyramide(inputs), [inputs]);

  function setPyr<K extends keyof PyramideInputs>(key: K, value: PyramideInputs[K]) {
    onHypo("pyramide", { ...inputs, [key]: value });
  }

  function keep(): boolean {
    if (!onRecord) return false;
    return (
      onRecord(
        pyramideDraft({ capaciteEpargneMensuelle: inputs.capaciteEpargneMensuelle }, result)
      ) !== false
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Le visuel — en avant */}
      <PyramidsView result={result} />

      {result.ciblePrecaution !== null && (
        <p className="text-center text-sm text-cervus-bronze/60">
          Cible de précaution : {formatEuro(result.ciblePrecaution)}
          {result.surplus > 0 && <> · surplus à investir {formatEuro(result.surplus)}</>}
        </p>
      )}

      {/* Hypothèses — tout éditable */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HypoNumber label="Livrets réglementés" value={inputs.livretsReglementes} onChange={(v) => setPyr("livretsReglementes", v)} suffix="€" />
        <HypoNumber label="Livrets boostés / fiscalisés" value={inputs.livretsBoostes} onChange={(v) => setPyr("livretsBoostes", v)} suffix="€" />
        <HypoNumber label="Autre épargne" value={inputs.autreEpargne} onChange={(v) => setPyr("autreEpargne", v)} suffix="€" />
        <HypoNumber label="Encours AV total" value={inputs.encoursAv} onChange={(v) => setPyr("encoursAv", v)} suffix="€" />
        <HypoNumber label="… dont fonds euros" value={inputs.encoursFondsEuros} onChange={(v) => setPyr("encoursFondsEuros", v)} suffix="€" />
        <HypoNumber label="Encours PEA" value={inputs.encoursPea} onChange={(v) => setPyr("encoursPea", v)} suffix="€" />
        <HypoNumber label="Encours PER" value={inputs.encoursPer} onChange={(v) => setPyr("encoursPer", v)} suffix="€" />
        <HypoNumber label="Compte-titres ordinaire" value={inputs.cto} onChange={(v) => setPyr("cto", v)} suffix="€" />
        <HypoNumber label="Crypto-actifs" value={inputs.crypto} onChange={(v) => setPyr("crypto", v)} suffix="€" />
        <HypoNumber label="Capacité d'épargne mensuelle" value={inputs.capaciteEpargneMensuelle} onChange={(v) => setPyr("capaciteEpargneMensuelle", v)} suffix="€" />
      </div>

      {onRecord && (
        <KeepResultButton
          onKeep={keep}
          disabled={result.patrimoineTotal <= 0}
          className="w-full sm:w-auto sm:self-end"
        />
      )}
    </div>
  );
}
