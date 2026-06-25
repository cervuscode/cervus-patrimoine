import { Text, View } from "@react-pdf/renderer";
import type { ComparateurModel } from "@/lib/compte-rendu";
import { GOLD, BROWN, GREY, SOFT, WHITE, fmt, fmtK, SectionTitle } from "../pdf-theme";

/**
 * Bloc PDF « Comparateur Assurance-vie / PER » (Lot 11).
 * Convention EFFORT NET ÉGAL : le PER reçoit l'effort majoré (économie d'impôt intégrée
 * dès le versement). Tableau AV vs PER + barres comparées + verdict pédagogique.
 */
export default function ComparateurBlock({ model }: { model: ComparateurModel }) {
  const max = Math.max(model.perCapitalNet, model.avCapitalNet, 1);
  const perWin = model.gagnant === "per";
  const avWin = model.gagnant === "av";

  return (
    <View style={{ marginBottom: 16 }} wrap={false}>
      <SectionTitle>Comparateur Assurance-vie / PER — à effort net égal</SectionTitle>

      <Text style={{ fontSize: 7, color: GREY, marginBottom: 8 }}>
        Effort net du client : {fmt(model.effortNetMensuel)}/mois
        {model.effortNetInitial > 0 ? ` + ${fmt(model.effortNetInitial)} d'apport` : ""} · horizon{" "}
        {model.horizon} ans · {model.profilLabel}. Côté PER, l&apos;économie d&apos;impôt (TMI{" "}
        {model.tmi} %) est réinvestie dès le versement.
      </Text>

      {/* Tableau */}
      <View style={{ borderWidth: 0.6, borderColor: SOFT, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
        <View style={{ flexDirection: "row", backgroundColor: GOLD }}>
          <Head flex={2}>Solution</Head>
          <Head flex={2} right>Versement</Head>
          <Head flex={2} right>Capital net projeté</Head>
        </View>
        <Row
          label="PER"
          sub={`effort majoré (${fmt(model.perMensuel)}/mois)`}
          versement={`${fmt(model.perMensuel)}/mois`}
          capital={fmtK(model.perCapitalNet)}
          highlight={perWin}
          zebra={0}
        />
        <Row
          label="Assurance-vie"
          sub={`effort net (${fmt(model.effortNetMensuel)}/mois)`}
          versement={`${fmt(model.effortNetMensuel)}/mois`}
          capital={fmtK(model.avCapitalNet)}
          highlight={avWin}
          zebra={1}
        />
      </View>

      {/* Barres comparées */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
        <Bar label="PER" value={model.perCapitalNet} max={max} color={GOLD} win={perWin} />
        <Bar label="Assurance-vie" value={model.avCapitalNet} max={max} color={BROWN} win={avWin} />
      </View>

      {/* Verdict */}
      <View style={{ backgroundColor: WHITE, borderWidth: 0.75, borderColor: GOLD, borderRadius: 8, padding: 8 }}>
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: GOLD, marginBottom: 2 }}>
          {model.verdictTitre}
        </Text>
        <Text style={{ fontSize: 7.5, color: "#1C1C1C", lineHeight: 1.35 }}>{model.verdictMessage}</Text>
      </View>
    </View>
  );
}

function Head({ children, flex, right }: { children: React.ReactNode; flex: number; right?: boolean }) {
  return (
    <Text
      style={{
        flex,
        paddingVertical: 5,
        paddingHorizontal: 8,
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

function Row({
  label,
  sub,
  versement,
  capital,
  highlight,
  zebra,
}: {
  label: string;
  sub: string;
  versement: string;
  capital: string;
  highlight: boolean;
  zebra: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: highlight ? "#F3ECE4" : zebra % 2 === 0 ? WHITE : "#FAF7F4",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 2, paddingVertical: 6, paddingHorizontal: 8 }}>
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1C1C1C" }}>{label}</Text>
        <Text style={{ fontSize: 6, color: GREY }}>{sub}</Text>
      </View>
      <View style={{ flex: 2, paddingVertical: 6, paddingHorizontal: 8 }}>
        <Text style={{ fontSize: 8, color: "#1C1C1C", textAlign: "right" }}>{versement}</Text>
      </View>
      <View style={{ flex: 2, paddingVertical: 6, paddingHorizontal: 8 }}>
        <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: highlight ? GOLD : "#1C1C1C", textAlign: "right" }}>
          {capital}
        </Text>
      </View>
    </View>
  );
}

function Bar({
  label,
  value,
  max,
  color,
  win,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  win: boolean;
}) {
  const BAR_W = 100; // largeur logique max
  const w = Math.max(2, (value / max) * BAR_W);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
        <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#1C1C1C" }}>
          {label}
          {win ? "  ✓" : ""}
        </Text>
        <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color }}>{fmtK(value)}</Text>
      </View>
      <View style={{ height: 12, backgroundColor: "#EFE7E0", borderRadius: 3, overflow: "hidden" }}>
        <View style={{ width: `${w}%`, height: 12, backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}
