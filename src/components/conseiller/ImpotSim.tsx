"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeImpot,
  DEFAULT_IMPOT_INPUTS,
  formatPourcent,
  GARDE_OPTIONS,
  type GardeRegime,
  type ImpotInputs,
} from "@/lib/impot-sim";
import { STATUT_MARITAL_OPTIONS, mapStatutToParts } from "@/lib/fiscal-state";
import { formatEuro } from "@/lib/per-quick";
import { impotDraft } from "@/lib/sim-history";
import { useRdvClient } from "./RdvClientProvider";
import KeepResultButton from "./KeepResultButton";

interface ImpotSimProps {
  /** Valeurs pré-remplies (mode connecté : priorité Découverte > Simulation). */
  prefill?: Partial<ImpotInputs>;
  /** Présent = mode CONNECTÉ : code client en évidence (pas le nom). */
  client?: { personId: number; code: string | null };
}

/**
 * Simulateur d'impôt « version conseiller » (Lot 4). Interface au-dessus de
 * `fiscal-engine.ts` (consommation seule, ZÉRO ajout au moteur). Composant client
 * partagé par les 2 modes (autonome / connecté).
 *
 * Particularité : ICI tout est « hypothèse ». Aucun champ en lecture seule — y
 * compris le revenu et la situation familiale restent librement modifiables pour
 * tester des scénarios. En mode connecté, les champs sont seulement PRÉ-REMPLIS
 * depuis la fiche puis éditables. N'écrit JAMAIS dans Pipedrive.
 */
export default function ImpotSim({ prefill, client }: ImpotSimProps) {
  const initial = useMemo<ImpotInputs>(
    () => ({ ...DEFAULT_IMPOT_INPUTS, ...prefill }),
    [prefill]
  );
  const [inputs, setInputs] = useState<ImpotInputs>(initial);
  useEffect(() => setInputs(initial), [initial]);

  const result = useMemo(() => computeImpot(inputs), [inputs]);

  const isCouple = useMemo(() => {
    const s = mapStatutToParts(inputs.statut);
    return s === "marie" || s === "pacse";
  }, [inputs.statut]);
  const gardePertinente = !isCouple && Math.round(inputs.nbEnfants) > 0;

  // Lot 3 : capture MANUELLE dans l'historique de session (mode connecté).
  const { recordSim } = useRdvClient();
  function keep() {
    recordSim(
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
    );
    return true;
  }

  function set<K extends keyof ImpotInputs>(key: K, value: ImpotInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }
  function setNum(key: keyof ImpotInputs, raw: string) {
    const n = parseFloat(raw.replace(",", "."));
    set(key, (Number.isFinite(n) ? n : 0) as ImpotInputs[typeof key]);
  }

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
          Simulateur d&apos;impôt
        </h1>
        <p className="text-xs text-cervus-bronze/50">
          Tous les champs sont modifiables — testez librement des scénarios (revenu,
          situation familiale…).
        </p>
      </header>

      {/* Saisie — tout est hypothèse */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Statut marital">
          <Select
            value={inputs.statut}
            onChange={(v) => set("statut", v)}
            options={STATUT_MARITAL_OPTIONS.map((o) => ({ value: o.label, label: o.label }))}
          />
        </Field>
        <Field label="Nombre d'enfants">
          <NumberInput value={inputs.nbEnfants} onChange={(v) => setNum("nbEnfants", v)} />
        </Field>
        {gardePertinente && (
          <Field label="Régime de garde">
            <Select
              value={inputs.garde}
              onChange={(v) => set("garde", v as GardeRegime)}
              options={GARDE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </Field>
        )}
        <Field label="Revenu net imposable (€/an)">
          <NumberInput value={inputs.revenuImposable} onChange={(v) => setNum("revenuImposable", v)} />
        </Field>
        <label className="flex items-center gap-2.5 self-end pb-2.5 sm:col-span-2">
          <input
            type="checkbox"
            checked={inputs.demiPartHandicap}
            onChange={(e) => set("demiPartHandicap", e.target.checked)}
            className="h-4 w-4 accent-cervus-gold"
          />
          <span className="text-sm text-cervus-bronze/80">
            Invalidité ou handicap (demi-part supplémentaire)
          </span>
        </label>
      </section>

      {/* Résultat live */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Stat label="Impôt net sur le revenu" value={formatEuro(result.impotNet)} highlight />
        <Stat label="Tranche marginale (TMI)" value={`${result.tmi} %`} />
      </section>

      {/* Détail pédagogique */}
      <section className="rounded-2xl border border-cervus-gold/20 bg-cervus-dark/40 p-4 text-sm text-cervus-bronze/80">
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Detail label="Parts fiscales retenues" value={formatNombre(result.partsTotal)} />
          <Detail label="Taux moyen d'imposition" value={formatPourcent(result.tauxMoyen)} />
        </dl>
        {result.plafonnementActif && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-[50px] border border-cervus-gold/40 bg-cervus-gold/10 px-3 py-1 text-xs text-cervus-bronze">
            Plafonnement du quotient familial actif
          </p>
        )}
      </section>

      {/* Capture manuelle dans la note de synthèse (mode connecté uniquement). */}
      {client && (
        <KeepResultButton
          onKeep={keep}
          disabled={inputs.revenuImposable <= 0}
          className="w-full sm:w-auto sm:self-end"
        />
      )}

      <p className="text-[11px] leading-relaxed text-cervus-bronze/40">
        Estimation pédagogique indicative, non contractuelle. Calcul à titre
        d&apos;ordre de grandeur (barème IR 2026) — aucune donnée n&apos;est
        enregistrée depuis cet outil.
      </p>
    </div>
  );
}

function formatNombre(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
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

function NumberInput({ value, onChange }: { value: number; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step="1"
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => e.target.select()}
      className="rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2.5 text-base text-cervus-bronze focus:border-cervus-gold focus:outline-none"
    />
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-cervus-gold/50 bg-cervus-gold/10" : "border-cervus-gold/20 bg-cervus-dark/40"
      }`}
    >
      <p className="text-xs text-cervus-bronze/60">{label}</p>
      <p className="mt-1 font-cormorant text-3xl font-semibold text-cervus-bronze">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-cervus-gold/10 pb-1.5">
      <dt className="text-cervus-bronze/60">{label}</dt>
      <dd className="font-medium text-cervus-bronze">{value}</dd>
    </div>
  );
}
