import { Text, View } from "@react-pdf/renderer";
import type { PerFullModel } from "@/lib/compte-rendu";
import { GOLD, GREY, WHITE, SOFT, fmt, fmtK, fmtPct, SectionTitle } from "../pdf-theme";
import { CourbeCapital } from "../pdf-charts";
import { ParamPills } from "./_sim-shared";

/**
 * Bloc PDF « Simulation PER complet » (Lot 11). Paramètres + capital projeté + courbe +
 * les 3 sorties (capital intégral net / fractionné mensuel / rente mensuelle estimée).
 */
export default function PerFullBlock({ model }: { model: PerFullModel }) {
  return (
    <View style={{ marginBottom: 16 }} wrap={false}>
      <SectionTitle>Simulation PER complet — sorties à la retraite</SectionTitle>

      <ParamPills
        items={[
          { label: "Versement", value: `${fmt(model.versementMensuel)}/mois` },
          ...(model.versementInitial > 0
            ? [{ label: "Apport initial", value: fmt(model.versementInitial) }]
            : []),
          { label: "Horizon", value: `${model.horizon} ans` },
          { label: "Profil", value: model.profilLabel },
          { label: "Rendement", value: fmtPct(model.tauxPct) },
          { label: "Tranche sortie", value: `${model.trancheSortie} %` },
        ]}
      />

      {/* Capital accumulé + courbe */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 8, alignItems: "flex-start" }}>
        <View style={{ width: 130, gap: 4 }}>
          <Line label="Capital au terme" value={fmtK(model.capitalFinal)} bold />
          <Line label="Versements cumulés" value={fmtK(model.versementsCumules)} />
          <Line label="Plus-value" value={fmtK(model.plusValue)} />
        </View>
        <View style={{ flex: 1 }}>
          <CourbeCapital data={model.courbe} color={GOLD} height={92} />
        </View>
      </View>

      {/* 3 sorties */}
      <Text style={{ fontSize: 7, color: GREY, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 8, marginBottom: 3 }}>
        Trois modes de sortie
      </Text>
      <View style={{ flexDirection: "row", gap: 6 }}>
        <SortieCard
          titre="Capital intégral"
          principal={fmtK(model.sortie1Net)}
          principalLbl="net après impôt"
          detail={`Sortie en une fois, versements à ${model.trancheSortie} % + plus-value au PFU 30 %.`}
        />
        <SortieCard
          titre="Fractionné 20 ans"
          principal={`${fmt(model.sortie2EquivMensuel)}/mois`}
          principalLbl={`net total ${fmtK(model.sortie2Net)}`}
          detail="Retrait étalé, solde non sorti placé à 2 %/an."
        />
        <SortieCard
          titre="Rente viagère"
          principal={
            model.sortie3Disponible ? `${fmt(model.sortie3RenteMensuelle)}/mois` : "Non disponible"
          }
          principalLbl={
            model.sortie3Disponible ? `nette ${fmtK(model.sortie3RenteNetteAnnuelle)}/an` : "à cet âge"
          }
          detail={`Conversion à ${model.ageConversion} ans (table Abeille), fiscalité RVTO.`}
        />
      </View>
    </View>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
      <Text style={{ fontSize: 7, color: GREY }}>{label}</Text>
      <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: bold ? GOLD : "#1C1C1C" }}>{value}</Text>
    </View>
  );
}

function SortieCard({
  titre,
  principal,
  principalLbl,
  detail,
}: {
  titre: string;
  principal: string;
  principalLbl: string;
  detail: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: WHITE,
        borderWidth: 0.75,
        borderColor: SOFT,
        borderRadius: 8,
        padding: 8,
      }}
    >
      <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: GREY, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
        {titre}
      </Text>
      <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: GOLD }}>{principal}</Text>
      <Text style={{ fontSize: 6.5, color: GREY, marginTop: 1 }}>{principalLbl}</Text>
      <Text style={{ fontSize: 6.5, color: "#5D4738", marginTop: 5, lineHeight: 1.3 }}>{detail}</Text>
    </View>
  );
}
