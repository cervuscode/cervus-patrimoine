import { Text, View } from "@react-pdf/renderer";
import type { PerQuickModel } from "@/lib/compte-rendu";
import { GOLD, GREY, fmt, fmtK, fmtPct, SectionTitle } from "../pdf-theme";
import { CourbeCapital } from "../pdf-charts";
import { ParamPills, KpiCard } from "./_sim-shared";

/**
 * Bloc PDF « Simulation PER rapide » (Lot 11). Paramètres + résultats clés + courbe SVG.
 * Données pré-calculées (computePerQuick côté serveur) — ZÉRO calcul ici.
 */
export default function PerQuickBlock({ model }: { model: PerQuickModel }) {
  return (
    <View style={{ marginBottom: 16 }} wrap={false}>
      <SectionTitle>Simulation PER — épargne projetée</SectionTitle>

      <ParamPills
        items={[
          { label: "Versement", value: `${fmt(model.versementMensuel)}/mois` },
          ...(model.versementInitial > 0
            ? [{ label: "Apport initial", value: fmt(model.versementInitial) }]
            : []),
          { label: "Horizon", value: `${model.horizon} ans` },
          { label: "Profil", value: model.profilLabel },
          { label: "Rendement", value: fmtPct(model.tauxPct) },
        ]}
      />

      <View style={{ flexDirection: "row", gap: 6, marginTop: 8, marginBottom: 8 }}>
        <KpiCard label="Capital projeté" value={fmtK(model.capitalFinal)} sub={`dans ${model.horizon} ans`} accent />
        <KpiCard
          label="Économie fiscale"
          value={fmt(model.economieFiscale)}
          sub={`par an · TMI ${model.tmi} %`}
          accent
        />
        <KpiCard label="Total versé" value={fmtK(model.totalVerse)} sub="sur la période" />
      </View>

      <Text style={{ fontSize: 7, color: GREY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>
        Évolution du capital
      </Text>
      <CourbeCapital data={model.courbe} color={GOLD} />
    </View>
  );
}
