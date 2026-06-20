"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  computePerQuick,
  formatEuro,
  PROFIL_LABELS,
  PER_MSG_REQUEST,
  PER_MSG_VALUES,
  type PerQuickInputs,
} from "@/lib/per-quick";

/**
 * Onglet PRÉSENTATION CLIENT (Lot 2, point D) — LA seule surface pensée pour le
 * partage d'écran en visio. Affiche UNIQUEMENT le résultat (gros chiffres + graphe),
 * jamais les champs de saisie, jamais le nom du client, jamais le panneau.
 *
 * « Actualiser » : récupère les valeurs courantes de la fenêtre principale
 * (window.opener) via postMessage. Si l'opener est fermé → message clair, pas de
 * crash. L'affichage initial vient des query params (survit à la fermeture opener).
 */
export default function PerPresentation({
  initialInputs,
  clientCode,
}: {
  initialInputs: PerQuickInputs;
  clientCode: string | null;
}) {
  const [inputs, setInputs] = useState<PerQuickInputs>(initialInputs);
  const [status, setStatus] = useState<"idle" | "refreshing">("idle");
  const [notice, setNotice] = useState<string | null>(null);

  const result = useMemo(() => computePerQuick(inputs), [inputs]);

  // Reçoit la réponse de la fenêtre principale.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== PER_MSG_VALUES) return;
      setInputs(event.data.payload as PerQuickInputs);
      setStatus("idle");
      setNotice("Valeurs actualisées");
      setTimeout(() => setNotice(null), 2000);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const actualiser = useCallback(() => {
    if (!window.opener || window.opener.closed) {
      setNotice("Fenêtre source fermée, impossible d'actualiser.");
      setTimeout(() => setNotice(null), 3500);
      return;
    }
    setStatus("refreshing");
    window.opener.postMessage({ type: PER_MSG_REQUEST }, window.location.origin);
    // Filet : si pas de réponse en 2,5 s, on rend la main.
    setTimeout(() => {
      setStatus((s) => {
        if (s === "refreshing") {
          setNotice("Aucune réponse de la fenêtre source.");
          setTimeout(() => setNotice(null), 3500);
          return "idle";
        }
        return s;
      });
    }, 2500);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-10 sm:py-14">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cervus-gold-light">
            Cervus Patrimoine
          </p>
          <h1 className="font-cormorant text-4xl font-semibold text-cervus-bronze sm:text-5xl">
            Votre simulation PER
          </h1>
          {clientCode && (
            <p className="mt-1 font-mono text-sm tracking-wider text-cervus-bronze/50">
              {clientCode}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={actualiser}
            disabled={status === "refreshing"}
            className="inline-flex items-center gap-2 rounded-[50px] border border-cervus-gold/50 px-5 py-2.5 text-sm font-medium text-cervus-bronze transition-colors hover:bg-cervus-gold/15 disabled:opacity-50"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            {status === "refreshing" ? "Actualisation…" : "Actualiser"}
          </button>
          {notice && <span className="text-[11px] text-cervus-gold-light">{notice}</span>}
        </div>
      </header>

      {/* Chiffres clés — grande taille, lisibles à distance en partage d'écran */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BigStat
          label="Économie d'impôt par an"
          value={formatEuro(result.economieFiscale)}
          highlight
        />
        <BigStat label="Capital projeté à l'horizon" value={formatEuro(result.capitalFinal)} />
        <BigStat label="Total versé sur la durée" value={formatEuro(result.totalVerse)} />
      </section>

      <section className="rounded-3xl border border-cervus-gold/25 bg-cervus-dark/40 p-4 sm:p-6">
        <p className="mb-4 text-sm text-cervus-bronze/70">
          Évolution du capital · profil {PROFIL_LABELS[inputs.profil].toLowerCase()} ·{" "}
          {inputs.horizon} ans
        </p>
        <div className="h-72 w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.courbe} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="presFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a07d62" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#a07d62" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#795D48" strokeOpacity={0.15} vertical={false} />
              <XAxis dataKey="annee" stroke="#a07d62" fontSize={13} tickLine={false} />
              <YAxis
                stroke="#a07d62"
                fontSize={13}
                tickLine={false}
                width={56}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
              />
              <Tooltip
                formatter={(v) => formatEuro(Number(v))}
                labelFormatter={(l) => `Année ${l}`}
                contentStyle={{ background: "#0f0f0f", border: "1px solid #795D48", borderRadius: 12, color: "#a07d62" }}
              />
              <Area type="monotone" dataKey="capital" stroke="#795D48" strokeWidth={3} fill="url(#presFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <p className="text-xs leading-relaxed text-cervus-bronze/40">
        Estimation pédagogique indicative, non contractuelle. Les performances futures
        ne sont pas garanties.
      </p>
    </main>
  );
}

function BigStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        highlight ? "border-cervus-gold/60 bg-cervus-gold/10" : "border-cervus-gold/25 bg-cervus-dark/40"
      }`}
    >
      <p className="text-sm text-cervus-bronze/60">{label}</p>
      <p className="mt-2 font-cormorant text-4xl font-semibold text-cervus-bronze sm:text-5xl">
        {value}
      </p>
    </div>
  );
}
