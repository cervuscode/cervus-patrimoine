"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeAvSim,
  DEFAULT_AV_INPUTS,
  AV_PROFIL_OPTIONS,
  AV_DUREE_MIN,
  AV_DUREE_MAX,
  type AvSimInputs,
} from "@/lib/av-sim";
import type { AVProfil } from "@/lib/av-engine";
import { formatEuro } from "@/lib/per-quick";
import { avDraft } from "@/lib/sim-history";
import { useRdvClient } from "./RdvClientProvider";
import KeepResultButton from "./KeepResultButton";
import AvCourbeChart from "./AvCourbeChart";

interface AvSimProps {
  /** Valeurs pré-remplies (mode connecté : priorité Découverte > Simulation). */
  prefill?: Partial<AvSimInputs>;
  /** Présent = mode CONNECTÉ : code client en évidence (pas le nom). */
  client?: { personId: number; code: string | null };
}

/**
 * Simulateur Assurance-vie STANDALONE « version conseiller ». Consomme `av-engine`
 * (via `av-sim.ts`) en lecture seule pour montrer l'évolution d'un contrat AV et le
 * capital net projeté. N'écrit JAMAIS dans Pipedrive. Vocabulaire pudique : « Capital
 * net optimisé » (jamais « purge » / « rachat » / « avec-sans Cervus »).
 */
export default function AvSim({ prefill, client }: AvSimProps) {
  const initial = useMemo<AvSimInputs>(() => ({ ...DEFAULT_AV_INPUTS, ...prefill }), [prefill]);
  const [inputs, setInputs] = useState<AvSimInputs>(initial);
  useEffect(() => setInputs(initial), [initial]);

  const result = useMemo(() => computeAvSim(inputs), [inputs]);

  const { recordSim } = useRdvClient();
  function keep() {
    recordSim(avDraft(inputs, result));
    return true;
  }

  function set<K extends keyof AvSimInputs>(key: K, value: AvSimInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }
  function setNum(key: keyof AvSimInputs, raw: string) {
    const n = parseFloat(raw.replace(",", "."));
    set(key, (Number.isFinite(n) ? n : 0) as AvSimInputs[typeof key]);
  }

  const aucunVersement = inputs.versementInitial <= 0 && inputs.versementMensuel <= 0;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
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
          Simulateur Assurance-vie
        </h1>
        <p className="text-xs text-cervus-bronze/50">
          Évolution d&apos;un contrat d&apos;assurance-vie et capital net projeté au terme.
        </p>
      </header>

      {/* Saisie */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Versement initial (€)">
          <NumberInput value={inputs.versementInitial} onChange={(v) => setNum("versementInitial", v)} />
        </Field>
        <Field label="Versement mensuel (€/mois)">
          <NumberInput value={inputs.versementMensuel} onChange={(v) => setNum("versementMensuel", v)} />
        </Field>
        <Field label={`Durée (années, ${AV_DUREE_MIN}–${AV_DUREE_MAX})`}>
          <NumberInput value={inputs.dureeAnnees} onChange={(v) => setNum("dureeAnnees", v)} />
        </Field>
        <Field label="Profil (rendement)">
          <Select
            value={inputs.profil}
            onChange={(v) => set("profil", v as AVProfil)}
            options={AV_PROFIL_OPTIONS.map((p) => ({
              value: p.value,
              label: `${p.label} (${p.taux} %)`,
            }))}
          />
        </Field>
        <label className="flex items-center gap-2.5 self-end pb-2.5 sm:col-span-2">
          <input
            type="checkbox"
            checked={inputs.marie}
            onChange={(e) => set("marie", e.target.checked)}
            className="h-4 w-4 accent-cervus-gold"
          />
          <span className="text-sm text-cervus-bronze/80">
            Marié(e) / pacsé(e) (abattement 9 200 €)
          </span>
        </label>
      </section>

      {/* Courbe d'évolution de la valeur du contrat */}
      <AvCourbeChart courbe={result.courbe} />

      {/* Résultats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard
          label="Capital final brut"
          hint="avant fiscalité de sortie"
          value={formatEuro(result.capitalFinalBrut)}
        />
        <ResultCard label="Capital net" hint="après PS + impôt" value={formatEuro(result.capitalNet)} />
        <ResultCard
          label="Capital net optimisé"
          hint="avec accompagnement Cervus Patrimoine"
          value={formatEuro(result.capitalNetOptimise)}
          highlight
        />
      </section>

      {result.optimisationUtile && result.gainOptimisation > 0 && (
        <p className="rounded-2xl border border-cervus-gold/40 bg-cervus-gold/10 p-4 text-sm text-cervus-bronze/80">
          Gain de l&apos;optimisation :{" "}
          <b className="text-cervus-bronze">+ {formatEuro(result.gainOptimisation)}</b> nets au terme,
          par une gestion optimisée de la fiscalité des plus-values.
        </p>
      )}

      <p className="text-sm text-cervus-bronze/60">
        Total versé sur {inputs.dureeAnnees} ans :{" "}
        <b className="text-cervus-bronze">{formatEuro(result.totalVerse)}</b>.
      </p>

      {client && (
        <KeepResultButton
          onKeep={keep}
          disabled={aucunVersement}
          className="w-full sm:w-auto sm:self-end"
        />
      )}

      <p className="text-[11px] leading-relaxed text-cervus-bronze/40">
        Simulation pédagogique indicative, non contractuelle. Rendement piloté par le profil ;
        capital net après prélèvements sociaux et impôt (régime de sortie selon l&apos;antériorité du
        contrat, barème 2026). Aucune donnée n&apos;est enregistrée depuis cet outil.
      </p>
    </div>
  );
}

function ResultCard({
  label,
  hint,
  value,
  highlight,
}: {
  label: string;
  hint: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-cervus-gold/60 bg-cervus-gold/10" : "border-cervus-gold/25 bg-cervus-dark/40"
      }`}
    >
      <p className="text-sm text-cervus-bronze/60">{label}</p>
      <p className="mt-1.5 font-cormorant text-2xl font-semibold text-cervus-bronze sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-cervus-bronze/45">{hint}</p>
    </div>
  );
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
