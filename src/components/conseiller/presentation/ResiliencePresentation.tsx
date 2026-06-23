"use client";

import { useMemo, useState } from "react";
import {
  buildContribution,
  buildHistorical,
  buildLumpSum,
  type ResilienceInputs,
} from "@/lib/resilience-marches";
import {
  FONDS_EUROS_ANNOTATION,
  SERIE_META,
  SOURCE_MENTION,
  type SerieKey,
} from "@/lib/market-data";
import { formatEuro } from "@/lib/per-quick";
import type { ClientIdentity, HypoValues } from "@/lib/presentation-bridge";
import { resilienceDraft, type SimRecordDraft } from "@/lib/sim-history";
import KeepResultButton from "../KeepResultButton";
import MarchesChart from "../MarchesChart";
import SeriesToggles from "../SeriesToggles";
import { HypoNumber } from "./controls";

function toggleKey(set: Set<SerieKey>, key: SerieKey): Set<SerieKey> {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

/**
 * Vue présentation de « Résilience des marchés » (Lot 10). G1/G2 historiques figés,
 * G3 piloté par les hypothèses (versements). N'utilise PAS `ClientIdentity`
 * (« Actualiser » sans effet — tout est hypothèse, comme pyramide/impôt).
 */
export default function ResiliencePresentation({
  hypo,
  onHypo,
  onRecord,
}: {
  identity: ClientIdentity;
  hypo: HypoValues;
  onHypo: <K extends keyof HypoValues>(key: K, value: HypoValues[K]) => void;
  onRecord?: (draft: SimRecordDraft) => boolean;
}) {
  const r = hypo.resilience;

  const [base100, setBase100] = useState(true);
  const [withProfils, setWithProfils] = useState(false);
  const hist = useMemo(() => buildHistorical({ base100, includeProfils: withProfils }), [base100, withProfils]);
  const [visG1, setVisG1] = useState<Set<SerieKey>>(
    new Set<SerieKey>(["msci", "sp500", "livretA", "fondsEuros", "prudent", "equilibre", "dynamique"])
  );

  const lump = useMemo(() => buildLumpSum({ amount: 10000, years: 20 }), []);
  const [visG2, setVisG2] = useState<Set<SerieKey>>(new Set<SerieKey>(lump.series));

  const contrib = useMemo(
    () =>
      buildContribution({
        versementInitial: r.versementInitial,
        versementMensuel: r.versementMensuel,
        horizonAnnees: r.horizon,
      }),
    [r]
  );
  const [visG3, setVisG3] = useState<Set<SerieKey>>(new Set<SerieKey>(contrib.series));

  function setRes<K extends keyof ResilienceInputs>(key: K, value: ResilienceInputs[K]) {
    onHypo("resilience", { ...r, [key]: value });
  }

  function keep(): boolean {
    if (!onRecord) return false;
    return (
      onRecord(
        resilienceDraft(
          { versementInitial: r.versementInitial, versementMensuel: r.versementMensuel, horizon: r.horizon },
          { totalVerse: contrib.totalVerse, finals: contrib.finals }
        )
      ) !== false
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* G1 */}
      <section className="flex flex-col gap-3">
        <h2 className="font-cormorant text-2xl text-cervus-bronze">Depuis 1970 — comparaison réelle</h2>
        <div className="flex flex-wrap gap-2">
          <Pill active={base100} onClick={() => setBase100(true)}>Base 100</Pill>
          <Pill active={!base100} onClick={() => setBase100(false)}>Valeur nominale</Pill>
          <Pill active={withProfils} onClick={() => setWithProfils((v) => !v)}>Profils théoriques</Pill>
        </div>
        <MarchesChart rows={hist.rows} series={hist.series} visibleKeys={visG1} valueKind="indice" />
        <SeriesToggles series={hist.series} visibleKeys={visG1} onToggle={(k) => setVisG1((s) => toggleKey(s, k))} />
        <p className="text-[11px] text-cervus-bronze/45">{FONDS_EUROS_ANNOTATION}</p>
        <p className="text-[10px] leading-relaxed text-cervus-bronze/35">{SOURCE_MENTION}</p>
      </section>

      {/* G2 */}
      <section className="flex flex-col gap-3">
        <h2 className="font-cormorant text-2xl text-cervus-bronze">Si j&apos;avais investi 10 000 € il y a 20 ans</h2>
        <p className="text-xs text-cervus-bronze/50">
          {formatEuro(lump.amount)} placés en {lump.startYear}, suivis jusqu&apos;en {lump.endYear}.
        </p>
        <MarchesChart rows={lump.rows} series={lump.series} visibleKeys={visG2} valueKind="euro" />
        <Finals series={lump.series} finals={lump.finals} visible={visG2} />
        <SeriesToggles series={lump.series} visibleKeys={visG2} onToggle={(k) => setVisG2((s) => toggleKey(s, k))} />
        <p className="text-[10px] leading-relaxed text-cervus-bronze/35">{SOURCE_MENTION}</p>
      </section>

      {/* G3 */}
      <section className="flex flex-col gap-3">
        <h2 className="font-cormorant text-2xl text-cervus-bronze">Projection de vos versements</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <HypoNumber label="Versement initial" value={r.versementInitial} onChange={(v) => setRes("versementInitial", v)} suffix="€" />
          <HypoNumber label="Versement mensuel" value={r.versementMensuel} onChange={(v) => setRes("versementMensuel", v)} suffix="€" />
          <HypoNumber label="Horizon (années)" value={r.horizon} onChange={(v) => setRes("horizon", v)} />
        </div>
        <MarchesChart rows={contrib.rows} series={contrib.series} visibleKeys={visG3} valueKind="euro" xSuffix="ans" />
        <p className="text-xs text-cervus-bronze/55">
          Total versé sur {Math.round(r.horizon)} ans : {formatEuro(contrib.totalVerse)}.
        </p>
        <Finals series={contrib.series} finals={contrib.finals} visible={visG3} />
        <SeriesToggles series={contrib.series} visibleKeys={visG3} onToggle={(k) => setVisG3((s) => toggleKey(s, k))} />
        {onRecord && (
          <KeepResultButton
            onKeep={keep}
            disabled={r.versementInitial <= 0 && r.versementMensuel <= 0}
            className="w-full sm:w-auto sm:self-end"
          />
        )}
        <p className="text-[10px] leading-relaxed text-cervus-bronze/35">{SOURCE_MENTION}</p>
      </section>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[50px] border px-4 py-2 text-xs font-medium transition-colors ${
        active ? "border-cervus-gold bg-cervus-gold text-cervus-bronze" : "border-cervus-gold/40 text-cervus-bronze/80 hover:bg-cervus-gold/10"
      }`}
    >
      {children}
    </button>
  );
}

function Finals({
  series,
  finals,
  visible,
}: {
  series: SerieKey[];
  finals: Partial<Record<SerieKey, number>>;
  visible: Set<SerieKey>;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {series
        .filter((k) => visible.has(k) && finals[k] != null)
        .map((k) => (
          <div key={k} className="rounded-xl border border-cervus-gold/20 bg-cervus-dark/40 px-3 py-2">
            <p className="flex items-center gap-1.5 text-[11px] text-cervus-bronze/60">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: SERIE_META[k].color }} />
              {SERIE_META[k].label}
            </p>
            <p className="mt-0.5 font-cormorant text-lg text-cervus-bronze">{formatEuro(finals[k]!)}</p>
          </div>
        ))}
    </div>
  );
}
