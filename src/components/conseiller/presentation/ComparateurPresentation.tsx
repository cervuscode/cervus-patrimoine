"use client";

import { useMemo } from "react";
import {
  computeComparateur,
  verdictComparateur,
  type ComparateurInputs,
} from "@/lib/comparateur-av-per";
import { PROFIL_LABELS, formatEuro, type PerProfil } from "@/lib/per-quick";
import type { ClientIdentity, ComparateurHypo, HypoValues } from "@/lib/presentation-bridge";
import { comparateurDraft, type SimRecordDraft } from "@/lib/sim-history";
import KeepResultButton from "../KeepResultButton";
import ComparateurStacks from "../ComparateurStacks";
import { BigResult, HypoNumber, HypoPills, IdentityChip } from "./controls";

const TRANCHES = [0, 11, 30, 41, 45];

/**
 * Vue présentation du Comparateur AV / PER (Lot 7). Comme les vues PER : revenu/parts/TMI
 * viennent de `ClientIdentity` (lecture seule, rafraîchissables via Actualiser) ; les
 * hypothèses (effort net, horizon, profil, tranche de sortie, marié) sont éditables.
 */
export default function ComparateurPresentation({
  identity,
  hypo,
  onHypo,
  onRecord,
}: {
  identity: ClientIdentity;
  hypo: HypoValues;
  onHypo: <K extends keyof HypoValues>(key: K, value: HypoValues[K]) => void;
  onRecord?: (draft: SimRecordDraft) => boolean;
}) {
  const c = hypo.comparateur;

  const inputs: ComparateurInputs = useMemo(
    () => ({
      revenuImposable: identity.revenuImposable,
      parts: identity.parts,
      marie: c.marie,
      effortNetMensuel: c.effortNetMensuel,
      effortNetInitial: c.effortNetInitial,
      horizon: c.horizon,
      profil: c.profil,
      trancheSortie: c.trancheSortie,
    }),
    [identity.revenuImposable, identity.parts, c]
  );

  // TMI partagée injectée (Lot 2) : calculée une fois côté fiche.
  const result = useMemo(() => computeComparateur(inputs, { tmi: identity.tmi }), [inputs, identity.tmi]);
  const verdict = verdictComparateur(result);

  function setC<K extends keyof ComparateurHypo>(key: K, value: ComparateurHypo[K]) {
    onHypo("comparateur", { ...c, [key]: value });
  }

  function keep(): boolean {
    if (!onRecord) return false;
    return (
      onRecord(
        comparateurDraft(
          {
            effortNetMensuel: c.effortNetMensuel,
            effortNetInitial: c.effortNetInitial,
            horizon: c.horizon,
            profil: c.profil,
            trancheSortie: c.trancheSortie,
            marie: c.marie,
          },
          result
        )
      ) !== false
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Identité (de la fiche, rafraîchissable) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <IdentityChip label="Revenu imposable" value={formatEuro(identity.revenuImposable)} />
        <IdentityChip label="Parts" value={String(identity.parts)} />
        <IdentityChip label="TMI" value={`${identity.tmi} %`} />
      </div>

      {/* Hypothèses éditables */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HypoNumber
          label="Effort net mensuel"
          value={c.effortNetMensuel}
          onChange={(v) => setC("effortNetMensuel", v)}
          suffix="€"
        />
        <HypoNumber
          label="Apport initial net"
          value={c.effortNetInitial}
          onChange={(v) => setC("effortNetInitial", v)}
          suffix="€"
        />
        <HypoNumber label="Horizon" value={c.horizon} onChange={(v) => setC("horizon", v)} suffix="ans" />
        <HypoPills<PerProfil>
          label="Profil"
          options={(Object.keys(PROFIL_LABELS) as PerProfil[]).map((p) => ({ value: p, label: PROFIL_LABELS[p] }))}
          active={c.profil}
          onSelect={(v) => setC("profil", v)}
        />
        <HypoPills<string>
          label="Tranche à la sortie / retraite"
          options={TRANCHES.map((t) => ({ value: String(t), label: `${t} %` }))}
          active={String(c.trancheSortie)}
          onSelect={(v) => setC("trancheSortie", Number(v))}
        />
        <label className="flex items-center gap-2.5 self-end pb-2.5">
          <input
            type="checkbox"
            checked={c.marie}
            onChange={(e) => setC("marie", e.target.checked)}
            className="h-4 w-4 accent-cervus-gold"
          />
          <span className="text-sm text-cervus-bronze/80">Marié(e) / pacsé(e)</span>
        </label>
      </div>

      {/* Mécanisme effort net → versement PER majoré */}
      <p className="text-sm text-cervus-bronze/70">
        Effort net {formatEuro(c.effortNetMensuel)}/mois → versement PER{" "}
        <b className="text-cervus-bronze">{formatEuro(result.perMensuel)}/mois</b>
        {result.economieMensuelle > 0 && (
          <> (dont {formatEuro(result.economieMensuelle)}/mois d&apos;économie d&apos;impôt)</>
        )}{" "}
        · assurance-vie {formatEuro(c.effortNetMensuel)}/mois.
      </p>

      {/* Visuel comparatif */}
      <ComparateurStacks result={result} />

      {/* Résultats nets + verdict */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BigResult label="PER — capital net en sortie" value={formatEuro(result.per.capitalNet)} highlight={result.gagnant !== "av"} />
        <BigResult label="Assurance-vie — capital net" value={formatEuro(result.av.capitalNetSans)} highlight={result.gagnant !== "per"} />
      </div>

      <div className="rounded-3xl border border-cervus-gold/40 bg-cervus-gold/10 p-4 sm:p-6">
        <p className="font-cormorant text-2xl font-semibold text-cervus-bronze sm:text-3xl">{verdict.titre}</p>
        <p className="mt-1 text-sm text-cervus-bronze/80">{verdict.message}</p>
      </div>

      {onRecord && (
        <KeepResultButton
          onKeep={keep}
          disabled={c.effortNetMensuel <= 0 && c.effortNetInitial <= 0}
          className="w-full sm:w-auto sm:self-end"
        />
      )}
    </div>
  );
}
