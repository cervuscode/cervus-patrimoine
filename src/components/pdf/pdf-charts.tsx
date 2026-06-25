import { Svg, Polyline, Polygon, Line, Text, View } from "@react-pdf/renderer";
import { GOLD, GREY, SOFT, fmtK } from "./pdf-theme";

/**
 * Primitives graphiques SVG du compte-rendu PDF (Lot 11).
 * Formes géométriques propres adaptées au PDF — PAS de recharts. Tout passe par les
 * primitives @react-pdf/renderer (Svg, Polyline, Polygon, Line…).
 */

// ── Courbe d'évolution du capital ───────────────────────────────────────────────
const VB_W = 500; // largeur logique du viewBox
const PAD_L = 6;
const PAD_R = 6;
const PAD_T = 8;
const PAD_B = 6;

/**
 * Ligne d'évolution du capital sur l'horizon (aire + courbe + base). Échelle interne
 * en viewBox (responsive en largeur). Labels d'années rendus en layout sous le graphe.
 */
export function CourbeCapital({
  data,
  height = 110,
  color = GOLD,
}: {
  data: Array<{ annee: number; capital: number }>;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return null;
  const H = 150; // hauteur logique du viewBox
  const plotTop = PAD_T;
  const plotBottom = H - PAD_B;
  const plotLeft = PAD_L;
  const plotRight = VB_W - PAD_R;
  const n = data.length;
  const max = Math.max(...data.map((d) => d.capital), 1);

  const x = (i: number) => plotLeft + (i / (n - 1)) * (plotRight - plotLeft);
  const y = (c: number) => plotBottom - (c / max) * (plotBottom - plotTop);

  const linePts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.capital).toFixed(1)}`).join(" ");
  const areaPts =
    `${plotLeft.toFixed(1)},${plotBottom.toFixed(1)} ` +
    linePts +
    ` ${plotRight.toFixed(1)},${plotBottom.toFixed(1)}`;

  // Années repères affichées sous le graphe (début, ~quarts, fin).
  const idxs = Array.from(new Set([0, Math.round((n - 1) / 4), Math.round((n - 1) / 2), Math.round((3 * (n - 1)) / 4), n - 1]));

  return (
    <View>
      {/* Valeur finale au-dessus à droite */}
      <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color, textAlign: "right", marginBottom: 1 }}>
        {fmtK(data[n - 1].capital)}
      </Text>
      <Svg viewBox={`0 0 ${VB_W} ${H}`} style={{ width: "100%", height }}>
        {/* aire */}
        <Polygon points={areaPts} fill={color} fillOpacity={0.12} />
        {/* lignes de repère horizontales (0 / 50 / 100 %) */}
        <Line x1={plotLeft} y1={plotTop} x2={plotRight} y2={plotTop} strokeWidth={0.5} stroke={SOFT} />
        <Line
          x1={plotLeft}
          y1={(plotTop + plotBottom) / 2}
          x2={plotRight}
          y2={(plotTop + plotBottom) / 2}
          strokeWidth={0.5}
          stroke={SOFT}
        />
        {/* base */}
        <Line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} strokeWidth={0.8} stroke={GREY} />
        {/* courbe */}
        <Polyline points={linePts} fill="none" stroke={color} strokeWidth={2} />
      </Svg>
      {/* axe X — années */}
      <View style={{ flexDirection: "row", marginTop: 2 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center" }}>
            {idxs.includes(i) && (
              <Text style={{ fontSize: 5, color: GREY }}>{`+${d.annee}`}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Pyramide de l'épargne (réelle) ──────────────────────────────────────────────
/**
 * Pyramide en 4 bandes (trapèzes) de bas (PRÉCAUTION) en haut (DYNAMIQUE).
 * Bandes de hauteur égale, largeur dégressive — forme de pyramide classique.
 * `niveaux` est dans l'ordre BASE → SOMMET (comme PyramideResult).
 */
export function PyramideSvg({
  niveaux,
  size = 150,
}: {
  niveaux: Array<{ color: string; texteSombre: boolean }>;
  size?: number;
}) {
  const apexY = 8;
  const baseY = 192;
  const cx = 100;
  const halfMax = 88;
  const hw = (yy: number) => ((yy - apexY) / (baseY - apexY)) * halfMax;
  const bandH = (baseY - apexY) / 4;

  // Bande 0 = sommet (dynamique = niveaux[3]) … bande 3 = base (precaution = niveaux[0]).
  const bands = [3, 2, 1, 0].map((nivIdx, bandIdx) => {
    const yt = apexY + bandIdx * bandH;
    const yb = yt + bandH;
    const pts =
      `${(cx - hw(yt)).toFixed(1)},${yt.toFixed(1)} ` +
      `${(cx + hw(yt)).toFixed(1)},${yt.toFixed(1)} ` +
      `${(cx + hw(yb)).toFixed(1)},${yb.toFixed(1)} ` +
      `${(cx - hw(yb)).toFixed(1)},${yb.toFixed(1)}`;
    return { pts, color: niveaux[nivIdx].color };
  });

  return (
    <Svg viewBox="0 0 200 200" style={{ width: size, height: size }}>
      {bands.map((b, i) => (
        <Polygon key={i} points={b.pts} fill={b.color} stroke="#ffffff" strokeWidth={1.4} />
      ))}
    </Svg>
  );
}
