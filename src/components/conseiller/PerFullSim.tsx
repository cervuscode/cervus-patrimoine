"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatEuro,
  PROFIL_LABELS,
  resolveTaux,
  TAUX_PAR_PROFIL,
  type PerProfil,
} from "@/lib/per-quick";
import {
  computePerSortie,
  defaultTrancheSortie,
  ligneConversionLaPlusProche,
  type AgeConversion,
  type PerSortieInputs,
} from "@/lib/per-sortie";
import TauxSlider from "./TauxSlider";
import { useRdvClient } from "./RdvClientProvider";

const PROFILS: PerProfil[] = ["prudent", "equilibre", "dynamique"];
const TRANCHES = [0, 11, 30, 41, 45];

const BASE: PerSortieInputs = {
  revenuImposable: 0,
  parts: 1,
  anneeNaissance: 1980,
  versementMensuel: 0,
  versementInitial: 0,
  horizon: 20,
  profil: "equilibre",
  taux: TAUX_PAR_PROFIL.equilibre,
  trancheSortie: 30,
  ageConversion: 67,
};

interface PerFullSimProps {
  prefill?: Partial<PerSortieInputs>;
  /** Mode CONNECTÉ : code client en évidence (pas le nom). */
  client?: { personId: number; code: string | null };
}

/**
 * Simulateur PER COMPLET (Lot 5) — choix profil/durée/fiscalité de sortie, 3 sorties
 * (capital intégral, fractionnement 20 ans, rente viagère). Pur outil de calcul :
 * consomme `per-sortie.ts` (lui-même consommation seule de fiscal-engine).
 * AUCUNE écriture Pipedrive. La présentation client passe par l'espace dédié.
 */
export default function PerFullSim({ prefill, client }: PerFullSimProps) {
  const initial = useMemo<PerSortieInputs>(() => {
    const merged = { ...BASE, ...prefill };
    // Défaut tranche de sortie = TMI courante si non fournie par le prefill.
    if (prefill?.trancheSortie == null) {
      merged.trancheSortie = defaultTrancheSortie(merged.revenuImposable, merged.parts);
    }
    // Taux par défaut = celui du profil si non fourni par le prefill (Lot I).
    if (prefill?.taux == null) merged.taux = TAUX_PAR_PROFIL[merged.profil];
    return merged;
  }, [prefill]);

  const [inputs, setInputs] = useState<PerSortieInputs>(initial);
  useEffect(() => setInputs(initial), [initial]);

  const result = useMemo(() => computePerSortie(inputs), [inputs]);
  const ligne = ligneConversionLaPlusProche(inputs.anneeNaissance);
  const conv64Indispo = ligne.taux64 == null;

  // Lot 3 : capture auto dans l'historique de session (mode connecté uniquement),
  // debouncée pour ne mémoriser que la variante stabilisée (pas chaque frappe).
  const { recordSim } = useRdvClient();
  useEffect(() => {
    if (!client) return;
    if (inputs.versementMensuel <= 0 && inputs.versementInitial <= 0) return;
    const t = setTimeout(() => {
      recordSim({
        simId: "per-full",
        label: "PER complet",
        inputs: {
          versementMensuel: inputs.versementMensuel,
          versementInitial: inputs.versementInitial,
          horizon: inputs.horizon,
          taux: result.taux,
          profil: inputs.profil,
          trancheSortie: inputs.trancheSortie,
          ageConversion: inputs.ageConversion,
        },
        result: {
          capitalFinal: result.capitalFinal,
          sortie1Net: result.sortie1.capitalNet,
          sortie2RetraitMensuel: result.sortie2.equivalentMensuel,
          sortie2Net: result.sortie2.capitalNet,
          sortie3Disponible: result.sortie3.disponible,
          sortie3RenteMensuelle: result.sortie3.renteMensuelle,
          sortie3RenteNetteMensuelle: Math.round(result.sortie3.renteNetteAnnuelle / 12),
        },
      });
    }, 700);
    return () => clearTimeout(t);
  }, [client, inputs, result, recordSim]);

  function set<K extends keyof PerSortieInputs>(key: K, value: PerSortieInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }
  // Changer de profil ré-aligne le taux sur le défaut du profil (Lot I).
  function selectProfil(p: PerProfil) {
    setInputs((prev) => ({ ...prev, profil: p, taux: TAUX_PAR_PROFIL[p] }));
  }
  function setNum(key: keyof PerSortieInputs, raw: string) {
    const n = parseFloat(raw.replace(",", "."));
    set(key, (Number.isFinite(n) ? n : 0) as PerSortieInputs[typeof key]);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 pb-28 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-2">
        {client ? (
          <span className="inline-flex w-fit items-center rounded-[50px] border border-cervus-gold/40 bg-cervus-gold/10 px-4 py-1 font-mono text-lg font-semibold tracking-wider text-cervus-bronze">
            {client.code ?? "Sans code"}
          </span>
        ) : (
          <span className="text-xs uppercase tracking-[0.2em] text-cervus-gold-light">Mode autonome</span>
        )}
        <h1 className="font-cormorant text-3xl font-semibold text-cervus-bronze sm:text-4xl">
          Simulateur PER complet
        </h1>
      </header>

      {/* Identité / situation */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Revenu net imposable (€/an)">
          <NumberInput value={inputs.revenuImposable} onChange={(v) => setNum("revenuImposable", v)} />
        </Field>
        <Field label="Parts fiscales">
          <NumberInput value={inputs.parts} step="0.25" onChange={(v) => setNum("parts", v)} />
        </Field>
        <Field label="Année de naissance">
          <NumberInput value={inputs.anneeNaissance} onChange={(v) => setNum("anneeNaissance", v)} />
        </Field>
      </section>

      {/* Hypothèses d'accumulation */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <Pills
            options={PROFILS.map((p) => ({ value: p, label: PROFIL_LABELS[p] }))}
            active={inputs.profil}
            onSelect={(p) => selectProfil(p as PerProfil)}
          />
        </Field>
        <div className="sm:col-span-2">
          <TauxSlider value={resolveTaux(inputs.profil, inputs.taux)} onChange={(t) => set("taux", t)} />
        </div>
      </section>

      {/* Hypothèses de sortie */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tranche marginale à la sortie">
          <Pills
            options={TRANCHES.map((t) => ({ value: String(t), label: `${t} %` }))}
            active={String(inputs.trancheSortie)}
            onSelect={(t) => set("trancheSortie", Number(t))}
          />
        </Field>
        <Field label="Âge de conversion en rente">
          <Pills
            options={[
              { value: "64", label: "64 ans", disabled: conv64Indispo },
              { value: "67", label: "67 ans" },
            ]}
            active={String(inputs.ageConversion)}
            onSelect={(a) => set("ageConversion", Number(a) as AgeConversion)}
          />
        </Field>
      </section>

      {/* Accumulation */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Capital projeté" value={formatEuro(result.capitalFinal)} highlight />
        <Stat label="Versements cumulés" value={formatEuro(result.versementsCumules)} />
        <Stat label="Plus-value" value={formatEuro(result.plusValue)} />
      </section>

      {/* Sortie 1 */}
      <Block title="Sortie 1 — Capital intégral">
        <Line label="Impôt sur versements (tranche)" value={formatEuro(result.sortie1.impotVersements)} />
        <Line label="Impôt plus-value (PFU 30 %)" value={formatEuro(result.sortie1.impotPlusValue)} />
        <Line label="Imposition totale" value={formatEuro(result.sortie1.impotTotal)} />
        <Line label="Capital net perçu" value={formatEuro(result.sortie1.capitalNet)} strong />
      </Block>

      {/* Sortie 2 */}
      <Block title="Sortie 2 — Fractionnement sur 20 ans (non-sorti à 2 %)">
        <Line
          label="Retrait annuel"
          value={`${formatEuro(result.sortie2.retraitAnnuel)} (~${formatEuro(result.sortie2.equivalentMensuel)}/mois)`}
        />
        <Line label="Intérêts fonds euro cumulés" value={formatEuro(result.sortie2.interetsFondsEuro)} />
        <Line label="Capital brut total (20 ans)" value={formatEuro(result.sortie2.capitalBrutTotal)} />
        <Line label="Imposition totale" value={formatEuro(result.sortie2.impotTotal)} />
        <Line label="Capital net total perçu" value={formatEuro(result.sortie2.capitalNet)} strong />
        <details className="mt-2 text-xs text-cervus-bronze/60">
          <summary className="cursor-pointer hover:text-cervus-bronze">Détail année par année</summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-cervus-bronze/50">
                <tr>
                  <th className="py-1 pr-3">Année</th>
                  <th className="py-1 pr-3">Retrait</th>
                  <th className="py-1 pr-3">Intérêts 2 %</th>
                  <th className="py-1">Solde fin</th>
                </tr>
              </thead>
              <tbody>
                {result.sortie2.flux.map((f) => (
                  <tr key={f.annee} className="border-t border-cervus-gold/10">
                    <td className="py-1 pr-3">{f.annee}</td>
                    <td className="py-1 pr-3">{formatEuro(f.retrait)}</td>
                    <td className="py-1 pr-3">{formatEuro(f.interet)}</td>
                    <td className="py-1">{formatEuro(f.soldeFin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Block>

      {/* Sortie 3 */}
      <Block title="Sortie 3 — Rente viagère (comparaison)">
        {result.sortie3.disponible ? (
          <>
            <Line
              label="Rente annuelle"
              value={`${formatEuro(result.sortie3.renteAnnuelle)} (~${formatEuro(result.sortie3.renteMensuelle)}/mois)`}
            />
            <Line
              label={`Fraction imposable (${Math.round(result.sortie3.fractionImposable * 100)} %)`}
              value={formatEuro(result.sortie3.montantImposable)}
            />
            <Line label="Impôt sur le revenu (barème)" value={formatEuro(result.sortie3.impotIR)} />
            <Line label="Prélèvements sociaux (17,2 %)" value={formatEuro(result.sortie3.impotPS)} />
            <Line label="Rente nette annuelle" value={formatEuro(result.sortie3.renteNetteAnnuelle)} strong />
            <p className="mt-2 text-[11px] leading-relaxed text-cervus-bronze/50">
              Taux de conversion {(result.sortie3.tauxApplique! * 100).toFixed(2)} % — valeur de
              référence par tranche (génération {result.sortie3.ligne.naissance}), conversion à{" "}
              {inputs.ageConversion} ans. Estimation basée sur le contrat Abeille Retraite Plurielle
              (taux garantis, éd. octobre 2024) — taux variables selon l&apos;assureur réellement
              choisi.
            </p>
          </>
        ) : (
          <p className="text-sm text-cervus-bronze/60">
            Conversion à 64 ans non proposée pour la génération {result.sortie3.ligne.naissance}.
            Sélectionnez 67 ans.
          </p>
        )}
      </Block>

      <p className="text-[11px] leading-relaxed text-cervus-bronze/40">
        Estimation pédagogique indicative, non contractuelle. Aucune donnée n&apos;est enregistrée
        depuis cet outil.
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

function Pills({
  options,
  active,
  onSelect,
}: {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  active: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={o.disabled}
          onClick={() => onSelect(o.value)}
          className={`flex-1 rounded-[50px] border px-3 py-2 text-xs font-medium transition-colors ${
            active === o.value
              ? "border-cervus-gold bg-cervus-gold text-cervus-bronze"
              : "border-cervus-gold/40 text-cervus-bronze/80 hover:bg-cervus-gold/10"
          } disabled:cursor-not-allowed disabled:opacity-30`}
        >
          {o.label}
        </button>
      ))}
    </div>
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

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-cervus-gold/25 bg-cervus-dark/40 p-4">
      <h2 className="mb-3 font-cormorant text-xl text-cervus-bronze">{title}</h2>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-cervus-bronze/60">{label}</span>
      <span
        className={
          strong ? "font-cormorant text-lg font-semibold text-cervus-bronze" : "text-cervus-bronze"
        }
      >
        {value}
      </span>
    </div>
  );
}
