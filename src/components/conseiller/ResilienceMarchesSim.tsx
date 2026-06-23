"use client";

import { useMemo, useState } from "react";
import {
  buildContribution,
  buildHistorical,
  buildLumpSum,
  DEFAULT_RESILIENCE_INPUTS,
  type ResilienceInputs,
} from "@/lib/resilience-marches";
import {
  FONDS_EUROS_ANNOTATION,
  SERIE_META,
  SOURCE_MENTION,
  type SerieKey,
} from "@/lib/market-data";
import { formatEuro } from "@/lib/per-quick";
import { resilienceDraft } from "@/lib/sim-history";
import { useRdvClient } from "./RdvClientProvider";
import KeepResultButton from "./KeepResultButton";
import MarchesChart from "./MarchesChart";
import SeriesToggles from "./SeriesToggles";

interface ResilienceMarchesSimProps {
  /** Valeurs pré-remplies du graphique 3 (mode connecté). */
  prefill?: Partial<ResilienceInputs>;
  /** Présent = mode CONNECTÉ : code client en évidence + capture note. */
  client?: { personId: number; code: string | null };
}

function toggleKey(set: Set<SerieKey>, key: SerieKey): Set<SerieKey> {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

/**
 * « Résilience des marchés » version conseiller (Lot 10). 3 graphiques pédagogiques
 * (historique réel, capital investi il y a 20 ans, projection de versements) au-
 * dessus de `market-data.ts` + `resilience-marches.ts` (consommation seule, aucun
 * moteur fiscal). Composant client partagé par les 2 modes.
 */
export default function ResilienceMarchesSim({ prefill, client }: ResilienceMarchesSimProps) {
  const initial = useMemo<ResilienceInputs>(
    () => ({ ...DEFAULT_RESILIENCE_INPUTS, ...prefill }),
    [prefill]
  );

  // Graphique 1 — historique
  const [base100, setBase100] = useState(true);
  const [withProfils, setWithProfils] = useState(false);
  const hist = useMemo(
    () => buildHistorical({ base100, includeProfils: withProfils }),
    [base100, withProfils]
  );
  const [visG1, setVisG1] = useState<Set<SerieKey>>(
    new Set<SerieKey>(["msci", "sp500", "livretA", "fondsEuros", "prudent", "equilibre", "dynamique"])
  );

  // Graphique 2 — capital unique investi il y a 20 ans
  const lump = useMemo(() => buildLumpSum({ amount: 10000, years: 20 }), []);
  const [visG2, setVisG2] = useState<Set<SerieKey>>(new Set<SerieKey>(lump.series));

  // Graphique 3 — projection de versements
  const [g3, setG3] = useState<ResilienceInputs>(initial);
  const contrib = useMemo(
    () =>
      buildContribution({
        versementInitial: g3.versementInitial,
        versementMensuel: g3.versementMensuel,
        horizonAnnees: g3.horizon,
      }),
    [g3]
  );
  const [visG3, setVisG3] = useState<Set<SerieKey>>(new Set<SerieKey>(contrib.series));

  const { recordSim } = useRdvClient();
  function keep() {
    recordSim(
      resilienceDraft(
        { versementInitial: g3.versementInitial, versementMensuel: g3.versementMensuel, horizon: g3.horizon },
        { totalVerse: contrib.totalVerse, finals: contrib.finals }
      )
    );
    return true;
  }

  function setG3Num(key: keyof ResilienceInputs, raw: string) {
    const n = parseFloat(raw.replace(",", "."));
    setG3((p) => ({ ...p, [key]: Number.isFinite(n) ? n : 0 }));
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-2">
        {client ? (
          <span className="inline-flex w-fit items-center rounded-[50px] border border-cervus-gold/40 bg-cervus-gold/10 px-4 py-1 font-mono text-lg font-semibold tracking-wider text-cervus-bronze">
            {client.code ?? "Sans code"}
          </span>
        ) : (
          <span className="text-xs uppercase tracking-[0.2em] text-cervus-gold-light">Mode autonome</span>
        )}
        <h1 className="font-cormorant text-3xl font-semibold text-cervus-bronze sm:text-4xl">
          Résilience des marchés
        </h1>
        <p className="text-xs text-cervus-bronze/50">
          Comparez les grands placements sur le long terme : ce que les marchés ont vraiment fait,
          et ce qu&apos;un investissement aurait donné.
        </p>
      </header>

      {/* ── Graphique 1 — historique réel depuis 1970 ── */}
      <section className="flex flex-col gap-3">
        <h2 className="font-cormorant text-2xl text-cervus-bronze">Depuis 1970 — comparaison réelle</h2>
        <div className="flex flex-wrap gap-2">
          <Pill active={base100} onClick={() => setBase100(true)}>Base 100</Pill>
          <Pill active={!base100} onClick={() => setBase100(false)}>Valeur nominale</Pill>
          <Pill active={withProfils} onClick={() => setWithProfils((v) => !v)}>
            Profils théoriques
          </Pill>
        </div>
        <MarchesChart rows={hist.rows} series={hist.series} visibleKeys={visG1} valueKind="indice" />
        <SeriesToggles series={hist.series} visibleKeys={visG1} onToggle={(k) => setVisG1((s) => toggleKey(s, k))} />
        <p className="text-[11px] text-cervus-bronze/45">{FONDS_EUROS_ANNOTATION}</p>
        <SourceMention />
      </section>

      {/* ── Graphique 2 — capital unique investi il y a 20 ans ── */}
      <section className="flex flex-col gap-3">
        <h2 className="font-cormorant text-2xl text-cervus-bronze">
          Si j&apos;avais investi 10 000 € il y a 20 ans
        </h2>
        <p className="text-xs text-cervus-bronze/50">
          Capital unique de {formatEuro(lump.amount)} placé en {lump.startYear}, suivi jusqu&apos;en{" "}
          {lump.endYear} (rendements réels année par année).
        </p>
        <MarchesChart rows={lump.rows} series={lump.series} visibleKeys={visG2} valueKind="euro" />
        <Finals series={lump.series} finals={lump.finals} visible={visG2} />
        <SeriesToggles series={lump.series} visibleKeys={visG2} onToggle={(k) => setVisG2((s) => toggleKey(s, k))} />
        <SourceMention />
      </section>

      {/* ── Graphique 3 — projection de versements ── */}
      <section className="flex flex-col gap-3">
        <h2 className="font-cormorant text-2xl text-cervus-bronze">Projection de vos versements</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Versement initial (€)">
            <NumberInput value={g3.versementInitial} onChange={(v) => setG3Num("versementInitial", v)} />
          </Field>
          <Field label="Versement mensuel (€)">
            <NumberInput value={g3.versementMensuel} onChange={(v) => setG3Num("versementMensuel", v)} />
          </Field>
          <Field label="Horizon (années)">
            <NumberInput value={g3.horizon} onChange={(v) => setG3Num("horizon", v)} />
          </Field>
        </div>
        <MarchesChart rows={contrib.rows} series={contrib.series} visibleKeys={visG3} valueKind="euro" xSuffix="ans" />
        <p className="text-xs text-cervus-bronze/55">
          Total versé sur {Math.round(g3.horizon)} ans : {formatEuro(contrib.totalVerse)}. Taux fixes :
          profils 3/4/5 %, Livret A 1,5 %, fonds euros 2,5 %.
        </p>
        <Finals series={contrib.series} finals={contrib.finals} visible={visG3} />
        <SeriesToggles series={contrib.series} visibleKeys={visG3} onToggle={(k) => setVisG3((s) => toggleKey(s, k))} />
        {client && (
          <KeepResultButton
            onKeep={keep}
            disabled={g3.versementInitial <= 0 && g3.versementMensuel <= 0}
            className="w-full sm:w-auto sm:self-end"
          />
        )}
        <SourceMention />
      </section>

      <p className="text-[11px] leading-relaxed text-cervus-bronze/40">
        Projections pédagogiques indicatives, non contractuelles. Les performances passées ne
        préjugent pas des performances futures. Aucune donnée n&apos;est enregistrée depuis cet outil.
      </p>
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

function SourceMention() {
  return <p className="text-[10px] leading-relaxed text-cervus-bronze/35">{SOURCE_MENTION}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-cervus-bronze/70">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step="10"
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => e.target.select()}
      className="rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2.5 text-base text-cervus-bronze focus:border-cervus-gold focus:outline-none"
    />
  );
}
