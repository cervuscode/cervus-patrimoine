import { Text, View } from "@react-pdf/renderer";
import type { ReductionModel, ReductionSlice } from "@/lib/compte-rendu";
import { TRANCHES_AFFICHAGE } from "@/lib/reduction-impot";
import { GOLD, GREY, SOFT, WHITE, DARK, fmt, SectionTitle } from "../pdf-theme";

/**
 * Bloc PDF « Réduction d'impôt » (Lot 11 — refonte). Reproduit fidèlement le visuel
 * du simulateur conseiller (ReductionStacks) : deux barres empilées côte à côte, une
 * bande par tranche TMI (couleurs charte, « TMI% · montant »), la barre « avec
 * versement » affichant un bloc fantôme pointillé pour la portion sortie des tranches
 * hautes. Impôt total sous chaque barre + 3 KPI + légende.
 */
const BAR_H = 132; // hauteur de référence des colonnes (échelle commune sur revenuAvant)

export default function ReductionBlock({ model }: { model: ReductionModel }) {
  const ref = Math.max(model.revenuAvant, 1);
  const scale = BAR_H / ref;
  const ghostPx = model.montantEfface * scale;

  const eff = model.tranchesEffacees;
  // Tiret ASCII (le « − » U+2212 n'existe pas dans l'encodage Helvetica du PDF).
  const ghostLabel =
    eff.length === 1
      ? `- ${fmt(model.montantEfface)} sortis de la tranche ${eff[0].label}`
      : `- ${fmt(model.montantEfface)} sortis des tranches hautes`;

  return (
    <View style={{ marginBottom: 16 }} wrap={false}>
      <SectionTitle>Mécanisme de réduction d&apos;impôt</SectionTitle>

      <Text style={{ fontSize: 7.5, color: GREY, marginBottom: 10 }}>
        {model.situation} · revenu {fmt(model.revenuAvant)} · versement PER déductible{" "}
        {fmt(model.versementPer)}
        {model.montantEfface < model.versementPer ? ` (déduit : ${fmt(model.montantEfface)})` : ""}.
      </Text>

      <View style={{ flexDirection: "row", gap: 18, alignItems: "flex-start" }}>
        {/* Visuel deux colonnes empilées par tranche */}
        <View style={{ flexDirection: "row", gap: 18, alignItems: "flex-end" }}>
          <StackCol titre="Sans versement" slices={model.slicesAvant} scale={scale} impot={model.impotAvant} />
          <StackCol
            titre="Avec versement"
            slices={model.slicesApres}
            scale={scale}
            impot={model.impotApres}
            ghostPx={ghostPx > 1 ? ghostPx : 0}
            ghostLabel={ghostLabel}
          />
        </View>

        {/* 3 KPI + légende */}
        <View style={{ flex: 1, gap: 5 }}>
          <Kpi label="Impôt sans versement" value={fmt(model.impotAvant)} />
          <Kpi label="Impôt avec versement" value={fmt(model.impotApres)} />
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
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK }}>Économie d&apos;impôt</Text>
            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: GOLD }}>{fmt(model.economie)}/an</Text>
          </View>

          {model.tmiChange && (
            <Text style={{ fontSize: 6.5, color: GREY }}>
              Le versement fait passer la tranche marginale de {model.tmiAvant} % à {model.tmiApres} %.
            </Text>
          )}

          {/* Légende couleurs tranches */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {TRANCHES_AFFICHAGE.map((t) => (
              <View key={t.taux} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <View style={{ width: 8, height: 8, backgroundColor: t.color, borderWidth: 0.5, borderColor: SOFT, borderRadius: 2 }} />
                <Text style={{ fontSize: 6, color: GREY }}>{t.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function StackCol({
  titre,
  slices,
  scale,
  impot,
  ghostPx = 0,
  ghostLabel,
}: {
  titre: string;
  slices: ReductionSlice[];
  scale: number;
  impot: number;
  ghostPx?: number;
  ghostLabel?: string;
}) {
  // Tranches hautes en haut de la colonne (sens « le sommet du revenu sort en premier »).
  const top = [...slices].reverse();
  return (
    <View style={{ alignItems: "center", width: 96 }}>
      <View style={{ height: BAR_H + 26, justifyContent: "flex-end", width: "100%" }}>
        {/* Bloc fantôme : portion sortie des tranches hautes (pointillés). */}
        {ghostPx > 0 && (
          <View
            style={{
              height: Math.max(ghostPx, 16),
              borderWidth: 0.75,
              borderStyle: "dashed",
              borderColor: GOLD,
              borderRadius: 4,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 2,
              marginBottom: 2,
            }}
          >
            <Text style={{ fontSize: 5.5, color: GOLD, textAlign: "center" }}>{ghostLabel}</Text>
          </View>
        )}
        {/* Bandes par tranche, du haut (taux élevé) vers le bas. */}
        {top.map((sl) => {
          const h = sl.montant * scale;
          const dark = sl.taux <= 0.11;
          return (
            <View
              key={sl.taux}
              style={{
                height: h,
                backgroundColor: sl.color,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {h >= 12 && (
                <Text style={{ fontSize: 5.5, color: dark ? "#5D4738" : "#F2EDE8", textAlign: "center" }}>
                  {sl.label} · {fmt(sl.montant)}
                </Text>
              )}
            </View>
          );
        })}
      </View>
      <Text style={{ fontSize: 7, color: GREY, marginTop: 4 }}>{titre}</Text>
      <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK }}>{fmt(impot)}</Text>
    </View>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
      <Text style={{ fontSize: 7.5, color: GREY }}>{label}</Text>
      <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: DARK }}>{value}</Text>
    </View>
  );
}
