import { Text, View } from "@react-pdf/renderer";
import { s, GOLD, GREY, WHITE, SOFT } from "../pdf-theme";

/** Bandeau de paramètres d'une simulation (pilules grises). */
export function ParamPills({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
      {items.map((it, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            backgroundColor: "#EFE7E0",
            borderRadius: 4,
            paddingVertical: 3,
            paddingHorizontal: 7,
            gap: 3,
          }}
        >
          <Text style={{ fontSize: 6, color: GREY, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {it.label}
          </Text>
          <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1C1C1C" }}>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

/** Carte KPI (valeur en avant, sous-label optionnel). */
export function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <View
      style={[
        s.card,
        { flex: 1, borderWidth: 0.75, borderColor: SOFT, backgroundColor: WHITE, paddingVertical: 9 },
      ]}
    >
      <Text style={{ fontSize: 6, color: GREY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: accent ? GOLD : "#1C1C1C" }}>
        {value}
      </Text>
      {sub ? <Text style={{ fontSize: 6, color: GREY, marginTop: 2 }}>{sub}</Text> : null}
    </View>
  );
}
