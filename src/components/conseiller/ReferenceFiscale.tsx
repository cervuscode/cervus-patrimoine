"use client";

import { useMemo, useState } from "react";
import { formatEuro } from "@/lib/per-quick";
import {
  BAREME_2026_PARAMS,
  lookupImpotReference,
  REVENUS_REF,
  TABLE_ECONOMIE_PER,
  TABLE_IMPOT_NET,
  TMI_REF,
  VERSEMENTS_REF,
} from "@/lib/bareme-reference-2026";

/**
 * Tableau de référence fiscal 2026 (Lot G) — consultation / vérification croisée.
 * Lit UNIQUEMENT les données de référence (`bareme-reference-2026.ts`) ; ne consomme
 * PAS fiscal-engine (ce n'est pas un moteur). Mobile-first.
 */
export default function ReferenceFiscale() {
  const [situationId, setSituationId] = useState(TABLE_IMPOT_NET[0].id);
  const [revenu, setRevenu] = useState<number>(40000);
  const [versement, setVersement] = useState<number>(5000);
  const [tmiIdx, setTmiIdx] = useState<number>(1); // 30 %

  const situation = useMemo(
    () => TABLE_IMPOT_NET.find((s) => s.id === situationId) ?? TABLE_IMPOT_NET[0],
    [situationId]
  );
  const lookup = useMemo(
    () => lookupImpotReference(situation, revenu),
    [situation, revenu]
  );

  const tmi = TMI_REF[tmiIdx];
  const economie = Math.round(versement * (tmi / 100));
  const versementProche = useMemo(() => {
    let best = 0;
    for (let i = 1; i < VERSEMENTS_REF.length; i++) {
      if (Math.abs(VERSEMENTS_REF[i] - versement) < Math.abs(VERSEMENTS_REF[best] - versement)) best = i;
    }
    return best;
  }, [versement]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6 pb-28 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-cervus-gold-light">Consultation</span>
        <h1 className="font-cormorant text-3xl font-semibold text-cervus-bronze sm:text-4xl">
          Référence fiscale 2026
        </h1>
        <p className="text-sm text-cervus-bronze/60">
          Données de contrôle interne (validées DGFiP/BOFiP). Vérification express d&apos;un ordre de
          grandeur — les calculs personnalisés passent par les simulateurs.
        </p>
      </header>

      {/* ── Tableau 1 ───────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-cormorant text-2xl text-cervus-bronze">Impôt net & TMI</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-cervus-bronze/70">Situation familiale</span>
            <select
              value={situationId}
              onChange={(e) => setSituationId(e.target.value)}
              className="rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2.5 text-base text-cervus-bronze focus:border-cervus-gold focus:outline-none"
            >
              {TABLE_IMPOT_NET.map((s) => (
                <option key={s.id} value={s.id} className="bg-cervus-dark">
                  {s.label} ({s.parts} part{s.parts > 1 ? "s" : ""})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-cervus-bronze/70">Revenu net imposable (€/an)</span>
            <input
              type="number"
              inputMode="decimal"
              value={Number.isFinite(revenu) ? revenu : ""}
              onChange={(e) => setRevenu(parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              className="rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2.5 text-base text-cervus-bronze focus:border-cervus-gold focus:outline-none"
            />
          </label>
        </div>

        {/* Carte résultat express */}
        {lookup ? (
          <div className="rounded-2xl border border-cervus-gold/50 bg-cervus-gold/10 p-5">
            <p className="text-xs text-cervus-bronze/60">
              {situation.label} · revenu {formatEuro(revenu)}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <p className="font-cormorant text-3xl font-semibold text-cervus-bronze">
                {lookup.interpole ? "≈ " : ""}
                {formatEuro(lookup.impotNet)}
              </p>
              <p className="text-lg text-cervus-bronze/80">TMI {lookup.tmi} %</p>
            </div>
            <p className="mt-1 text-[11px] text-cervus-bronze/50">
              {lookup.interpole
                ? "Impôt net interpolé entre deux colonnes ; TMI effective calculée au revenu exact (plafonnement du quotient familial inclus)."
                : "Valeur de référence du tableau ; TMI effective calculée au revenu exact."}
              {" "}Peut différer de la tranche affichée sur l&apos;avis d&apos;imposition.
            </p>
          </div>
        ) : (
          <p className="text-sm text-cervus-bronze/50">Aucune valeur de référence pour cette situation.</p>
        )}

        {/* Ligne de la situation sélectionnée */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-cervus-bronze/50">
              <tr>
                <th className="py-2 pr-3">Revenu</th>
                {REVENUS_REF.map((r) => (
                  <th key={r} className="px-2 py-2 text-right">{Math.round(r / 1000)}k</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-cervus-gold/10">
                <td className="py-2 pr-3 text-cervus-bronze/70">Impôt net</td>
                {situation.cells.map((c, i) => (
                  <td
                    key={i}
                    className={`px-2 py-2 text-right ${
                      lookup?.colonneProche === i ? "rounded bg-cervus-gold/25 font-semibold text-cervus-bronze" : "text-cervus-bronze/80"
                    }`}
                  >
                    {c ? c[0].toLocaleString("fr-FR") : "—"}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-cervus-gold/10">
                <td className="py-2 pr-3 text-cervus-bronze/70">TMI</td>
                {situation.cells.map((c, i) => (
                  <td key={i} className="px-2 py-2 text-right text-cervus-bronze/60">
                    {c ? `${c[1]}%` : "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Tableau 2 ───────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-cormorant text-2xl text-cervus-bronze">Économie fiscale PER</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-cervus-bronze/70">Versement PER (€)</span>
            <input
              type="number"
              inputMode="decimal"
              value={Number.isFinite(versement) ? versement : ""}
              onChange={(e) => setVersement(parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              className="rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2.5 text-base text-cervus-bronze focus:border-cervus-gold focus:outline-none"
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-cervus-bronze/70">TMI</span>
            <div className="flex gap-2">
              {TMI_REF.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTmiIdx(i)}
                  className={`flex-1 rounded-[50px] border px-3 py-2 text-xs font-medium transition-colors ${
                    tmiIdx === i
                      ? "border-cervus-gold bg-cervus-gold text-cervus-bronze"
                      : "border-cervus-gold/40 text-cervus-bronze/80 hover:bg-cervus-gold/10"
                  }`}
                >
                  {t} %
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cervus-gold/50 bg-cervus-gold/10 p-5">
          <p className="text-xs text-cervus-bronze/60">
            Versement {formatEuro(versement)} · TMI {tmi} %
          </p>
          <p className="mt-1 font-cormorant text-3xl font-semibold text-cervus-bronze">
            {formatEuro(economie)}
          </p>
          <p className="mt-1 text-[11px] text-cervus-bronze/50">
            Économie PER = Versement × TMI (dans la limite du plafond PER disponible).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-cervus-bronze/50">
              <tr>
                <th className="py-2 pr-3">Versement</th>
                {TMI_REF.map((t, i) => (
                  <th key={t} className={`px-2 py-2 text-right ${tmiIdx === i ? "text-cervus-bronze" : ""}`}>
                    {t} %
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_ECONOMIE_PER.map((row, ri) => (
                <tr key={VERSEMENTS_REF[ri]} className="border-t border-cervus-gold/10">
                  <td className={`py-2 pr-3 ${versementProche === ri ? "font-semibold text-cervus-bronze" : "text-cervus-bronze/70"}`}>
                    {VERSEMENTS_REF[ri].toLocaleString("fr-FR")} €
                  </td>
                  {row.map((e, ci) => (
                    <td
                      key={ci}
                      className={`px-2 py-2 text-right ${
                        versementProche === ri && tmiIdx === ci
                          ? "rounded bg-cervus-gold/25 font-semibold text-cervus-bronze"
                          : "text-cervus-bronze/80"
                      }`}
                    >
                      {e.toLocaleString("fr-FR")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Tableau 3 — paramètres ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-cormorant text-2xl text-cervus-bronze">Paramètres du barème 2026</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Param label="Tranches IR (par part)">
            {BAREME_2026_PARAMS.tranches
              .map((t) => (t.plafond ? `${t.taux}% → ${t.plafond.toLocaleString("fr-FR")} €` : `${t.taux}% au-delà`))
              .join(" · ")}
          </Param>
          <Param label="Plafond quotient familial">{BAREME_2026_PARAMS.plafondDemiPart.toLocaleString("fr-FR")} € / demi-part</Param>
          <Param label="Plafond case T (parent isolé)">{BAREME_2026_PARAMS.plafondCaseT.toLocaleString("fr-FR")} €</Param>
          <Param label="Quart de part (garde alternée)">{BAREME_2026_PARAMS.quartDePart.toLocaleString("fr-FR")} €</Param>
          <Param label="Décote célibataire">
            si IR &lt; {BAREME_2026_PARAMS.decoteCelibataire.seuil.toLocaleString("fr-FR")} € → {BAREME_2026_PARAMS.decoteCelibataire.formule}
          </Param>
          <Param label="Décote couple">
            si IR &lt; {BAREME_2026_PARAMS.decoteCouple.seuil.toLocaleString("fr-FR")} € → {BAREME_2026_PARAMS.decoteCouple.formule}
          </Param>
        </div>
      </section>

      <p className="text-[11px] leading-relaxed text-cervus-bronze/40">
        Données de référence (contrôle interne 2026, source {BAREME_2026_PARAMS.source}). Les calculs
        personnalisés passent par le simulateur (fiscal-engine).
      </p>
    </main>
  );
}

function Param({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-cervus-gold/20 bg-cervus-dark/40 p-4">
      <p className="text-xs uppercase tracking-wider text-cervus-gold-light">{label}</p>
      <p className="mt-1 text-sm text-cervus-bronze/80">{children}</p>
    </div>
  );
}
