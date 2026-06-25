import { Text, View } from "@react-pdf/renderer";
import type { AvModel } from "@/lib/compte-rendu";
import { GOLD, GREY, fmt, fmtK, SectionTitle } from "../pdf-theme";
import { CourbeCapital } from "../pdf-charts";
import { ParamPills, KpiCard } from "./_sim-shared";

/**
 * Bloc PDF « Simulation Assurance-vie » (Lot 11).
 * ⚠️ VOCABULAIRE CONFIDENTIEL : jamais « purge » / « rachat » / « avec-sans Cervus ».
 * Libellé pudique « Capital net optimisé — avec accompagnement Cervus Patrimoine ».
 * Gain d'optimisation affiché seulement si pertinent (optimisationUtile).
 */
export default function AvBlock({ model }: { model: AvModel }) {
  return (
    <View style={{ marginBottom: 16 }} wrap={false}>
      <SectionTitle>Simulation Assurance-vie</SectionTitle>

      <ParamPills
        items={[
          ...(model.versementInitial > 0
            ? [{ label: "Apport initial", value: fmt(model.versementInitial) }]
            : []),
          { label: "Versement", value: `${fmt(model.versementMensuel)}/mois` },
          { label: "Durée", value: `${model.dureeAnnees} ans` },
          { label: "Profil", value: model.profilLabel },
          { label: "Situation", value: model.marie ? "Marié(e) / pacsé(e)" : "Seul(e)" },
        ]}
      />

      <View style={{ flexDirection: "row", gap: 6, marginTop: 8, marginBottom: 8 }}>
        <KpiCard label="Capital au terme" value={fmtK(model.capitalFinalBrut)} sub="valeur brute" />
        <KpiCard label="Capital net" value={fmtK(model.capitalNet)} sub="après fiscalité" />
        <KpiCard
          label="Capital net optimisé"
          value={fmtK(model.capitalNetOptimise)}
          sub="avec accompagnement Cervus Patrimoine"
          accent
        />
        {model.optimisationUtile && (
          <KpiCard label="Gain de l'optimisation" value={fmt(model.gainOptimisation)} sub="vs sans" accent />
        )}
      </View>

      <Text style={{ fontSize: 7, color: GREY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>
        Évolution de la valeur du contrat
      </Text>
      <CourbeCapital data={model.courbe} color={GOLD} />

      <Text style={{ fontSize: 6.5, color: GREY, marginTop: 3 }}>
        Total versé sur la période : {fmt(model.totalVerse)}.
      </Text>
    </View>
  );
}
