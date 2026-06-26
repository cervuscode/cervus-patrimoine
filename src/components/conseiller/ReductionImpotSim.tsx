"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeReduction,
  DEFAULT_REDUCTION_INPUTS,
  TRANCHES_AFFICHAGE,
  type ReductionInputs,
  type ReductionResult,
} from "@/lib/reduction-impot";
import { GARDE_OPTIONS, formatPourcent, type GardeRegime } from "@/lib/impot-sim";
import { STATUT_MARITAL_OPTIONS, mapStatutToParts } from "@/lib/fiscal-state";
import { formatEuro } from "@/lib/per-quick";
import { reductionDraft } from "@/lib/sim-history";
import { useRdvClient } from "./RdvClientProvider";
import KeepResultButton from "./KeepResultButton";
import ReductionStacks from "./ReductionStacks";

interface ReductionImpotSimProps {
  /** Valeurs pré-remplies (mode connecté : priorité Découverte > Simulation). */
  prefill?: Partial<ReductionInputs>;
  /** Présent = mode CONNECTÉ : code client en évidence (pas le nom). */
  client?: { personId: number; code: string | null };
}

/**
 * Illustration du mécanisme de réduction d'impôt « version conseiller » (Lot 6).
 * Visuel avant/après par tranche au-dessus de `fiscal-engine.ts` (consommation
 * seule, ZÉRO ajout au moteur). Composant client partagé par les 2 modes.
 *
 * Particularité (comme le Lot 4) : ICI tout est « hypothèse ». Aucun champ en
 * lecture seule — revenu, situation familiale et versement sont librement
 * modifiables. En connecté, simplement PRÉ-REMPLIS depuis la fiche puis éditables.
 * N'écrit JAMAIS dans Pipedrive.
 */
export default function ReductionImpotSim({ prefill, client }: ReductionImpotSimProps) {
  const initial = useMemo<ReductionInputs>(
    () => ({ ...DEFAULT_REDUCTION_INPUTS, ...prefill }),
    [prefill]
  );
  const [inputs, setInputs] = useState<ReductionInputs>(initial);
  useEffect(() => setInputs(initial), [initial]);

  const result = useMemo(() => computeReduction(inputs), [inputs]);

  const isCouple = useMemo(() => {
    const s = mapStatutToParts(inputs.statut);
    return s === "marie" || s === "pacse";
  }, [inputs.statut]);
  const gardePertinente = !isCouple && Math.round(inputs.nbEnfants) > 0;

  // Lot 3 : capture MANUELLE dans l'historique de session (mode connecté).
  const { recordSim } = useRdvClient();
  function keep() {
    recordSim(
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
    );
    return true;
  }

  function set<K extends keyof ReductionInputs>(key: K, value: ReductionInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }
  function setNum(key: keyof ReductionInputs, raw: string) {
    const n = parseFloat(raw.replace(",", "."));
    set(key, (Number.isFinite(n) ? n : 0) as ReductionInputs[typeof key]);
  }

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
          Illustration de la réduction d&apos;impôt
        </h1>
        <p className="text-xs text-cervus-bronze/50">
          Visualisez l&apos;effet d&apos;un versement PER déductible sur les tranches du
          barème. Tous les champs sont modifiables.
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
        <Field label="Versement PER à illustrer (€/an)">
          <NumberInput value={inputs.versementPer} onChange={(v) => setNum("versementPer", v)} />
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

      {/* Le visuel avant/après */}
      <ReductionStacks result={result} />

      {/* Tableau de détail par tranche (complément des barres) */}
      <ReductionTable result={result} />

      {/* Résultats chiffrés (en complément du visuel) */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Impôt sans versement" value={formatEuro(result.avant.impotNet)} />
        <Stat label="Impôt avec versement" value={formatEuro(result.apres.impotNet)} />
        <Stat label="Économie d'impôt" value={`${formatEuro(result.economie)} / an`} highlight />
      </section>

      {result.tmiChange && (
        <p className="rounded-2xl border border-cervus-gold/30 bg-cervus-gold/10 px-4 py-3 text-sm text-cervus-bronze">
          Le versement fait passer la tranche marginale de{" "}
          <b>{result.avant.tmi} %</b> à <b>{result.apres.tmi} %</b>.
        </p>
      )}

      <p className="text-xs text-cervus-bronze/50">
        Taux moyen : {formatPourcent(result.avant.tauxMoyen)} →{" "}
        {formatPourcent(result.apres.tauxMoyen)}.
      </p>

      {/* Capture manuelle dans la note de synthèse (mode connecté uniquement). */}
      {client && (
        <KeepResultButton
          onKeep={keep}
          disabled={inputs.revenuImposable <= 0 || inputs.versementPer <= 0}
          className="w-full sm:w-auto sm:self-end"
        />
      )}

      <p className="text-[11px] leading-relaxed text-cervus-bronze/40">
        Le découpage par tranche est une illustration pédagogique ; les montants
        d&apos;impôt et la TMI sont calculés par le moteur fiscal (barème IR 2026).
        Estimation indicative, non contractuelle — aucune donnée n&apos;est enregistrée
        depuis cet outil.
      </p>
    </div>
  );
}

/** Couleur de texte lisible selon le fond de la pastille (charte : clair → texte sombre). */
function chipText(color: string): string {
  return color === "#F2EDE8" || color === "#a07d62" ? "#3a2c22" : "#F2EDE8";
}

/**
 * Tableau de détail par tranche (style SyntheseFiscale) — sous les barres. Par tranche
 * occupée : TMI, revenu dans cette tranche, impôt généré, impact du versement PER
 * (delta en vert si la déduction réduit l'impôt de la tranche). Découpage illustratif
 * (mêmes chiffres que les barres) ; l'impôt net autoritatif reste celui des KPI.
 */
function ReductionTable({ result }: { result: ReductionResult }) {
  const rows = TRANCHES_AFFICHAGE.map((t) => {
    const av = result.slicesAvant.find((s) => s.taux === t.taux)?.montant ?? 0;
    const ap = result.slicesApres.find((s) => s.taux === t.taux)?.montant ?? 0;
    return {
      taux: t.taux,
      label: t.label,
      color: t.color,
      revenuAvant: av,
      impotAvant: av * t.taux,
      impact: (ap - av) * t.taux, // ≤ 0 si la tranche est réduite par le versement
    };
  }).filter((r) => r.revenuAvant > 0 || r.impact !== 0);

  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-cervus-gold/20 bg-cervus-dark/40">
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-2 border-b border-cervus-gold/15 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-cervus-bronze/50 sm:px-4">
        <span>Tranche</span>
        <span className="text-right">Revenu</span>
        <span className="text-right">Impôt généré</span>
        <span className="text-right">Impact PER</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.taux}
          className="grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-x-2 px-3 py-2 text-sm text-cervus-bronze/90 sm:px-4 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-cervus-gold/10"
        >
          <span
            className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: r.color, color: chipText(r.color) }}
          >
            {r.label}
          </span>
          <span className="text-right tabular-nums">{formatEuro(r.revenuAvant)}</span>
          <span className="text-right tabular-nums">{formatEuro(r.impotAvant)}</span>
          <span
            className={`text-right tabular-nums ${
              r.impact < -0.5 ? "font-semibold text-emerald-400" : "text-cervus-bronze/40"
            }`}
          >
            {r.impact < -0.5 ? `−${formatEuro(Math.abs(r.impact))}` : "—"}
          </span>
        </div>
      ))}
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
      <p className="mt-1 font-cormorant text-2xl font-semibold text-cervus-bronze">{value}</p>
    </div>
  );
}
