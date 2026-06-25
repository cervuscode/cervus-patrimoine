"use client";

import { useState } from "react";
import type {
  BlocAvailability,
  CompositionPayload,
  SimInstance,
  PerQuickParams,
  PerFullParams,
  AvParams,
  ComparateurParams,
  ReductionParams,
} from "@/lib/compte-rendu";
import type { PerProfil } from "@/lib/per-quick";
import type { AVProfil } from "@/lib/av-engine";

/**
 * Interface de composition du compte-rendu (Lot 11, livrable 4). Mobile-first.
 * Sélection des blocs fixes (désactivés si données absentes) + ajout multi-instances
 * de simulateurs (params éditables par instance) → POST /api/rdv/generate-pdf →
 * téléchargement direct. N'envoie QUE des paramètres (le serveur recalcule tout).
 */

export interface ComposerDefaults {
  perVersementMensuel: number;
  perVersementInitial: number;
  horizon: number;
  profil: PerProfil;
  trancheSortie: number;
  avVersementMensuel: number;
  avVersementInitial: number;
  avDuree: number;
  avProfil: AVProfil;
  marie: boolean;
  effortNetMensuel: number;
  reductionRevenu: number;
  reductionStatut: string;
  reductionNbEnfants: number;
  reductionVersement: number;
}

type SimType = SimInstance["type"];
type Instance = { id: string } & SimInstance;

const PER_PROFILS: { value: PerProfil; label: string }[] = [
  { value: "prudent", label: "Prudent (3 %)" },
  { value: "equilibre", label: "Équilibré (4 %)" },
  { value: "dynamique", label: "Dynamique (5 %)" },
];
const AV_PROFILS: { value: AVProfil; label: string }[] = [
  { value: "prudent", label: "Prudent (3 %)" },
  { value: "equilibre", label: "Équilibré (4 %)" },
  { value: "responsable", label: "Responsable (4 %)" },
  { value: "dynamique", label: "Dynamique (5 %)" },
];
const TRANCHES: number[] = [0, 11, 30, 41, 45];
const STATUTS = ["Célibataire", "Marié(e)", "Pacsé(e)", "Divorcé(e)", "Veuf(ve)"];

const SIM_LABELS: Record<SimType, string> = {
  "per-quick": "PER rapide",
  "per-full": "PER complet",
  av: "Assurance-vie",
  comparateur: "Comparateur AV / PER",
  reduction: "Réduction d'impôt",
};

let counter = 0;
const uid = () => `s${++counter}`;

export default function CompteRenduComposer({
  personId,
  code,
  available,
  defaults,
}: {
  personId: number;
  code: string | null;
  available: BlocAvailability;
  defaults: ComposerDefaults;
}) {
  const [blocs, setBlocs] = useState({
    syntheseFiscale: available.syntheseFiscale,
    plafondsPer: available.plafondsPer,
    contributionsHR: available.contributionsHR,
    pyramide: available.pyramide,
  });
  const [sims, setSims] = useState<Instance[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function defaultParams(type: SimType): SimInstance {
    switch (type) {
      case "per-quick":
        return {
          type,
          params: {
            versementMensuel: defaults.perVersementMensuel,
            versementInitial: defaults.perVersementInitial,
            horizon: defaults.horizon,
            profil: defaults.profil,
          } as PerQuickParams,
        };
      case "per-full":
        return {
          type,
          params: {
            versementMensuel: defaults.perVersementMensuel,
            versementInitial: defaults.perVersementInitial,
            horizon: defaults.horizon,
            profil: defaults.profil,
            trancheSortie: defaults.trancheSortie,
            ageConversion: 67,
          } as PerFullParams,
        };
      case "av":
        return {
          type,
          params: {
            versementInitial: defaults.avVersementInitial,
            versementMensuel: defaults.avVersementMensuel,
            dureeAnnees: defaults.avDuree,
            profil: defaults.avProfil,
            marie: defaults.marie,
          } as AvParams,
        };
      case "comparateur":
        return {
          type,
          params: {
            effortNetMensuel: defaults.effortNetMensuel,
            effortNetInitial: 0,
            horizon: defaults.horizon,
            profil: defaults.profil,
            trancheSortie: defaults.trancheSortie,
          } as ComparateurParams,
        };
      case "reduction":
        return {
          type,
          params: {
            revenuImposable: defaults.reductionRevenu,
            statut: defaults.reductionStatut,
            nbEnfants: defaults.reductionNbEnfants,
            garde: "classique",
            demiPartHandicap: false,
            versementPer: defaults.reductionVersement,
          } as ReductionParams,
        };
    }
  }

  const addSim = (type: SimType) => setSims((p) => [...p, { id: uid(), ...defaultParams(type) }]);
  const removeSim = (id: string) => setSims((p) => p.filter((s) => s.id !== id));
  const patchSim = (id: string, patch: Record<string, unknown>) =>
    setSims((p) =>
      p.map((s) => (s.id === id ? ({ ...s, params: { ...s.params, ...patch } } as Instance) : s))
    );

  const nothingSelected =
    !blocs.syntheseFiscale &&
    !blocs.plafondsPer &&
    !blocs.contributionsHR &&
    !blocs.pyramide &&
    sims.length === 0;

  async function generate() {
    setBusy(true);
    setErr(null);
    try {
      const composition: CompositionPayload = {
        blocs,
        simulations: sims.map(({ type, params }) => ({ type, params }) as SimInstance),
      };
      const res = await fetch("/api/rdv/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, composition }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compte-rendu-${code ?? personId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Échec de la génération");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 pb-28 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-cormorant text-2xl text-cervus-bronze sm:text-3xl">
          Générer le compte-rendu
        </h1>
        {code && (
          <span className="text-sm text-cervus-bronze/60">
            Client <span className="font-semibold text-cervus-bronze">{code}</span>
          </span>
        )}
      </header>

      {/* ── Blocs de synthèse ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-cervus-gold-light">
          Blocs de synthèse
        </h2>
        <div className="flex flex-col gap-2">
          <BlocCheck
            label="Synthèse fiscale"
            hint="Impôt net, TMI, taux moyen, répartition par tranche"
            checked={blocs.syntheseFiscale}
            available={available.syntheseFiscale}
            onChange={(v) => setBlocs((b) => ({ ...b, syntheseFiscale: v }))}
          />
          <BlocCheck
            label="Plafonds de versement PER"
            hint="Plafond salarié + TNS Madelin si applicable"
            checked={blocs.plafondsPer}
            available={available.plafondsPer}
            onChange={(v) => setBlocs((b) => ({ ...b, plafondsPer: v }))}
          />
          <BlocCheck
            label="Contributions hauts revenus (CEHR/CDHR)"
            hint="Affiché uniquement si le foyer est concerné"
            checked={blocs.contributionsHR}
            available={available.contributionsHR}
            onChange={(v) => setBlocs((b) => ({ ...b, contributionsHR: v }))}
          />
          <BlocCheck
            label="Pyramide de l'épargne"
            hint="Répartition réelle du patrimoine financier"
            checked={blocs.pyramide}
            available={available.pyramide}
            onChange={(v) => setBlocs((b) => ({ ...b, pyramide: v }))}
          />
        </div>
      </section>

      {/* ── Simulations ───────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-cervus-gold-light">
          Simulations
        </h2>

        {sims.length === 0 && (
          <p className="text-sm text-cervus-bronze/50">
            Aucun scénario ajouté. Ajoutez-en autant que voulu, même type plusieurs fois.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {sims.map((sim, idx) => (
            <SimCard
              key={sim.id}
              index={idx}
              sim={sim}
              onRemove={() => removeSim(sim.id)}
              onPatch={(patch) => patchSim(sim.id, patch)}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(SIM_LABELS) as SimType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => addSim(t)}
              className="inline-flex items-center gap-1.5 rounded-[50px] border border-cervus-gold/40 px-3.5 py-2 text-sm font-medium text-cervus-bronze hover:bg-cervus-gold/10"
            >
              <span className="text-cervus-gold">+</span> {SIM_LABELS[t]}
            </button>
          ))}
        </div>
      </section>

      {/* ── Barre de génération (sticky) ──────────────────────────────────── */}
      <div className="sticky bottom-0 -mx-4 mt-2 flex flex-col gap-1 border-t border-cervus-gold/15 bg-cervus-dark/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        {err && <span className="text-xs text-red-400">{err}</span>}
        <button
          type="button"
          onClick={generate}
          disabled={busy || nothingSelected}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[50px] bg-cervus-gold px-6 py-2.5 text-sm font-semibold text-white hover:bg-cervus-gold-dark disabled:opacity-40"
        >
          {busy ? "Génération du PDF…" : "Générer le PDF"}
        </button>
      </div>
    </div>
  );
}

// ── Sous-composants ───────────────────────────────────────────────────────────
function BlocCheck({
  label,
  hint,
  checked,
  available,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  available: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-xl border p-3 ${
        available
          ? "cursor-pointer border-cervus-gold/25 bg-cervus-gold/5 hover:bg-cervus-gold/10"
          : "cursor-not-allowed border-cervus-bronze/10 bg-transparent opacity-50"
      }`}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 accent-cervus-gold"
        checked={available && checked}
        disabled={!available}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-cervus-bronze">{label}</span>
        <span className="text-xs text-cervus-bronze/50">
          {available ? hint : "Données indisponibles pour ce client"}
        </span>
      </span>
    </label>
  );
}

function SimCard({
  index,
  sim,
  onRemove,
  onPatch,
}: {
  index: number;
  sim: Instance;
  onRemove: () => void;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-cervus-gold/25 bg-cervus-gold/5 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-cervus-bronze">
          {index + 1}. {SIM_LABELS[sim.type]}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full px-2 py-1 text-xs text-cervus-bronze/60 hover:bg-red-500/10 hover:text-red-400"
        >
          Retirer
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SimFields sim={sim} onPatch={onPatch} />
      </div>
    </div>
  );
}

function SimFields({ sim, onPatch }: { sim: Instance; onPatch: (p: Record<string, unknown>) => void }) {
  const p = sim.params as unknown as Record<string, unknown>;
  const num = (id: string, v: string) => onPatch({ [id]: v === "" ? 0 : Number(v) });

  switch (sim.type) {
    case "per-quick":
      return (
        <>
          <NumField label="Versement mensuel (€)" value={p.versementMensuel} onChange={(v) => num("versementMensuel", v)} />
          <NumField label="Apport initial (€)" value={p.versementInitial} onChange={(v) => num("versementInitial", v)} />
          <NumField label="Horizon (ans)" value={p.horizon} onChange={(v) => num("horizon", v)} />
          <SelField label="Profil" value={String(p.profil)} options={PER_PROFILS} onChange={(v) => onPatch({ profil: v })} />
        </>
      );
    case "per-full":
      return (
        <>
          <NumField label="Versement mensuel (€)" value={p.versementMensuel} onChange={(v) => num("versementMensuel", v)} />
          <NumField label="Apport initial (€)" value={p.versementInitial} onChange={(v) => num("versementInitial", v)} />
          <NumField label="Horizon (ans)" value={p.horizon} onChange={(v) => num("horizon", v)} />
          <SelField label="Profil" value={String(p.profil)} options={PER_PROFILS} onChange={(v) => onPatch({ profil: v })} />
          <SelField
            label="Tranche de sortie"
            value={String(p.trancheSortie)}
            options={TRANCHES.map((t) => ({ value: String(t), label: `${t} %` }))}
            onChange={(v) => onPatch({ trancheSortie: Number(v) })}
          />
          <SelField
            label="Âge de conversion"
            value={String(p.ageConversion)}
            options={[
              { value: "64", label: "64 ans" },
              { value: "67", label: "67 ans" },
            ]}
            onChange={(v) => onPatch({ ageConversion: Number(v) })}
          />
        </>
      );
    case "av":
      return (
        <>
          <NumField label="Apport initial (€)" value={p.versementInitial} onChange={(v) => num("versementInitial", v)} />
          <NumField label="Versement mensuel (€)" value={p.versementMensuel} onChange={(v) => num("versementMensuel", v)} />
          <NumField label="Durée (ans)" value={p.dureeAnnees} onChange={(v) => num("dureeAnnees", v)} />
          <SelField label="Profil" value={String(p.profil)} options={AV_PROFILS} onChange={(v) => onPatch({ profil: v })} />
          <SelField
            label="Situation"
            value={p.marie ? "1" : "0"}
            options={[
              { value: "0", label: "Seul(e)" },
              { value: "1", label: "Marié(e) / pacsé(e)" },
            ]}
            onChange={(v) => onPatch({ marie: v === "1" })}
          />
        </>
      );
    case "comparateur":
      return (
        <>
          <NumField label="Effort net mensuel (€)" value={p.effortNetMensuel} onChange={(v) => num("effortNetMensuel", v)} />
          <NumField label="Apport net initial (€)" value={p.effortNetInitial} onChange={(v) => num("effortNetInitial", v)} />
          <NumField label="Horizon (ans)" value={p.horizon} onChange={(v) => num("horizon", v)} />
          <SelField label="Profil" value={String(p.profil)} options={PER_PROFILS} onChange={(v) => onPatch({ profil: v })} />
          <SelField
            label="Tranche de sortie PER"
            value={String(p.trancheSortie)}
            options={TRANCHES.map((t) => ({ value: String(t), label: `${t} %` }))}
            onChange={(v) => onPatch({ trancheSortie: Number(v) })}
          />
        </>
      );
    case "reduction":
      return (
        <>
          <NumField label="Revenu imposable (€)" value={p.revenuImposable} onChange={(v) => num("revenuImposable", v)} />
          <SelField
            label="Situation familiale"
            value={String(p.statut)}
            options={STATUTS.map((sLabel) => ({ value: sLabel, label: sLabel }))}
            onChange={(v) => onPatch({ statut: v })}
          />
          <NumField label="Nombre d'enfants" value={p.nbEnfants} onChange={(v) => num("nbEnfants", v)} />
          <NumField label="Versement PER (€)" value={p.versementPer} onChange={(v) => num("versementPer", v)} />
        </>
      );
  }
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-cervus-bronze/60">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={String(value ?? 0)}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[40px] rounded-lg border border-cervus-gold/25 bg-cervus-dark/40 px-3 text-sm text-cervus-bronze focus:border-cervus-gold focus:outline-none"
      />
    </label>
  );
}

function SelField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-cervus-bronze/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[40px] rounded-lg border border-cervus-gold/25 bg-cervus-dark/40 px-3 text-sm text-cervus-bronze focus:border-cervus-gold focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
