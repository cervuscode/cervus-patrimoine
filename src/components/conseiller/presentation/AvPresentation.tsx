"use client";

import { useMemo } from "react";
import { computeAvSim, AV_PROFIL_OPTIONS, type AvSimInputs } from "@/lib/av-sim";
import type { AVProfil } from "@/lib/av-engine";
import { formatEuro } from "@/lib/per-quick";
import type { ClientIdentity, HypoValues } from "@/lib/presentation-bridge";
import { avDraft, type SimRecordDraft } from "@/lib/sim-history";
import KeepResultButton from "../KeepResultButton";
import AvCourbeChart from "../AvCourbeChart";
import { BigResult, HypoNumber, HypoPills } from "./controls";

/**
 * Vue présentation du Simulateur Assurance-vie STANDALONE. Comme l'impôt / la pyramide :
 * TOUT est hypothèse (les 5 paramètres du contrat), n'utilise PAS `ClientIdentity`
 * (« Actualiser » est sans effet sur cet onglet). Affiche les 3 capitaux (brut, net,
 * net optimisé — libellé pudique) + la courbe de valeur du contrat.
 */
export default function AvPresentation({
  hypo,
  onHypo,
  onRecord,
}: {
  identity: ClientIdentity;
  hypo: HypoValues;
  onHypo: <K extends keyof HypoValues>(key: K, value: HypoValues[K]) => void;
  onRecord?: (draft: SimRecordDraft) => boolean;
}) {
  const a = hypo.av;
  const result = useMemo(() => computeAvSim(a), [a]);

  function setA<K extends keyof AvSimInputs>(key: K, value: AvSimInputs[K]) {
    onHypo("av", { ...a, [key]: value });
  }

  function keep(): boolean {
    if (!onRecord) return false;
    return onRecord(avDraft(a, result)) !== false;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hypothèses éditables */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HypoNumber
          label="Versement initial"
          value={a.versementInitial}
          onChange={(v) => setA("versementInitial", v)}
          suffix="€"
        />
        <HypoNumber
          label="Versement mensuel"
          value={a.versementMensuel}
          onChange={(v) => setA("versementMensuel", v)}
          suffix="€"
        />
        <HypoNumber label="Durée" value={a.dureeAnnees} onChange={(v) => setA("dureeAnnees", v)} suffix="ans" />
        <HypoPills<AVProfil>
          label="Profil"
          options={AV_PROFIL_OPTIONS.map((p) => ({ value: p.value, label: p.label }))}
          active={a.profil}
          onSelect={(v) => setA("profil", v)}
        />
        <label className="flex items-center gap-2.5 self-end pb-2.5">
          <input
            type="checkbox"
            checked={a.marie}
            onChange={(e) => setA("marie", e.target.checked)}
            className="h-4 w-4 accent-cervus-gold"
          />
          <span className="text-sm text-cervus-bronze/80">Marié(e) / pacsé(e)</span>
        </label>
      </div>

      {/* Courbe d'évolution de la valeur du contrat */}
      <AvCourbeChart courbe={result.courbe} />

      {/* Résultats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BigResult label="Capital final brut" value={formatEuro(result.capitalFinalBrut)} />
        <BigResult label="Capital net" value={formatEuro(result.capitalNet)} />
        <BigResult label="Capital net optimisé" value={formatEuro(result.capitalNetOptimise)} highlight />
      </div>

      {result.optimisationUtile && result.gainOptimisation > 0 && (
        <div className="rounded-3xl border border-cervus-gold/40 bg-cervus-gold/10 p-4 sm:p-6">
          <p className="font-cormorant text-2xl font-semibold text-cervus-bronze sm:text-3xl">
            Gain de l&apos;optimisation : + {formatEuro(result.gainOptimisation)}
          </p>
          <p className="mt-1 text-sm text-cervus-bronze/80">
            Nets au terme, par une gestion optimisée de la fiscalité des plus-values.
          </p>
        </div>
      )}

      {onRecord && (
        <KeepResultButton
          onKeep={keep}
          disabled={a.versementInitial <= 0 && a.versementMensuel <= 0}
          className="w-full sm:w-auto sm:self-end"
        />
      )}
    </div>
  );
}
