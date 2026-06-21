"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { computePerQuick, formatEuro, PROFIL_LABELS, type PerProfil } from "@/lib/per-quick";
import type { ClientIdentity, HypoValues } from "@/lib/presentation-bridge";
import { BigResult, HypoNumber, HypoPills, IdentityChip } from "./controls";

const PROFILS: PerProfil[] = ["prudent", "equilibre", "dynamique"];

/**
 * Vue présentation du PER rapide (Lot F). Identité en lecture seule (rapatriable via
 * Actualiser), hypothèses éditables en direct → recalcul instantané.
 */
export default function PerQuickPresentation({
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
      computePerQuick(
        {
          revenuImposable: identity.revenuImposable,
          parts: identity.parts,
          versementMensuel: hypo.versementMensuel,
          versementInitial: hypo.versementInitial,
          horizon: hypo.horizon,
          profil: hypo.profil,
        },
        // TMI partagée (Lot 2) : consommée, pas recalculée côté présentation.
        { tmi: identity.tmi }
      ),
    [identity, hypo]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Identité — lecture seule */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <IdentityChip label="Revenu imposable" value={formatEuro(identity.revenuImposable)} />
        <IdentityChip label="Parts fiscales" value={String(identity.parts)} />
        <IdentityChip label="TMI" value={`${result.tmi} %`} />
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
          onSelect={(p) => onHypo("profil", p)}
        />
      </div>

      {/* Résultats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BigResult label="Économie d'impôt / an" value={formatEuro(result.economieFiscale)} highlight />
        <BigResult label="Capital projeté" value={formatEuro(result.capitalFinal)} />
        <BigResult label="Total versé" value={formatEuro(result.totalVerse)} />
      </div>

      <div className="rounded-3xl border border-cervus-gold/25 bg-cervus-dark/40 p-4 sm:p-6">
        <p className="mb-4 text-sm text-cervus-bronze/70">
          Évolution du capital · profil {PROFIL_LABELS[hypo.profil].toLowerCase()} · {hypo.horizon} ans
        </p>
        <div className="h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.courbe} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="pqpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a07d62" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#a07d62" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#795D48" strokeOpacity={0.15} vertical={false} />
              <XAxis dataKey="annee" stroke="#a07d62" fontSize={13} tickLine={false} />
              <YAxis stroke="#a07d62" fontSize={13} tickLine={false} width={56} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
              <Tooltip
                formatter={(v) => formatEuro(Number(v))}
                labelFormatter={(l) => `Année ${l}`}
                contentStyle={{ background: "#0f0f0f", border: "1px solid #795D48", borderRadius: 12, color: "#a07d62" }}
              />
              <Area type="monotone" dataKey="capital" stroke="#795D48" strokeWidth={3} fill="url(#pqpFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
