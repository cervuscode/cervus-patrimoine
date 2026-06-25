import { Text, View } from "@react-pdf/renderer";
import type { ReductionModel } from "@/lib/compte-rendu";
import { GOLD, BROWN, GREY, SOFT, WHITE, fmt, SectionTitle } from "../pdf-theme";

/**
 * Bloc PDF « Réduction d'impôt » (Lot 11). Situation + versement PER illustré, impôt
 * avant/après, économie annuelle, et visuel à deux barres proportionnelles (avant/après).
 */
export default function ReductionBlock({ model }: { model: ReductionModel }) {
  const max = Math.max(model.impotAvant, model.impotApres, 1);
  const BAR_H = 90;
  const hAvant = Math.max(2, (model.impotAvant / max) * BAR_H);
  const hApres = Math.max(2, (model.impotApres / max) * BAR_H);

  return (
    <View style={{ marginBottom: 16 }} wrap={false}>
      <SectionTitle>Mécanisme de réduction d&apos;impôt</SectionTitle>

      <Text style={{ fontSize: 7.5, color: GREY, marginBottom: 8 }}>
        {model.situation} · revenu {fmt(model.revenuAvant)} · versement PER déductible{" "}
        {fmt(model.versementPer)}
        {model.montantEfface < model.versementPer ? ` (déduit : ${fmt(model.montantEfface)})` : ""}.
      </Text>

      <View style={{ flexDirection: "row", gap: 14, alignItems: "flex-end" }}>
        {/* Visuel deux barres */}
        <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-end", height: BAR_H + 18, paddingTop: 4 }}>
          <BarCol label="Avant" value={model.impotAvant} h={hAvant} barH={BAR_H} color={BROWN} tmi={model.tmiAvant} />
          <BarCol label="Après" value={model.impotApres} h={hApres} barH={BAR_H} color={GOLD} tmi={model.tmiApres} />
        </View>

        {/* Synthèse chiffrée */}
        <View style={{ flex: 1, gap: 5 }}>
          <KvRow label="Impôt avant" value={fmt(model.impotAvant)} />
          <KvRow label="Impôt après" value={fmt(model.impotApres)} />
          <View style={{ height: 0.5, backgroundColor: SOFT, marginVertical: 1 }} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: WHITE,
              borderWidth: 0.75,
              borderColor: GOLD,
              borderRadius: 6,
              padding: 7,
            }}
          >
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1C1C1C" }}>Économie d&apos;impôt</Text>
            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: GOLD }}>{fmt(model.economie)}/an</Text>
          </View>
          {model.tmiChange && (
            <Text style={{ fontSize: 6.5, color: GREY }}>
              Le versement fait passer la tranche marginale de {model.tmiAvant} % à {model.tmiApres} %.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function BarCol({
  label,
  value,
  h,
  barH,
  color,
  tmi,
}: {
  label: string;
  value: number;
  h: number;
  barH: number;
  color: string;
  tmi: number;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "flex-end" }}>
      <Text style={{ fontSize: 6.5, fontFamily: "Helvetica-Bold", color, marginBottom: 2 }}>{fmt(value)}</Text>
      <View style={{ height: barH, justifyContent: "flex-end" }}>
        <View style={{ width: 34, height: h, backgroundColor: color, borderRadius: 2 }} />
      </View>
      <Text style={{ fontSize: 7, color: "#1C1C1C", marginTop: 3 }}>{label}</Text>
      <Text style={{ fontSize: 5.5, color: GREY }}>TMI {tmi} %</Text>
    </View>
  );
}

function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
      <Text style={{ fontSize: 7.5, color: GREY }}>{label}</Text>
      <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1C1C1C" }}>{value}</Text>
    </View>
  );
}
