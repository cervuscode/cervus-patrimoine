import { Text, View } from "@react-pdf/renderer";
import type { ContributionsHRModel } from "@/lib/compte-rendu";
import { GOLD, GREY, SOFT, WHITE, fmt, SectionTitle } from "../pdf-theme";

/**
 * Bloc PDF « Contributions hauts revenus » (CEHR/CDHR — Lot 11).
 * Affiché uniquement si le foyer est concerné (filtré dans buildContributionsHR).
 * Données pré-calculées — ZÉRO calcul ici. Calque l'encadré CEHR/CDHR de la fiche.
 */
export default function ContributionsHRBlock({ model }: { model: ContributionsHRModel }) {
  return (
    <View style={{ marginBottom: 16 }} wrap={false}>
      <SectionTitle>Contributions exceptionnelles sur les hauts revenus</SectionTitle>

      <View style={{ borderWidth: 0.6, borderColor: SOFT, borderRadius: 6, overflow: "hidden" }}>
        <Line
          label="RFR retenu"
          note={model.rfrEstime ? "estimation — RFR approximatif" : "réel (avis d'imposition)"}
          value={fmt(model.rfr)}
          zebra={0}
        />
        <Line label="Impôt sur le revenu (reconstitué)" value={fmt(model.irHR)} zebra={1} />
        <Line label="CEHR" value={fmt(model.cehr)} zebra={0} />
        <Line label="CDHR" note="estimation — RFR retraité approximé" value={fmt(model.cdhr)} zebra={1} />
        {/* Total */}
        <View style={{ flexDirection: "row", backgroundColor: "#E6DACF", alignItems: "center" }}>
          <View style={{ flex: 3, paddingVertical: 7, paddingHorizontal: 8 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1C1C1C" }}>
              Total IR + CEHR + CDHR
            </Text>
          </View>
          <View style={{ flex: 1.4, paddingVertical: 7, paddingHorizontal: 8 }}>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: GOLD, textAlign: "right" }}>
              {fmt(model.totalHR)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 6.5, color: GREY, marginTop: 4 }}>
        {(model.majorationFoyer > 0 ? "Majoration CDHR estimée sur le nombre d'enfants. " : "") +
          "Estimation indicative : le RFR exact figure sur l'avis d'imposition."}
      </Text>
    </View>
  );
}

function Line({
  label,
  note,
  value,
  zebra,
}: {
  label: string;
  note?: string;
  value: string;
  zebra: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: zebra % 2 === 0 ? WHITE : "#FAF7F4",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 3, paddingVertical: 6, paddingHorizontal: 8 }}>
        <Text style={{ fontSize: 8.5, color: "#1C1C1C" }}>
          {label}
          {note ? <Text style={{ fontSize: 6.5, color: GREY }}> ({note})</Text> : null}
        </Text>
      </View>
      <View style={{ flex: 1.4, paddingVertical: 6, paddingHorizontal: 8 }}>
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1C1C1C", textAlign: "right" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
