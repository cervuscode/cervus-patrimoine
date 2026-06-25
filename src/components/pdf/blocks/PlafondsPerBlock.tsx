import { Text, View } from "@react-pdf/renderer";
import type { PlafondsPerModel } from "@/lib/compte-rendu";
import { s, WHITE, GOLD, GREY, SOFT, fmt, SectionTitle } from "../pdf-theme";

/**
 * Bloc PDF « Plafonds de versement PER » (Lot 11).
 * Données pré-calculées dans `compte-rendu.buildPlafondsPer` — ZÉRO calcul ici.
 * Salarié (+ base) / Madelin TNS si applicable / total cumulé + mention reliquats N-3.
 */
export default function PlafondsPerBlock({ model }: { model: PlafondsPerModel }) {
  return (
    <View style={{ marginBottom: 16 }} wrap={false}>
      <SectionTitle>Plafonds de versement PER déductible</SectionTitle>

      <View style={{ borderWidth: 0.6, borderColor: SOFT, borderRadius: 6, overflow: "hidden" }}>
        <Row
          label="Plafond salarié"
          base={`10 % du revenu net imposable${model.estTNS ? " (hors foncier)" : ""} — base ${fmt(model.baseSalarie)}`}
          value={fmt(model.plafondSalarie)}
          zebra={0}
        />
        {model.estTNS && (
          <Row
            label="Plafond Madelin (TNS)"
            base={`sur bénéfice BNC/BIC — base ${fmt(model.beneficeTNS)}`}
            value={fmt(model.plafondTNS)}
            zebra={1}
          />
        )}
        {/* Total cumulé */}
        <View style={{ flexDirection: "row", backgroundColor: "#E6DACF", alignItems: "center" }}>
          <View style={{ flex: 3, paddingVertical: 7, paddingHorizontal: 8 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1C1C1C" }}>
              {model.estTNS ? "Plafond total cumulé" : "Plafond de déductibilité"}
            </Text>
          </View>
          <View style={{ flex: 1.4, paddingVertical: 7, paddingHorizontal: 8 }}>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: GOLD, textAlign: "right" }}>
              {fmt(model.plafondTotal)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 6.5, color: GREY, marginTop: 4 }}>
        Hors reliquats des trois années précédentes (N-1, N-2, N-3), non calculés ici. Plafond
        indicatif sur la base du PASS 2026.
      </Text>
    </View>
  );
}

function Row({
  label,
  base,
  value,
  zebra,
}: {
  label: string;
  base: string;
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
      <View style={{ flex: 3, paddingVertical: 7, paddingHorizontal: 8 }}>
        <Text style={[s.cardVal, { fontSize: 9 }]}>{label}</Text>
        <Text style={{ fontSize: 6.5, color: GREY, marginTop: 2 }}>{base}</Text>
      </View>
      <View style={{ flex: 1.4, paddingVertical: 7, paddingHorizontal: 8 }}>
        <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1C1C1C", textAlign: "right" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
