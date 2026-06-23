"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computePyramide,
  DEFAULT_PYRAMIDE_INPUTS,
  type PyramideInputs,
} from "@/lib/pyramide-epargne";
import { formatEuro } from "@/lib/per-quick";
import { pyramideDraft } from "@/lib/sim-history";
import { useRdvClient } from "./RdvClientProvider";
import KeepResultButton from "./KeepResultButton";
import PyramidsView from "./PyramidsView";

interface PyramideEpargneSimProps {
  /** Valeurs pré-remplies (mode connecté : depuis le patrimoine financier de la fiche). */
  prefill?: Partial<PyramideInputs>;
  /** Présent = mode CONNECTÉ : code client en évidence + capture note. */
  client?: { personId: number; code: string | null };
}

/**
 * « Pyramide de l'épargne » version conseiller (Lot 9). Range les encours du client
 * en 4 niveaux et les confronte à une répartition cible théorique (visuel à deux
 * pyramides). Composant client partagé par les 2 modes (autonome / connecté).
 *
 * En connecté : pré-rempli depuis le patrimoine financier de la fiche, mais tout
 * reste éditable (scénarios « et si… »). N'écrit JAMAIS dans Pipedrive.
 */
export default function PyramideEpargneSim({ prefill, client }: PyramideEpargneSimProps) {
  const initial = useMemo<PyramideInputs>(
    () => ({ ...DEFAULT_PYRAMIDE_INPUTS, ...prefill }),
    [prefill]
  );
  const [inputs, setInputs] = useState<PyramideInputs>(initial);
  useEffect(() => setInputs(initial), [initial]);

  const result = useMemo(() => computePyramide(inputs), [inputs]);

  const { recordSim } = useRdvClient();
  function keep() {
    recordSim(
      pyramideDraft({ capaciteEpargneMensuelle: inputs.capaciteEpargneMensuelle }, result)
    );
    return true;
  }

  function setNum(key: keyof PyramideInputs, raw: string) {
    const n = parseFloat(raw.replace(",", "."));
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }));
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
          Pyramide de l&apos;épargne
        </h1>
        <p className="text-xs text-cervus-bronze/50">
          Comparez la répartition réelle du patrimoine financier à une répartition
          cible de bon sens. Tous les champs sont modifiables.
        </p>
      </header>

      {/* Saisie groupée par enveloppe (la pyramide range ensuite par niveau). */}
      <section className="flex flex-col gap-5">
        <Groupe titre="Liquidités & épargne de précaution">
          <Field label="Livrets réglementés (€)">
            <NumberInput value={inputs.livretsReglementes} onChange={(v) => setNum("livretsReglementes", v)} />
          </Field>
          <Field label="Livrets boostés / fiscalisés (€)">
            <NumberInput value={inputs.livretsBoostes} onChange={(v) => setNum("livretsBoostes", v)} />
          </Field>
          <Field label="Autre épargne (€)">
            <NumberInput value={inputs.autreEpargne} onChange={(v) => setNum("autreEpargne", v)} />
          </Field>
        </Groupe>

        <Groupe titre="Assurance-vie">
          <Field label="Encours AV total (€)">
            <NumberInput value={inputs.encoursAv} onChange={(v) => setNum("encoursAv", v)} />
          </Field>
          <Field label="… dont fonds euros (€)">
            <NumberInput value={inputs.encoursFondsEuros} onChange={(v) => setNum("encoursFondsEuros", v)} />
          </Field>
        </Groupe>

        <Groupe titre="Capitalisation long terme">
          <Field label="Encours PEA (€)">
            <NumberInput value={inputs.encoursPea} onChange={(v) => setNum("encoursPea", v)} />
          </Field>
          <Field label="Encours PER (€)">
            <NumberInput value={inputs.encoursPer} onChange={(v) => setNum("encoursPer", v)} />
          </Field>
        </Groupe>

        <Groupe titre="Dynamique">
          <Field label="Compte-titres ordinaire (€)">
            <NumberInput value={inputs.cto} onChange={(v) => setNum("cto", v)} />
          </Field>
          <Field label="Crypto-actifs (€)">
            <NumberInput value={inputs.crypto} onChange={(v) => setNum("crypto", v)} />
          </Field>
        </Groupe>

        <Groupe titre="Cible de précaution">
          <Field label="Capacité d'épargne mensuelle (€)">
            <NumberInput
              value={inputs.capaciteEpargneMensuelle}
              onChange={(v) => setNum("capaciteEpargneMensuelle", v)}
            />
          </Field>
        </Groupe>
      </section>

      {/* Les deux pyramides */}
      <PyramidsView result={result} />

      {result.ciblePrecaution !== null && (
        <p className="text-center text-xs text-cervus-bronze/55">
          Cible de précaution : {formatEuro(result.ciblePrecaution)} ({result.surplus > 0
            ? `surplus à investir ${formatEuro(result.surplus)}`
            : "patrimoine entièrement absorbé par la précaution"}
          ).
        </p>
      )}

      {client && (
        <KeepResultButton
          onKeep={keep}
          disabled={result.patrimoineTotal <= 0}
          className="w-full sm:w-auto sm:self-end"
        />
      )}

      <p className="text-[11px] leading-relaxed text-cervus-bronze/40">
        Répartition cible indicative et pédagogique, non contractuelle. Aucune donnée
        n&apos;est enregistrée depuis cet outil.
      </p>
    </div>
  );
}

function Groupe({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 rounded-2xl border border-cervus-gold/20 bg-cervus-dark/30 p-4">
      <legend className="px-1 text-xs font-medium uppercase tracking-wider text-cervus-gold-light">
        {titre}
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
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

function NumberInput({ value, onChange }: { value: number; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step="100"
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => e.target.select()}
      className="rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2.5 text-base text-cervus-bronze focus:border-cervus-gold focus:outline-none"
    />
  );
}
