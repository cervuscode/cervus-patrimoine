import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import type { AVComputed } from "@/lib/av-engine";

// ── Design tokens (charte Cervus) ──────────────────────────────────────────────
const CREAM  = "#F2EDE8";
const WHITE  = "#ffffff";
const GOLD   = "#795D48";
const BROWN  = "#5D4738";
const DARK   = "#1C1C1C";
const GREY   = "#888888";
const SOFT   = "#D4C9BE";

const LOGO_PATH    = process.cwd() + "/public/cervus_logo.png";
// URL absolue de prise de rendez-vous (le PDF est consulté hors site).
const RESERVER_URL = "https://cervuspatrimoine.fr/reserver";

// ── Number formatting ─────────────────────────────────────────────────────────
// toLocaleString("fr-FR") uses   as thousands sep → renders as "/" in PDF fonts.
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
  return fmtNum(n) + " €";
}
function fmtK(n: number): string {
  if (Math.abs(n) >= 10000) return Math.round(n / 1000) + " k€";
  return fmtNum(n) + " €";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const PROFIL_LABELS: Record<string, string> = {
  prudent:     "Prudent",
  equilibre:   "Équilibré",
  responsable: "Responsable",
  dynamique:   "Dynamique",
};

function situationLabel(marie: boolean | null): string {
  return marie ? "Marié(e) / pacsé(e)" : "Seul(e)";
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

// ── Props ─────────────────────────────────────────────────────────────────────
// On reçoit les mêmes données que les routes AV (sous-ensemble d'AVFormData) + le
// résultat du moteur (AVComputed). On NE touche pas au moteur.
interface AVPdfData {
  prenom: string;
  nom: string;
  versementInitial: string;
  versementMensuel: string;
  dureeAnnees: number;
  profil: string;
  marie: boolean | null;
}

interface Props {
  data: AVPdfData;
  computed: AVComputed;
}

export default function PdfDocumentAV({ data, computed }: Props) {
  const vMens = parseFloat(data.versementMensuel) || 0;
  const vInit = parseFloat(data.versementInitial) || 0;

  const horizon  = data.dureeAnnees;
  const profil   = PROFIL_LABELS[data.profil] ?? data.profil;
  const situation = situationLabel(data.marie);

  const brut     = computed.capitalFinalBrut;
  const netSans  = computed.capitalNetSansCervus;
  const netAvec  = computed.capitalNetAvecCervus;
  const gainNet  = computed.gainNetCervus;
  // purgeUtile = la stratégie d'optimisation est pertinente (gain net significatif).
  // false → scénario unique, jamais d'opposition "avec Cervus" trompeuse.
  const optimisationUtile = computed.purgeUtile;

  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  // ── Graphique annuel (valeur nette) ─────────────────────────────────────────
  const canProject = horizon > 0 && computed.courbe.length > 0;
  const BAR_H = 88;

  type Bar = {
    annee: number;
    sans: number;
    surplus: number; // part "avec Cervus" au-delà du scénario sans (≥ 0)
    total: number;
    barH: number;
    sansFlex: number;
    surplusFlex: number;
  };

  const bars: Bar[] = (() => {
    if (!canProject) return [];
    const raw = computed.courbe.map((pt) => {
      const sans    = Math.max(0, pt.capitalSans);
      const avec    = Math.max(sans, pt.capitalAvec); // avec ≥ sans (valeur nette)
      const surplus = Math.max(0, avec - sans);
      return { annee: pt.annee, sans, surplus, total: avec };
    });
    const maxTotal = Math.max(...raw.map(d => d.total), 1);
    return raw.map(d => {
      const barH = Math.max((d.total / maxTotal) * BAR_H, 1);
      const tot  = Math.max(d.total, 1);
      return {
        ...d,
        barH,
        sansFlex:    Math.max(d.sans    / tot, 0.001),
        surplusFlex: Math.max(d.surplus / tot, 0.001),
      };
    });
  })();

  const showYrLabel = (b: Bar, i: number) =>
    i === 0 || (i + 1) % 5 === 0 || i === bars.length - 1;

  // ── Cartes capital ──────────────────────────────────────────────────────────
  // En mode optimisation : capital brut / net sans / net avec / gain net.
  // Sinon : scénario unique (capital brut / net) sans opposition trompeuse.
  const capitalCards = optimisationUtile
    ? [
        { label: "Capital au terme",        avant: null,         apres: fmtK(brut),    sub: "valeur brute" },
        { label: "Net sans optimisation",   avant: null,         apres: fmtK(netSans), sub: "après fiscalité" },
        { label: "Net avec Cervus",         avant: fmtK(netSans), apres: fmtK(netAvec), sub: "après fiscalité" },
        { label: "Gain net Cervus",         avant: null,         apres: fmt(gainNet),  sub: "vs sans optimisation" },
      ]
    : [
        { label: "Capital au terme", avant: null, apres: fmtK(brut),    sub: "valeur brute" },
        { label: "Capital net",      avant: null, apres: fmtK(netSans), sub: "après fiscalité" },
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
                Simulation Assurance-vie
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
          {/* Versements */}
          <View style={[s.card, { flex: 2 }]}>
            <Text style={s.cardLbl}>Versements</Text>
            <Text style={s.cardVal}>
              {fmt(vInit)}
              <Text style={{ color: GREY }}> + {fmt(vMens)}/mois</Text>
            </Text>
            <Text style={s.cardSub}>{profil} · {situation}</Text>
          </View>
          {/* Horizon */}
          <View style={[s.card, { flex: 1, alignItems: "center", justifyContent: "center" }]}>
            <Text style={[s.cardLbl, { textAlign: "center" }]}>Horizon</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 22, color: GOLD, textAlign: "center" }}>
              {horizon}
            </Text>
            <Text style={[s.cardSub, { textAlign: "center" }]}>ans</Text>
          </View>
          {/* Capital net (chiffre clé) */}
          <View style={[s.card, { flex: 1.6 }]}>
            <Text style={s.cardLbl}>Capital net</Text>
            <Text style={s.cardAcc}>{fmtK(optimisationUtile ? netAvec : netSans)}</Text>
            <Text style={s.cardSub}>{"dans " + horizon + " ans"}</Text>
          </View>
          {/* Gain net OU capital brut selon pertinence */}
          <View style={[s.card, { flex: 1.6 }]}>
            <Text style={s.cardLbl}>{optimisationUtile ? "Gain net Cervus" : "Capital au terme"}</Text>
            <Text style={s.cardAcc}>{optimisationUtile ? fmt(gainNet) : fmtK(brut)}</Text>
            <Text style={s.cardSub}>{optimisationUtile ? "vs sans optimisation" : "valeur brute"}</Text>
          </View>
        </View>

        {/* ── 3. CARTES CAPITAL ───────────────────────────────────────────── */}
        <View style={{ marginBottom: 12 }}>
          <Text style={s.secTitle}>
            {optimisationUtile
              ? "Votre capital, optimisé avec Cervus Patrimoine"
              : "Votre capital au terme"}
          </Text>
          <View style={s.secLine} />
          <View style={{ flexDirection: "row", gap: 6 }}>
            {capitalCards.map((card, i) => (
              <View key={i} style={{
                flex: 1,
                backgroundColor: WHITE,
                borderRadius: 12,
                padding: 10,
                borderWidth: 0.75,
                borderColor: "#EDE7E1",
              }}>
                <Text style={{ fontSize: 6, color: GREY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                  {card.label}
                </Text>
                {card.avant !== null && (
                  <Text style={{ fontSize: 7.5, color: "#C4B8B0", textDecoration: "line-through", marginBottom: 3 }}>
                    {card.avant}
                  </Text>
                )}
                <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: GOLD }}>
                  {card.apres}
                </Text>
                {card.sub && (
                  <Text style={{ fontSize: 6, color: GREY, marginTop: 2 }}>{card.sub}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ── 4. GRAPHIQUE ANNUEL (valeur nette) ──────────────────────────── */}
        {canProject && (
          <View style={{ marginBottom: 10 }}>
            <Text style={s.secTitle}>
              {"Projection d'épargne — " + horizon + " ans · " + profil}
            </Text>
            <View style={s.secLine} />

            {/* Valeur au-dessus de la dernière barre */}
            <View style={{ flexDirection: "row", height: 11, marginBottom: 2 }}>
              {bars.map((b, i) => (
                <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
                  {i === bars.length - 1 && (
                    <Text style={{ fontSize: 5.5, color: GOLD, fontFamily: "Helvetica-Bold" }}>
                      {fmtK(b.total)}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Barres empilées : base (sans) + surplus avec Cervus */}
            <View style={{ flexDirection: "row", alignItems: "flex-end", height: BAR_H }}>
              {bars.map((b, i) => (
                <View key={i} style={{ flex: 1, height: BAR_H, alignItems: "center", justifyContent: "flex-end" }}>
                  <View style={{ width: "58%", height: b.barH, flexDirection: "column", overflow: "hidden", borderRadius: 1 }}>
                    {/* Surplus "avec Cervus" — haut (GOLD) */}
                    {optimisationUtile && (
                      <View style={{ flex: b.surplusFlex, backgroundColor: GOLD }} />
                    )}
                    {/* Capital net — bas (BROWN) */}
                    <View style={{ flex: b.sansFlex, backgroundColor: BROWN }} />
                  </View>
                </View>
              ))}
            </View>

            {/* Années (axe X) */}
            <View style={{ flexDirection: "row", marginTop: 3 }}>
              {bars.map((b, i) => (
                <View key={i} style={{ flex: 1, alignItems: "center" }}>
                  {showYrLabel(b, i) && (
                    <Text style={{ fontSize: 4.8, color: GREY, textAlign: "center" }}>
                      {b.annee}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Légende */}
            <View style={{ flexDirection: "row", gap: 14, marginTop: 6 }}>
              {(optimisationUtile
                ? [
                    { color: BROWN, label: "Capital net (sans optimisation)" },
                    { color: GOLD,  label: "Gain net avec Cervus Patrimoine" },
                  ]
                : [{ color: BROWN, label: "Capital net projeté" }]
              ).map((item, i) => (
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
              "Le choix du contrat et des supports (fonds €/UC)",
              "La fiscalité des rachats et l'abattement après 8 ans",
              "La clause bénéficiaire et la transmission",
              "L'articulation avec un PER, des SCPI…",
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
              "Quel contrat pour votre profil ?",
              "Comment optimiser la fiscalité ?",
              "Peut-on faire mieux ?",
            ].map((q, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                <Text style={{ fontSize: 7.5, color: GOLD }}>{"·"}</Text>
                <Text style={{ fontSize: 7.5, color: DARK }}>{q}</Text>
              </View>
            ))}
            <Link src={RESERVER_URL} style={{ alignSelf: "center", marginTop: 8, textDecoration: "none" }}>
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
          Cervus Patrimoine — ORIAS n° 25006770 — Simulation indicative, non
          contractuelle. Les performances passées ne préjugent pas des
          performances futures.
        </Text>

      </Page>
    </Document>
  );
}
