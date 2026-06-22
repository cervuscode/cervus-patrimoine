"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeComparateur,
  verdictComparateur,
  DEFAULT_COMPARATEUR_INPUTS,
  type ComparateurInputs,
} from "@/lib/comparateur-av-per";
import { PROFIL_LABELS, formatEuro, type PerProfil } from "@/lib/per-quick";
import { comparateurDraft } from "@/lib/sim-history";
import { useRdvClient } from "./RdvClientProvider";
import KeepResultButton from "./KeepResultButton";
import ComparateurStacks from "./ComparateurStacks";

interface ComparateurAvPerProps {
  /** Valeurs pré-remplies (mode connecté : priorité Découverte > Simulation). */
  prefill?: Partial<ComparateurInputs>;
  /** Présent = mode CONNECTÉ : code client en évidence (pas le nom). */
  client?: { personId: number; code: string | null };
}

const TRANCHES = [0, 11, 30, 41, 45];

/**
 * Comparateur Assurance-vie vs PER « version conseiller » (Lot 7). Convention
 * EFFORT NET ÉGAL : un seul champ d'effort mensuel (+ apport initial), versement PER
 * automatiquement majoré (effort / (1 − TMI)), AV au montant de l'effort. Compare
 * les capitaux nets après fiscalité de sortie ; consomme `per-sortie` + `av-engine`
 * en lecture seule. N'écrit JAMAIS dans Pipedrive.
 */
export default function ComparateurAvPer({ prefill, client }: ComparateurAvPerProps) {
  const initial = useMemo<ComparateurInputs>(
    () => ({ ...DEFAULT_COMPARATEUR_INPUTS, ...prefill }),
    [prefill]
  );
  const [inputs, setInputs] = useState<ComparateurInputs>(initial);
  useEffect(() => setInputs(initial), [initial]);

  // TMI calculée localement à partir du revenu/parts courants (identique à l'état
  // partagé quand les valeurs viennent de la fiche). Pas d'injection : éditer le
  // revenu met à jour la TMI en direct, en autonome comme en connecté.
  const result = useMemo(() => computeComparateur(inputs), [inputs]);
  const verdict = verdictComparateur(result);

  const { recordSim, contributionsHR } = useRdvClient();
  function keep() {
    recordSim(
      comparateurDraft(
        {
          effortNetMensuel: inputs.effortNetMensuel,
          effortNetInitial: inputs.effortNetInitial,
          horizon: inputs.horizon,
          profil: inputs.profil,
          trancheSortie: inputs.trancheSortie,
          marie: inputs.marie,
        },
        result
      )
    );
    return true;
  }

  function set<K extends keyof ComparateurInputs>(key: K, value: ComparateurInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }
  function setNum(key: keyof ComparateurInputs, raw: string) {
    const n = parseFloat(raw.replace(",", "."));
    set(key, (Number.isFinite(n) ? n : 0) as ComparateurInputs[typeof key]);
  }

  const effortNul = inputs.effortNetMensuel <= 0 && inputs.effortNetInitial <= 0;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 pb-28 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-2">
        {client ? (
          <span className="inline-flex w-fit items-center rounded-[50px] border border-cervus-gold/40 bg-cervus-gold/10 px-4 py-1 font-mono text-lg font-semibold tracking-wider text-cervus-bronze">
            {client.code ?? "Sans code"}
          </span>
        ) : (
          <span className="text-xs uppercase tracking-[0.2em] text-cervus-gold-light">
            Mode autonome
          </span>
        )}
        <h1 className="font-cormorant text-3xl font-semibold text-cervus-bronze sm:text-4xl">
          Comparateur Assurance-vie / PER
        </h1>
        <p className="text-xs text-cervus-bronze/50">
          À effort net identique, quel produit projette le meilleur capital net selon votre
          tranche d&apos;imposition.
        </p>
      </header>

      {/* Saisie */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Effort net mensuel (€/mois)">
          <NumberInput value={inputs.effortNetMensuel} onChange={(v) => setNum("effortNetMensuel", v)} />
        </Field>
        <Field label="Apport initial net (€)">
          <NumberInput value={inputs.effortNetInitial} onChange={(v) => setNum("effortNetInitial", v)} />
        </Field>
        <Field label="Revenu net imposable (€/an)">
          <NumberInput value={inputs.revenuImposable} onChange={(v) => setNum("revenuImposable", v)} />
        </Field>
        <Field label="Parts fiscales">
          <NumberInput value={inputs.parts} onChange={(v) => setNum("parts", v)} step="0.5" />
        </Field>
        <Field label="Horizon (années)">
          <NumberInput value={inputs.horizon} onChange={(v) => setNum("horizon", v)} />
        </Field>
        <Field label="Profil (rendement identique AV & PER)">
          <Select
            value={inputs.profil}
            onChange={(v) => set("profil", v as PerProfil)}
            options={(Object.keys(PROFIL_LABELS) as PerProfil[]).map((p) => ({
              value: p,
              label: `${PROFIL_LABELS[p]} (${rendement(p)} %)`,
            }))}
          />
        </Field>
        <Field label="Tranche à la sortie / retraite (%)">
          <Select
            value={String(inputs.trancheSortie)}
            onChange={(v) => set("trancheSortie", Number(v))}
            options={TRANCHES.map((t) => ({ value: String(t), label: `${t} %` }))}
          />
        </Field>
        <label className="flex items-center gap-2.5 self-end pb-2.5">
          <input
            type="checkbox"
            checked={inputs.marie}
            onChange={(e) => set("marie", e.target.checked)}
            className="h-4 w-4 accent-cervus-gold"
          />
          <span className="text-sm text-cervus-bronze/80">Marié(e) / pacsé(e) (abattement AV 9 200 €)</span>
        </label>
      </section>

      {/* Mécanisme effort net → versements */}
      <section className="rounded-2xl border border-cervus-gold/20 bg-cervus-dark/40 p-4 text-sm text-cervus-bronze/80">
        <p>
          Effort net <b>{formatEuro(inputs.effortNetMensuel)}/mois</b> → versement PER{" "}
          <b className="text-cervus-bronze">{formatEuro(result.perMensuel)}/mois</b>{" "}
          {result.economieMensuelle > 0 && (
            <>
              (votre effort complété par <b>{formatEuro(result.economieMensuelle)}/mois</b> d&apos;économie
              d&apos;impôt à la TMI {result.tmi} %)
            </>
          )}{" "}
          · versement assurance-vie <b className="text-cervus-bronze">{formatEuro(inputs.effortNetMensuel)}/mois</b>.
        </p>
        {client && contributionsHR.concerne && (
          <p className="mt-2 text-[11px] leading-relaxed text-cervus-gold-light/80">
            Hors CEHR/CDHR — voir le panneau pour l&apos;estimation complète.
          </p>
        )}
      </section>

      {/* Visuel comparatif */}
      <ComparateurStacks result={result} />

      {/* Verdict */}
      <section
        className={`rounded-2xl border p-4 ${
          result.gagnant === "egal"
            ? "border-cervus-gold/40 bg-cervus-gold/10"
            : "border-cervus-gold/50 bg-cervus-gold/10"
        }`}
      >
        <p className="font-cormorant text-2xl font-semibold text-cervus-bronze">{verdict.titre}</p>
        <p className="mt-1 text-sm text-cervus-bronze/80">{verdict.message}</p>
      </section>

      {client && (
        <KeepResultButton
          onKeep={keep}
          disabled={effortNul}
          className="w-full sm:w-auto sm:self-end"
        />
      )}

      <p className="text-[11px] leading-relaxed text-cervus-bronze/40">
        Comparaison pédagogique indicative, non contractuelle. Hypothèse « effort net égal » :
        l&apos;avantage fiscal du PER est intégré dès le versement (effort majoré de l&apos;économie
        d&apos;impôt). Rendement identique des deux côtés, capital net après fiscalité de sortie
        (barème 2026). TMI effective (intègre le plafonnement du quotient familial) — peut
        différer de la tranche de l&apos;avis d&apos;imposition. Aucune donnée n&apos;est
        enregistrée depuis cet outil.
      </p>
    </div>
  );
}

function rendement(p: PerProfil): number {
  return p === "prudent" ? 3 : p === "dynamique" ? 5 : 4;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-cervus-bronze/70">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2.5 text-base text-cervus-bronze focus:border-cervus-gold focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-cervus-dark">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function NumberInput({
  value,
  onChange,
  step,
}: {
  value: number;
  onChange: (v: string) => void;
  step?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step ?? "1"}
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => e.target.select()}
      className="rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2.5 text-base text-cervus-bronze focus:border-cervus-gold focus:outline-none"
    />
  );
}
