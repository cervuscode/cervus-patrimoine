import { Text, View } from "@react-pdf/renderer";
import type { PyramideModel } from "@/lib/compte-rendu";
import { STATUT_COLORS, STATUT_LABELS } from "@/lib/pyramide-epargne";
import { GREY, SOFT, WHITE, fmt, fmtPct, SectionTitle } from "../pdf-theme";
import { PyramideSvg } from "../pdf-charts";

/**
 * Bloc PDF « Pyramide de l'épargne » (Lot 11) — pyramide RÉELLE uniquement (pas de
 * cible théorique, cf. spec). Visuel SVG 4 niveaux + légende montants/% + écart.
 */
export default function PyramideBlock({ model }: { model: PyramideModel }) {
  // Légende du sommet vers la base (pour aligner visuellement avec la pyramide).
  const legend = [...model.niveaux].reverse();
  return (
    <View style={{ marginBottom: 16 }} wrap={false}>
      <SectionTitle>Répartition de l&apos;épargne</SectionTitle>

      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        {/* Pyramide */}
        <View style={{ width: 150 }}>
          <PyramideSvg niveaux={model.niveaux} size={150} />
        </View>

        {/* Légende détaillée */}
        <View style={{ flex: 1, gap: 4 }}>
          {legend.map((n) => (
            <View
              key={n.key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: WHITE,
                borderWidth: 0.6,
                borderColor: SOFT,
                borderRadius: 5,
                padding: 6,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: n.color,
                  borderWidth: 0.5,
                  borderColor: SOFT,
                  borderRadius: 2,
                  marginRight: 6,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1C1C1C" }}>{n.label}</Text>
                <Text style={{ fontSize: 6, color: GREY }}>{n.sousTitre}</Text>
              </View>
              <View style={{ alignItems: "flex-end", marginRight: 8 }}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1C1C1C" }}>
                  {fmt(n.montantReel)}
                </Text>
                <Text style={{ fontSize: 6.5, color: GREY }}>{fmtPct(n.pctTotal * 100, 0)} du total</Text>
              </View>
              {n.statut !== "neutre" && (
                <View
                  style={{
                    backgroundColor: STATUT_COLORS[n.statut],
                    borderRadius: 3,
                    paddingVertical: 2,
                    paddingHorizontal: 5,
                  }}
                >
                  <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: WHITE }}>
                    {STATUT_LABELS[n.statut]}
                  </Text>
                </View>
              )}
            </View>
          ))}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2, paddingHorizontal: 2 }}>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1C1C1C" }}>Patrimoine financier total</Text>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1C1C1C" }}>{fmt(model.patrimoineTotal)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
