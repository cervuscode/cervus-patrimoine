"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SERIE_META, type SerieKey } from "@/lib/market-data";
import { formatEuro } from "@/lib/per-quick";
import type { ChartRow } from "@/lib/resilience-marches";

/**
 * Graphe linéaire réutilisable (Lot 10) — partagé par les 3 graphiques de
 * « Résilience des marchés ». Affiche uniquement les séries `visibleKeys`.
 * Mobile-first : `ResponsiveContainer` pleine largeur, hauteur fixe.
 *
 * `valueKind` : "indice" (base 100 / points d'indice, sans symbole €) ou "euro"
 * (capital, formaté en €). `xLabel` : suffixe optionnel de l'axe X (ex. « ans »).
 */
export default function MarchesChart({
  rows,
  series,
  visibleKeys,
  valueKind,
  xSuffix,
}: {
  rows: ChartRow[];
  series: SerieKey[];
  visibleKeys: Set<SerieKey>;
  valueKind: "indice" | "euro";
  xSuffix?: string;
}) {
  const fmt = (n: number): string =>
    valueKind === "euro" ? formatEuro(n) : Math.round(n).toLocaleString("fr-FR");
  const fmtAxis = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} M`;
    if (n >= 1_000) return `${Math.round(n / 1_000)} k`;
    return String(Math.round(n));
  };

  return (
    <div className="w-full" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid stroke="#795D48" strokeOpacity={0.12} vertical={false} />
          <XAxis
            dataKey="x"
            tick={{ fill: "#a07d62", fontSize: 11 }}
            tickFormatter={(v) => `${v}${xSuffix ? ` ${xSuffix}` : ""}`}
            stroke="#795D48"
            strokeOpacity={0.3}
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: "#a07d62", fontSize: 11 }}
            tickFormatter={fmtAxis}
            stroke="#795D48"
            strokeOpacity={0.3}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "#0f0f0f",
              border: "1px solid rgba(121,93,72,0.4)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#F2EDE8" }}
            labelFormatter={(v) => `${v}${xSuffix ? ` ${xSuffix}` : ""}`}
            formatter={(value, name) => [fmt(Number(value)), String(name)]}
          />
          {series
            .filter((k) => visibleKeys.has(k))
            .map((k) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                name={SERIE_META[k].label}
                stroke={SERIE_META[k].color}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
