"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatEuro } from "@/lib/per-quick";

/**
 * Courbe d'évolution de la valeur d'un contrat d'assurance-vie (brut) année par
 * année. SOURCE UNIQUE du rendu, partagée par le simulateur (`AvSim`) et la vue
 * présentation (`AvPresentation`). Thème sombre conseiller, mobile-first.
 *
 * Une seule série « Valeur du contrat » — jamais d'opposition « avec / sans » ni de
 * vocabulaire confidentiel.
 */
export default function AvCourbeChart({
  courbe,
}: {
  courbe: { annee: number; valeur: number }[];
}) {
  const fmtAxis = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} M`;
    if (n >= 1_000) return `${Math.round(n / 1_000)} k`;
    return String(Math.round(n));
  };

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={courbe} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="avCourbeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a07d62" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#a07d62" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#795D48" strokeOpacity={0.12} vertical={false} />
          <XAxis
            dataKey="annee"
            tick={{ fill: "#a07d62", fontSize: 11 }}
            tickFormatter={(v) => `${v} an${v > 1 ? "s" : ""}`}
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
            labelFormatter={(v) => `Année ${v}`}
            formatter={(value) => [formatEuro(Number(value)), "Valeur du contrat"]}
          />
          <Area
            type="monotone"
            dataKey="valeur"
            name="Valeur du contrat"
            stroke="#795D48"
            strokeWidth={2}
            fill="url(#avCourbeFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
