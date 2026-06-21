"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  computePerQuick,
  formatEuro,
  PROFIL_LABELS,
  resolveTaux,
  TAUX_PAR_PROFIL,
  type PerProfil,
  type PerQuickInputs,
} from "@/lib/per-quick";
import TauxSlider from "./TauxSlider";

const PROFILS: PerProfil[] = ["prudent", "equilibre", "dynamique"];

interface PerQuickSimProps {
  /** Valeurs pré-remplies (mode connecté : priorité Découverte > Simulation). */
  prefill?: Partial<PerQuickInputs>;
  /** Présent = mode CONNECTÉ : code client en évidence (pas le nom). */
  client?: { personId: number; code: string | null };
  /** TMI partagée (Lot 2, mode connecté) : calculée une fois côté serveur, consommée ici. */
  fiscalTmi?: number;
}

const BASE: PerQuickInputs = {
  revenuImposable: 0,
  parts: 1,
  versementMensuel: 0,
  versementInitial: 0,
  horizon: 20,
  profil: "equilibre",
  taux: TAUX_PAR_PROFIL.equilibre,
};

/**
 * Simulateur PER « version conseiller » — RAPIDE (2-3 chiffres, résultat immédiat).
 * Composant client partagé par les 2 modes (autonome / connecté). Calcule en local
 * via `computePerQuick` (consommation seule de fiscal-engine). N'écrit JAMAIS dans
 * Pipedrive.
 */
export default function PerQuickSim({ prefill, client, fiscalTmi }: PerQuickSimProps) {
  const initial = useMemo<PerQuickInputs>(() => {
    const merged = { ...BASE, ...prefill };
    // Taux par défaut = celui du profil si non fourni par le prefill (Lot I).
    if (prefill?.taux == null) merged.taux = TAUX_PAR_PROFIL[merged.profil];
    return merged;
  }, [prefill]);
  const [inputs, setInputs] = useState<PerQuickInputs>(initial);
  useEffect(() => setInputs(initial), [initial]);

  // Mode connecté : consomme la TMI partagée (Lot 2) au lieu de la recalculer.
  const result = useMemo(
    () => computePerQuick(inputs, fiscalTmi != null ? { tmi: fiscalTmi } : undefined),
    [inputs, fiscalTmi]
  );

  function set<K extends keyof PerQuickInputs>(key: K, value: PerQuickInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }
  // Changer de profil ré-aligne le taux sur le défaut du profil (Lot I).
  function selectProfil(p: PerProfil) {
    setInputs((prev) => ({ ...prev, profil: p, taux: TAUX_PAR_PROFIL[p] }));
  }
  function setNum(key: keyof PerQuickInputs, raw: string) {
    const n = parseFloat(raw.replace(",", "."));
    set(key, (Number.isFinite(n) ? n : 0) as PerQuickInputs[typeof key]);
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
          Simulateur PER
        </h1>
      </header>

      {/* Saisie minimale */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Revenu net imposable (€/an)">
          <NumberInput value={inputs.revenuImposable} onChange={(v) => setNum("revenuImposable", v)} />
        </Field>
        <Field label="Parts fiscales">
          <NumberInput value={inputs.parts} step="0.25" onChange={(v) => setNum("parts", v)} />
        </Field>
        <Field label="Versement mensuel (€)">
          <NumberInput value={inputs.versementMensuel} onChange={(v) => setNum("versementMensuel", v)} />
        </Field>
        <Field label="Apport initial (€)">
          <NumberInput value={inputs.versementInitial} onChange={(v) => setNum("versementInitial", v)} />
        </Field>
        <Field label="Horizon (années)">
          <NumberInput value={inputs.horizon} onChange={(v) => setNum("horizon", v)} />
        </Field>
        <Field label="Profil de rendement">
          <div className="flex gap-2">
            {PROFILS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => selectProfil(p)}
                className={`flex-1 rounded-[50px] border px-3 py-2 text-xs font-medium transition-colors ${
                  inputs.profil === p
                    ? "border-cervus-gold bg-cervus-gold text-cervus-bronze"
                    : "border-cervus-gold/40 text-cervus-bronze/80 hover:bg-cervus-gold/10"
                }`}
              >
                {PROFIL_LABELS[p]}
              </button>
            ))}
          </div>
        </Field>
        <div className="sm:col-span-2">
          <TauxSlider value={resolveTaux(inputs.profil, inputs.taux)} onChange={(t) => set("taux", t)} />
        </div>
      </section>

      {/* Résultat live */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="TMI" value={`${result.tmi} %`} />
        <Stat label="Économie d'impôt / an" value={formatEuro(result.economieFiscale)} highlight />
        <Stat label="Capital projeté" value={formatEuro(result.capitalFinal)} />
      </section>

      <section className="rounded-2xl border border-cervus-gold/20 bg-cervus-dark/40 p-3">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.courbe} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="perFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a07d62" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#a07d62" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="annee" stroke="#a07d62" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#a07d62"
                fontSize={11}
                tickLine={false}
                width={48}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
              />
              <Tooltip
                formatter={(v) => formatEuro(Number(v))}
                labelFormatter={(l) => `Année ${l}`}
                contentStyle={{ background: "#0f0f0f", border: "1px solid #795D48", borderRadius: 12, color: "#a07d62" }}
              />
              <Area type="monotone" dataKey="capital" stroke="#795D48" strokeWidth={2} fill="url(#perFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <p className="text-[11px] leading-relaxed text-cervus-bronze/40">
        Estimation pédagogique indicative, non contractuelle. Calcul à titre
        d&apos;ordre de grandeur — aucune donnée n&apos;est enregistrée depuis cet outil.
      </p>
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

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-cervus-gold/50 bg-cervus-gold/10"
          : "border-cervus-gold/20 bg-cervus-dark/40"
      }`}
    >
      <p className="text-xs text-cervus-bronze/60">{label}</p>
      <p className="mt-1 font-cormorant text-2xl font-semibold text-cervus-bronze">{value}</p>
    </div>
  );
}
