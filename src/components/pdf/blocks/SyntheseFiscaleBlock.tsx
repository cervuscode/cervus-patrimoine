import { Text, View } from "@react-pdf/renderer";
import type { SyntheseFiscaleModel } from "@/lib/compte-rendu";
import {
  s,
  WHITE,
  GOLD,
  GREY,
  SOFT,
  fmt,
  fmtPct,
  chipText,
  SectionTitle,
} from "../pdf-theme";

/**
 * Bloc PDF « Synthèse fiscale » (Lot 11).
 * Données 100 % pré-calculées dans `compte-rendu.buildRenderModel` — ZÉRO calcul ici.
 * Impôt net + TMI + taux moyen (3 cartes) puis tableau des tranches.
 */
export default function SyntheseFiscaleBlock({ model }: { model: SyntheseFiscaleModel }) {
  return (
    <View style={{ marginBottom: 16 }} wrap={false}>
      <SectionTitle>Synthèse fiscale</SectionTitle>

      {/* 3 chiffres clés */}
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
        <KpiCard label="Impôt net" value={fmt(model.impotNet)} accent />
        <KpiCard label="TMI effective" value={`${model.tmi} %`} accent />
        <KpiCard label="Taux moyen" value={fmtPct(model.tauxMoyen)} accent />
      </View>

      {/* Tableau des tranches */}
      <Text style={{ fontSize: 7, color: GREY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
        Répartition du revenu par tranche
      </Text>
      <View style={{ borderWidth: 0.6, borderColor: SOFT, borderRadius: 6, overflow: "hidden" }}>
        {/* En-tête */}
        <View style={{ flexDirection: "row", backgroundColor: GOLD }}>
          <HeadCell flex={1.2}>Tranche</HeadCell>
          <HeadCell flex={2.4}>Seuil (par part)</HeadCell>
          <HeadCell flex={2} right>Revenu dans la tranche</HeadCell>
          <HeadCell flex={1.6} right>Impôt généré</HeadCell>
        </View>
        {/* Lignes */}
        {model.slices.map((sl, i) => (
          <View
            key={sl.taux}
            style={{
              flexDirection: "row",
              backgroundColor: i % 2 === 0 ? WHITE : "#FAF7F4",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1.2, paddingVertical: 5, paddingHorizontal: 6 }}>
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: sl.color,
                  borderRadius: 3,
                  paddingVertical: 2,
                  paddingHorizontal: 6,
                }}
              >
                <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: chipText(sl.color) }}>
                  {sl.label}
                </Text>
              </View>
            </View>
            <Cell flex={2.4}>{seuilLabel(sl.taux)}</Cell>
            <Cell flex={2} right>{fmt(sl.montant)}</Cell>
            <Cell flex={1.6} right bold>{fmt(sl.impot)}</Cell>
          </View>
        ))}
        {/* Pied — réconciliation honnête barème → net (avantage QF plafonné / décote) */}
        {model.ecartLabel ? (
          <>
            <View style={{ flexDirection: "row", backgroundColor: "#EFE7E0", alignItems: "center" }}>
              <Cell flex={1.2} bold>Total barème</Cell>
              <Cell flex={2.4}> </Cell>
              <Cell flex={2} right>{fmt(model.revenuNet)}</Cell>
              <Cell flex={1.6} right bold>{fmt(model.totalBareme)}</Cell>
            </View>
            <View style={{ flexDirection: "row", backgroundColor: "#EFE7E0", alignItems: "center" }}>
              <Cell flex={5.6}>− {model.ecartLabel}</Cell>
              <Cell flex={1.6} right>{`- ${fmt(model.ecart)}`}</Cell>
            </View>
            <View style={{ flexDirection: "row", backgroundColor: "#E6DACF", alignItems: "center" }}>
              <Cell flex={5.6} bold>= Impôt net</Cell>
              <View style={{ flex: 1.6, paddingVertical: 5, paddingHorizontal: 6 }}>
                <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: GOLD, textAlign: "right" }}>
                  {fmt(model.impotNet)}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={{ flexDirection: "row", backgroundColor: "#E6DACF", alignItems: "center" }}>
            <Cell flex={1.2} bold>Total</Cell>
            <Cell flex={2.4}> </Cell>
            <Cell flex={2} right bold>{fmt(model.revenuNet)}</Cell>
            <View style={{ flex: 1.6, paddingVertical: 5, paddingHorizontal: 6 }}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: GOLD, textAlign: "right" }}>
                {fmt(model.impotNet)}
              </Text>
            </View>
          </View>
        )}
      </View>
      {model.ecartLabel && (
        <Text style={{ fontSize: 6.5, color: GREY, marginTop: 4 }}>
          {model.ecartLabel === "Décote"
            ? "La décote réduit l'impôt des foyers modestes : la somme des tranches dépasse l'impôt réellement dû."
            : "Le quotient familial est plafonné : la somme des tranches reflète le barème, l'avantage familial est limité par la loi."}
        </Text>
      )}
    </View>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View
      style={[
        s.card,
        { flex: 1, alignItems: "center", borderWidth: 0.75, borderColor: "#EDE7E1", paddingVertical: 10 },
      ]}
    >
      <Text style={[s.cardLbl, { textAlign: "center" }]}>{label}</Text>
      <Text
        style={{
          fontSize: 16,
          fontFamily: "Helvetica-Bold",
          color: accent ? GOLD : "#1C1C1C",
          textAlign: "center",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function HeadCell({ children, flex, right }: { children: React.ReactNode; flex: number; right?: boolean }) {
  return (
    <Text
      style={{
        flex,
        paddingVertical: 5,
        paddingHorizontal: 6,
        fontSize: 6.5,
        fontFamily: "Helvetica-Bold",
        color: WHITE,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        textAlign: right ? "right" : "left",
      }}
    >
      {children}
    </Text>
  );
}

function Cell({
  children,
  flex,
  right,
  bold,
}: {
  children: React.ReactNode;
  flex: number;
  right?: boolean;
  bold?: boolean;
}) {
  return (
    <Text
      style={{
        flex,
        paddingVertical: 5,
        paddingHorizontal: 6,
        fontSize: 8,
        fontFamily: bold ? "Helvetica-Bold" : "Helvetica",
        color: "#1C1C1C",
        textAlign: right ? "right" : "left",
      }}
    >
      {children}
    </Text>
  );
}

/** Libellé du seuil de tranche (barème 2026, par part) — purement informatif. */
function seuilLabel(taux: number): string {
  switch (taux) {
    case 0:
      return "0 – 11 600 €";
    case 0.11:
      return "11 600 – 29 579 €";
    case 0.3:
      return "29 579 – 84 577 €";
    case 0.41:
      return "84 577 – 181 917 €";
    case 0.45:
      return "au-delà de 181 917 €";
    default:
      return "";
  }
}
