import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";

// ── Design tokens ─────────────────────────────────────────────────────────────
const CREAM  = "#F2EDE8";
const WHITE  = "#ffffff";
const GOLD   = "#795D48";
const BROWN  = "#5D4738";
const DARK   = "#1C1C1C";
const GREY   = "#888888";
const SOFT   = "#D4C9BE";
const TAUPE  = "#C4B8B0"; // gain fiscal segment — darker than CREAM for visibility on cream bg

const LOGO_PATH    = process.cwd() + "/public/cervus_logo.png";
const CALENDLY_RAW = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "cervuspatrimoine.fr/rendez-vous";
const CALENDLY     = CALENDLY_RAW.startsWith("http") ? CALENDLY_RAW : "https://" + CALENDLY_RAW;

// ── Number formatting ─────────────────────────────────────────────────────────
// toLocaleString("fr-FR") uses \u00a0 as thousands sep → renders as "/" in PDF fonts.
// Manual formatter uses regular space instead.
function fmtNum(n: number): string {
  const a = Math.round(Math.abs(n));
  const s = a.toString();
  let r = "";
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) r += " ";
    r += s[i];
  }
  return (n < 0 ? "-" : "") + r;
}
function fmt(n: number): string {
  return fmtNum(n) + " \u20AC";
}
function fmtK(n: number): string {
  if (Math.abs(n) >= 10000) return Math.round(n / 1000) + " k\u20AC";
  return fmtNum(n) + " \u20AC";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUT_LABELS: Record<string, string> = {
  celibataire:  "Célibataire",
  divorce:      "Divorcé(e)",
  marie:        "Marié(e)",
  pacse:        "Pacsé(e)",
  parent_isole: "Parent isolé",
};
const PROFIL_LABELS: Record<string, string> = {
  prudent:   "Prudent",
  equilibre: "Équilibré",
  dynamique: "Dynamique",
};

function displayStatut(data: SimulateurData): string {
  if (
    (data.statut === "celibataire" || data.statut === "divorce") &&
    data.nbEnfants > 0 &&
    data.gardeParentale === "parent_isole"
  ) return "Parent isolé";
  return STATUT_LABELS[data.statut] ?? data.statut;
}

// ── StyleSheet ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 44,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: DARK,
    backgroundColor: CREAM,
  },
  secTitle: {
    fontFamily: "Times-Roman",
    fontSize: 13,
    color: DARK,
    letterSpacing: 0.4,
  },
  secLine: {
    height: 0.6,
    backgroundColor: GOLD,
    marginTop: 3,
    marginBottom: 8,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 8,
  },
  cardLbl: {
    fontSize: 6,
    color: GREY,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  cardVal: { fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK },
  cardAcc: { fontSize: 10, fontFamily: "Helvetica-Bold", color: GOLD },
  cardSub: { fontSize: 6.5, color: GREY, marginTop: 2 },
  footer:  {
    position: "absolute",
    bottom: 14,
    left: 36,
    right: 36,
    fontSize: 6,
    color: GREY,
    textAlign: "center",
    borderTopWidth: 0.4,
    borderTopColor: SOFT,
    paddingTop: 5,
  },
});

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  data: SimulateurData;
  computed: ComputedResults;
}

export default function PdfDocument({ data, computed }: Props) {
  const vMens = parseFloat(data.versementMensuel) || 0;
  const vInit = parseFloat(data.versementInitial) || 0;

  // Fiscal calculations — use pre-computed values from compute()
  const impotAvant   = computed.impotAvant;
  const impotApres   = computed.impotApres;
  const economieAnn  = impotAvant - impotApres;
  const coutReel     = computed.economieMensuelle;
  const pasMensAvant = computed.pasMensAvant;
  const pasMensApres = computed.pasMensApres;

  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  // ── Annual chart data ───────────────────────────────────────────────────────
  const canProject = computed.nAnnees > 0 && vMens > 0 && computed.courbe.length > 0;
  const BAR_H = 88;

  type Bar = {
    yr: number; annee: number; capital: number;
    versAcc: number; gainAcc: number; pv: number;
    totalVisual: number;
    barH: number; pvFlex: number; versFlex: number; gainFlex: number;
  };

  const bars: Bar[] = (() => {
    if (!canProject) return [];
    const raw = computed.courbe.map((pt, i) => {
      const yr      = i + 1;
      const versAcc = vMens * 12 * yr + vInit;
      const gainAcc = economieAnn * yr;
      const pv      = Math.max(0, pt.capital - versAcc);
      const total   = gainAcc + pt.capital; // gain fiscal + (versements + plus-value)
      return { yr, annee: pt.annee, capital: pt.capital, versAcc, gainAcc, pv, totalVisual: total };
    });
    const maxTotal = Math.max(...raw.map(d => d.totalVisual), 1);
    return raw.map(d => {
      const barH = Math.max((d.totalVisual / maxTotal) * BAR_H, 1);
      const tot  = Math.max(d.totalVisual, 1);
      // flex values are proportional to segment height within the bar
      return {
        ...d,
        barH,
        pvFlex:   Math.max(d.pv      / tot, 0.001),
        versFlex: Math.max(d.versAcc / tot, 0.001),
        gainFlex: Math.max(d.gainAcc / tot, 0.001),
      };
    });
  })();

  const showYrLabel = (b: Bar) => b.yr === 1 || b.yr % 5 === 0 || b.yr === bars.length;

  // Impact cards (replace table)
  const impactCards = [
    { label: "Impôt annuel",        avant: fmt(impotAvant),   apres: fmt(impotApres),   sub: null },
    { label: "PAS mensuel",          avant: fmt(pasMensAvant), apres: fmt(pasMensApres), sub: null },
    { label: "Économie fiscale",     avant: null,              apres: fmt(economieAnn),  sub: "par an" },
    { label: "Coût réel versement",  avant: fmt(vMens),        apres: fmt(coutReel),     sub: "par mois" },
  ];

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── 1. EN-TÊTE ──────────────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={LOGO_PATH} style={{ width: 38, height: 38 }} />
            <View>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 15, color: GREY, letterSpacing: 1 }}>
                Simulation PER
              </Text>
              <Text style={{ fontFamily: "Times-Bold", fontSize: 16, color: DARK, letterSpacing: 0.5 }}>
                {data.prenom} {data.nom}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: GOLD, letterSpacing: 1.5 }}>
              CERVUS PATRIMOINE
            </Text>
            <Text style={{ fontSize: 6.5, color: GREY, marginTop: 2 }}>
              Conseil indépendant
            </Text>
            <Text style={{ fontSize: 6, color: GREY, marginTop: 1 }}>
              {dateStr}
            </Text>
          </View>
        </View>

        <View style={{ height: 0.6, backgroundColor: GOLD, marginBottom: 14 }} />

        {/* ── 2. KPI CARDS ────────────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}>
          {/* Situation */}
          <View style={[s.card, { flex: 2 }]}>
            <Text style={s.cardLbl}>Situation</Text>
            <Text style={s.cardVal}>
              {displayStatut(data)}
              {data.nbEnfants > 0 ? " · " + data.nbEnfants + " enfant" + (data.nbEnfants > 1 ? "s" : "") : ""}
            </Text>
            <Text style={s.cardSub}>
              {computed.partsTotal} parts · {PROFIL_LABELS[data.profil] ?? data.profil}
            </Text>
          </View>
          {/* TMI */}
          <View style={[s.card, { flex: 1, alignItems: "center", justifyContent: "center" }]}>
            <Text style={[s.cardLbl, { textAlign: "center" }]}>TMI</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 22, color: GOLD, textAlign: "center" }}>
              {computed.tmi}%
            </Text>
          </View>
          {/* Économie */}
          <View style={[s.card, { flex: 1.6 }]}>
            <Text style={s.cardLbl}>Économie / an</Text>
            <Text style={s.cardAcc}>{fmt(economieAnn)}</Text>
            <Text style={s.cardSub}>{"soit " + fmt(Math.round(economieAnn / 12)) + "/mois"}</Text>
          </View>
          {/* Capital */}
          <View style={[s.card, { flex: 1.6 }]}>
            <Text style={s.cardLbl}>Capital projeté</Text>
            <Text style={s.cardAcc}>{fmtK(computed.capitalFinal)}</Text>
            <Text style={s.cardSub}>{"dans " + computed.nAnnees + " ans"}</Text>
          </View>
        </View>

        {/* ── 3. IMPACT FISCAL — 4 cards ──────────────────────────────────── */}
        <View style={{ marginBottom: 12 }}>
          <Text style={s.secTitle}>{"L'impact fiscal de vos versements"}</Text>
          <View style={s.secLine} />
          <View style={{ flexDirection: "row", gap: 6 }}>
            {impactCards.map((card, i) => (
              <View key={i} style={{
                flex: 1,
                backgroundColor: WHITE,
                borderRadius: 12,
                padding: 10,
                borderWidth: 0.75,
                borderColor: "#EDE7E1",
              }}>
                {/* Label */}
                <Text style={{ fontSize: 6, color: GREY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                  {card.label}
                </Text>
                {/* Avant barré */}
                {card.avant !== null ? (
                  <Text style={{ fontSize: 7.5, color: "#C4B8B0", textDecoration: "line-through", marginBottom: 3 }}>
                    {card.avant}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 7.5, color: "#D4C9BE", marginBottom: 3 }}>
                    sans PER
                  </Text>
                )}
                {/* Après — valeur principale */}
                <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: GOLD }}>
                  {card.apres}
                </Text>
                {/* Sous-label optionnel */}
                {card.sub && (
                  <Text style={{ fontSize: 6, color: GREY, marginTop: 2 }}>{card.sub}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ── 4. GRAPHIQUE ANNUEL ─────────────────────────────────────────── */}
        {canProject && (
          <View style={{ marginBottom: 10 }}>
            <Text style={s.secTitle}>
              {"Projection d'épargne — " + computed.nAnnees + " ans · " + (PROFIL_LABELS[data.profil] ?? data.profil)}
            </Text>
            <View style={s.secLine} />

            {/* Capital label above last bar */}
            <View style={{ flexDirection: "row", height: 11, marginBottom: 2 }}>
              {bars.map((b, i) => (
                <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
                  {i === bars.length - 1 && (
                    <Text style={{ fontSize: 5.5, color: GOLD, fontFamily: "Helvetica-Bold" }}>
                      {fmtK(b.totalVisual)}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Bars — anchored to bottom, each bar is 60% of its slot width */}
            <View style={{ flexDirection: "row", alignItems: "flex-end", height: BAR_H }}>
              {bars.map((b, i) => (
                <View key={i} style={{ flex: 1, height: BAR_H, alignItems: "center", justifyContent: "flex-end" }}>
                  <View style={{ width: "58%", height: b.barH, flexDirection: "column", overflow: "hidden", borderRadius: 1 }}>
                    {/* Plus-value — top (GOLD) */}
                    <View style={{ flex: b.pvFlex, backgroundColor: GOLD }} />
                    {/* Versements — middle (BROWN) */}
                    <View style={{ flex: b.versFlex, backgroundColor: BROWN }} />
                    {/* Gain fiscal — bottom (TAUPE) */}
                    <View style={{ flex: b.gainFlex, backgroundColor: TAUPE }} />
                  </View>
                </View>
              ))}
            </View>

            {/* X-axis year labels */}
            <View style={{ flexDirection: "row", marginTop: 3 }}>
              {bars.map((b, i) => (
                <View key={i} style={{ flex: 1, alignItems: "center" }}>
                  {showYrLabel(b) && (
                    <Text style={{ fontSize: 4.8, color: GREY, textAlign: "center" }}>
                      {b.annee}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Legend */}
            <View style={{ flexDirection: "row", gap: 14, marginTop: 6 }}>
              {[
                { color: TAUPE, label: "Gain fiscal cumulé (État)" },
                { color: BROWN, label: "Versements totaux" },
                { color: GOLD,  label: "Plus-value (intérêts composés)" },
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 8, height: 8, backgroundColor: item.color, borderRadius: 1 }} />
                  <Text style={{ fontSize: 6.5, color: GREY }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── 5. POUR ALLER PLUS LOIN + CTA (2 colonnes) ─────────────────── */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* Pour aller plus loin */}
          <View style={{ flex: 1 }}>
            <Text style={s.secTitle}>Pour aller plus loin</Text>
            <View style={s.secLine} />
            {[
              "La fiscalité à la sortie (rente vs capital)",
              "Les conditions de déblocage anticipé",
              "Quel PER — Generali, Abeille, Garance, Swiss Life",
              "Optimisation avec assurance-vie, FCPI…",
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 4, marginBottom: 5 }}>
                <Text style={{ fontSize: 7.5, color: GOLD }}>{"→"}</Text>
                <Text style={{ fontSize: 7.5, color: DARK, flex: 1 }}>{item}</Text>
              </View>
            ))}
          </View>

          {/* CTA box */}
          <View style={{
            flex: 1,
            backgroundColor: WHITE,
            borderWidth: 0.75,
            borderColor: GOLD,
            borderRadius: 14,
            padding: 12,
            justifyContent: "center",
          }}>
            <Text style={{
              fontFamily: "Times-Bold",
              fontSize: 13,
              color: DARK,
              textAlign: "center",
              marginBottom: 8,
            }}>
              Vous avez des questions ?
            </Text>
            {[
              "Quelle fiscalité à la sortie ?",
              "Quel PER pour votre profil ?",
              "Peut-on faire mieux ?",
            ].map((q, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                <Text style={{ fontSize: 7.5, color: GOLD }}>{"·"}</Text>
                <Text style={{ fontSize: 7.5, color: DARK }}>{q}</Text>
              </View>
            ))}
            <Link src={CALENDLY} style={{ alignSelf: "center", marginTop: 8, textDecoration: "none" }}>
              <View style={{
                backgroundColor: GOLD,
                borderRadius: 50,
                paddingVertical: 8,
                paddingHorizontal: 14,
              }}>
                <Text style={{
                  fontSize: 8.5,
                  fontFamily: "Helvetica-Bold",
                  color: WHITE,
                  textAlign: "center",
                  letterSpacing: 0.5,
                }}>
                  ENTRETIEN GRATUIT  →
                </Text>
              </View>
            </Link>
            <Text style={{ fontSize: 6.5, color: GREY, textAlign: "center", marginTop: 5 }}>
              Sans engagement · 30 min · Conseil indépendant
            </Text>
          </View>
        </View>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <Text style={s.footer}>
          Cervus Patrimoine — ORIAS n° 25006770 — Simulation indicative, non contractuelle
        </Text>

      </Page>
    </Document>
  );
}
