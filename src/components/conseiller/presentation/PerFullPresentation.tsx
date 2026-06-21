"use client";

import { useMemo } from "react";
import {
  formatEuro,
  PROFIL_LABELS,
  resolveTaux,
  TAUX_PAR_PROFIL,
  type PerProfil,
} from "@/lib/per-quick";
import {
  computePerSortie,
  ligneConversionLaPlusProche,
  type AgeConversion,
} from "@/lib/per-sortie";
import type { ClientIdentity, HypoValues } from "@/lib/presentation-bridge";
import TauxSlider from "../TauxSlider";
import { HypoNumber, HypoPills, IdentityChip } from "./controls";

const PROFILS: PerProfil[] = ["prudent", "equilibre", "dynamique"];
const TRANCHES = [0, 11, 30, 41, 45];

/**
 * Vue présentation du PER complet (Lot F) — 3 sorties. Identité lecture seule,
 * hypothèses (dont tranche de sortie + âge de conversion) éditables en direct.
 */
export default function PerFullPresentation({
  identity,
  hypo,
  onHypo,
}: {
  identity: ClientIdentity;
  hypo: HypoValues;
  onHypo: <K extends keyof HypoValues>(key: K, value: HypoValues[K]) => void;
}) {
  const result = useMemo(
    () =>
      computePerSortie({
        revenuImposable: identity.revenuImposable,
        parts: identity.parts,
        anneeNaissance: identity.anneeNaissance,
        versementMensuel: hypo.versementMensuel,
        versementInitial: hypo.versementInitial,
        horizon: hypo.horizon,
        profil: hypo.profil,
        taux: hypo.taux,
        trancheSortie: hypo.trancheSortie,
        ageConversion: hypo.ageConversion,
      }),
    [identity, hypo]
  );
  const conv64Indispo = ligneConversionLaPlusProche(identity.anneeNaissance).taux64 == null;

  return (
    <div className="flex flex-col gap-6">
      {/* Identité — lecture seule */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <IdentityChip label="Revenu imposable" value={formatEuro(identity.revenuImposable)} />
        <IdentityChip label="Parts fiscales" value={String(identity.parts)} />
        <IdentityChip label="Naissance" value={String(identity.anneeNaissance)} />
        <IdentityChip label="Capital projeté" value={formatEuro(result.capitalFinal)} />
      </div>

      {/* Hypothèses — éditables en direct */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HypoNumber label="Versement mensuel" value={hypo.versementMensuel} onChange={(v) => onHypo("versementMensuel", v)} suffix="€" />
        <HypoNumber label="Apport initial" value={hypo.versementInitial} onChange={(v) => onHypo("versementInitial", v)} suffix="€" />
        <HypoNumber label="Horizon" value={hypo.horizon} onChange={(v) => onHypo("horizon", v)} suffix="ans" />
        <HypoPills
          label="Profil de rendement"
          options={PROFILS.map((p) => ({ value: p, label: PROFIL_LABELS[p] }))}
          active={hypo.profil}
          onSelect={(p) => {
            onHypo("profil", p);
            onHypo("taux", TAUX_PAR_PROFIL[p]); // ré-aligne le taux sur le profil
          }}
        />
        <TauxSlider value={resolveTaux(hypo.profil, hypo.taux)} onChange={(t) => onHypo("taux", t)} />
        <HypoPills
          label="Tranche à la sortie"
          options={TRANCHES.map((t) => ({ value: String(t), label: `${t} %` }))}
          active={String(hypo.trancheSortie)}
          onSelect={(t) => onHypo("trancheSortie", Number(t))}
        />
        <HypoPills
          label="Âge de conversion"
          options={[
            { value: "64", label: "64 ans", disabled: conv64Indispo },
            { value: "67", label: "67 ans" },
          ]}
          active={String(hypo.ageConversion)}
          onSelect={(a) => onHypo("ageConversion", Number(a) as AgeConversion)}
        />
      </div>

      {/* Sortie 1 */}
      <Block title="Capital intégral">
        <Line label="Imposition totale" value={formatEuro(result.sortie1.impotTotal)} />
        <Line label="Capital net perçu" value={formatEuro(result.sortie1.capitalNet)} strong />
      </Block>

      {/* Sortie 2 */}
      <Block title="Fractionnement sur 20 ans (non-sorti à 2 %)">
        <Line
          label="Retrait annuel"
          value={`${formatEuro(result.sortie2.retraitAnnuel)} (~${formatEuro(result.sortie2.equivalentMensuel)}/mois)`}
        />
        <Line label="Capital net total perçu" value={formatEuro(result.sortie2.capitalNet)} strong />
      </Block>

      {/* Sortie 3 */}
      <Block title="Rente viagère">
        {result.sortie3.disponible ? (
          <>
            <Line
              label="Rente annuelle"
              value={`${formatEuro(result.sortie3.renteAnnuelle)} (~${formatEuro(result.sortie3.renteMensuelle)}/mois)`}
            />
            <Line label="Rente nette annuelle" value={formatEuro(result.sortie3.renteNetteAnnuelle)} strong />
            <p className="mt-2 text-[11px] leading-relaxed text-cervus-bronze/50">
              Taux {(result.sortie3.tauxApplique! * 100).toFixed(2)} % (réf. génération{" "}
              {result.sortie3.ligne.naissance}, conversion à {hypo.ageConversion} ans). Estimation
              basée sur le contrat Abeille Retraite Plurielle (taux garantis, éd. octobre 2024) —
              taux variables selon l&apos;assureur réellement choisi.
            </p>
          </>
        ) : (
          <p className="text-sm text-cervus-bronze/60">
            Conversion à 64 ans non proposée pour cette génération. Sélectionnez 67 ans.
          </p>
        )}
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-cervus-gold/25 bg-cervus-dark/40 p-5 sm:p-6">
      <h3 className="mb-3 font-cormorant text-2xl text-cervus-bronze">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-cervus-bronze/60">{label}</span>
      <span
        className={
          strong
            ? "font-cormorant text-2xl font-semibold text-cervus-bronze"
            : "text-base text-cervus-bronze"
        }
      >
        {value}
      </span>
    </div>
  );
}
