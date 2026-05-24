import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { SimulateurData, ComputedResults, PROFIL_TAUX } from "@/app/simulateur-per/types";
import { impotReel, projectionPER } from "@/lib/fiscal-engine";

// ── Constantes design ────────────────────────────────────────────────────────
const GOLD      = "#795D48";
const BROWN     = "#5D4738";
const DARK      = "#0f0f0f";
const CREAM     = "#F2EDE8";
const GREY      = "#888888";
const GREY_LIGHT = "#bbbbbb";
const WHITE     = "#ffffff";
const CREAM_ROW = "#faf7f5";

const LOGO_PATH = process.cwd() + "/public/cervus_logo.png";
const CALENDLY  = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "cervuspatrimoine.fr/rendez-vous";

// ── Utilitaires ──────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return Math.round(n).toLocaleString("fr-FR") + "\u00a0€";
}
function fmtK(n: number): string {
  if (n >= 10000) return (n / 1000).toFixed(0) + "\u00a0k€";
  return Math.round(n).toLocaleString("fr-FR") + "\u00a0€";
}

const STATUT_LABELS: Record<string, string> = {
  celibataire: "Célibataire",
  divorce:     "Divorcé(e)",
  marie:       "Marié(e)",
  pacse:       "Pacsé(e)",
  parent_isole:"Parent isolé",
};
function displayStatut(data: SimulateurData): string {
  if (
    (data.statut === "celibataire" || data.statut === "divorce") &&
    data.nbEnfants > 0 &&
    data.gardeParentale === true
  ) return "Parent isolé";
  return STATUT_LABELS[data.statut] ?? data.statut;
}

// ── StyleSheet ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 34,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: DARK,
    backgroundColor: WHITE,
  },
  sectionLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  separator: { height: 0.75, backgroundColor: GOLD, marginBottom: 10 },
  card: {
    backgroundColor: CREAM,
    padding: 7,
    borderRadius: 2,
  },
  cardLabel: { fontSize: 6.5, color: GREY, marginBottom: 1 },
  cardValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK },
  cardSub: { fontSize: 7, color: GREY, marginTop: 1 },
  // Table
  tblHeader: {
    flexDirection: "row",
    backgroundColor: DARK,
  },
  tblRow: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: CREAM,
  },
  tblCell: {
    padding: 5,
    fontSize: 8,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 16,
    left: 34,
    right: 34,
    fontSize: 6.5,
    color: GOLD,
    textAlign: "center",
  },
});

// ── Composant principal ──────────────────────────────────────────────────────
interface Props {
  data: SimulateurData;
  computed: ComputedResults;
}

export default function PdfDocument({ data, computed }: Props) {
  const versementMensuel  = parseFloat(data.versementMensuel)  || 0;
  const versementInitial  = parseFloat(data.versementInitial)  || 0;
  const versementAnnuel   = computed.versementAnnuel;

  // ── Calculs fiscaux réels ────────────────────────────────────────────────
  const impotAvant   = Math.round(impotReel(computed.revenuImposable, computed.partsBase, computed.partsTotal));
  const revApres     = Math.max(0, computed.revenuImposable - versementAnnuel);
  const impotApres   = Math.round(impotReel(revApres, computed.partsBase, computed.partsTotal));
  const economieAnn  = impotAvant - impotApres;
  const coutReelMens = Math.max(0, Math.round(versementMensuel - economieAnn / 12));
  const pasMensAvant = Math.round(impotAvant / 12);
  const pasMensApres = Math.round(impotApres / 12);

  // ── Date ─────────────────────────────────────────────────────────────────
  const today   = new Date();
  const dateStr = today.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  // ── Projections 3 profils ─────────────────────────────────────────────────
  const PROFILES = ["prudent", "equilibre", "dynamique"] as const;
  const PROFIL_NAMES: Record<string, string> = {
    prudent:   "Prudent",
    equilibre: "Équilibré",
    dynamique: "Dynamique",
  };
  const versementsTotal  = versementMensuel * 12 * computed.nAnnees + versementInitial;
  const gainFiscalTotal  = economieAnn * computed.nAnnees;
  const canProject       = computed.nAnnees > 0 && versementMensuel > 0;

  const projData = PROFILES.map(p => {
    const { capitalFinal } = canProject
      ? projectionPER(versementMensuel, PROFIL_TAUX[p], computed.nAnnees, versementInitial)
      : { capitalFinal: 0 };
    const plusValue    = Math.max(0, capitalFinal - versementsTotal);
    const totalBarVal  = gainFiscalTotal + capitalFinal;
    return { profil: p, capitalFinal, plusValue, totalBarVal };
  });

  const BAR_MAX_H = 88;
  const maxBarVal = Math.max(...projData.map(p => p.totalBarVal), 1);

  const barData = projData.map(pd => {
    const barH  = (pd.totalBarVal / maxBarVal) * BAR_MAX_H;
    const total = Math.max(pd.totalBarVal, 1);
    return {
      ...pd,
      barH:   Math.max(barH, 1),
      gainH:  Math.max((gainFiscalTotal  / total) * barH, 0),
      versH:  Math.max((versementsTotal  / total) * barH, 0),
      pvH:    Math.max((pd.plusValue     / total) * barH, 0),
    };
  });

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── 1. EN-TÊTE ─────────────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Image src={LOGO_PATH} style={{ width: 44, height: 44 }} />
            <View>
              <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: DARK }}>
                Votre Simulation PER Personnalisée
              </Text>
              <Text style={{ fontSize: 8.5, color: GREY, marginTop: 2 }}>
                {data.prenom} {data.nom}{"  ·  "}{dateStr}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: GOLD }}>CERVUS PATRIMOINE</Text>
            <Text style={{ fontSize: 6.5, color: GREY_LIGHT, marginTop: 1 }}>Conseil indépendant</Text>
          </View>
        </View>

        <View style={s.separator} />

        {/* ── 2. VOTRE SITUATION ──────────────────────────────────────────── */}
        <View style={{ marginBottom: 9 }}>
          <Text style={s.sectionLabel}>Votre situation</Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {/* Famille */}
            <View style={[s.card, { flex: 2 }]}>
              <Text style={s.cardLabel}>Situation familiale</Text>
              <Text style={s.cardValue}>
                {displayStatut(data)}
                {data.nbEnfants > 0 ? `,  ${data.nbEnfants} enfant${data.nbEnfants > 1 ? "s" : ""}` : ""}
              </Text>
              <Text style={s.cardSub}>{computed.partsTotal} parts fiscales</Text>
            </View>
            {/* TMI */}
            <View style={[s.card, { flex: 1, alignItems: "center", justifyContent: "center" }]}>
              <Text style={[s.cardLabel, { textAlign: "center" }]}>TMI</Text>
              <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold", color: GOLD }}>{computed.tmi}%</Text>
            </View>
            {/* Revenu */}
            <View style={[s.card, { flex: 1.8 }]}>
              <Text style={s.cardLabel}>Revenu imposable</Text>
              <Text style={s.cardValue}>{fmt(computed.revenuImposable)}</Text>
              <Text style={s.cardSub}>Versement PER : {fmt(versementMensuel)}/mois</Text>
            </View>
            {/* Impôt actuel */}
            <View style={[s.card, { flex: 1.8 }]}>
              <Text style={s.cardLabel}>Impôt actuel</Text>
              <Text style={s.cardValue}>{fmt(impotAvant)}/an</Text>
              <Text style={s.cardSub}>Soit {fmt(pasMensAvant)}/mois (PAS)</Text>
            </View>
          </View>
        </View>

        {/* ── 3. IMPACT DES VERSEMENTS ────────────────────────────────────── */}
        <View style={{ marginBottom: 9 }}>
          <Text style={s.sectionLabel}>L'impact de vos versements PER</Text>

          {/* Table */}
          <View style={{ borderWidth: 0.5, borderColor: "#e0d8d0", borderRadius: 2, overflow: "hidden" }}>
            {/* Header */}
            <View style={s.tblHeader}>
              <View style={[s.tblCell, { flex: 2.2 }]}>
                <Text style={{ fontSize: 7.5, color: "#666666" }}> </Text>
              </View>
              <View style={[s.tblCell, { flex: 1.4, borderLeftWidth: 0.5, borderLeftColor: "#333" }]}>
                <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: WHITE, textAlign: "center" }}>
                  Avant PER
                </Text>
              </View>
              <View style={[s.tblCell, { flex: 1.4, borderLeftWidth: 0.5, borderLeftColor: "#333", backgroundColor: GOLD }]}>
                <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: WHITE, textAlign: "center" }}>
                  Après PER
                </Text>
              </View>
            </View>

            {/* Rows */}
            {[
              {
                label: "Impôt sur le revenu annuel",
                avant: fmt(impotAvant),
                apres: fmt(impotApres),
                highlight: false,
              },
              {
                label: "Prélèvement à la source mensuel",
                avant: fmt(pasMensAvant) + "/mois",
                apres: fmt(pasMensApres) + "/mois",
                highlight: false,
              },
              {
                label: "Économie fiscale annuelle",
                avant: "—",
                apres: fmt(economieAnn),
                highlight: true,
              },
              {
                label: `Coût réel du versement (${fmt(versementMensuel)}/mois)`,
                avant: fmt(versementMensuel),
                apres: fmt(coutReelMens),
                highlight: true,
              },
            ].map((row, i) => (
              <View
                key={i}
                style={[s.tblRow, { backgroundColor: i % 2 === 0 ? WHITE : CREAM_ROW }]}
              >
                <View style={[s.tblCell, { flex: 2.2 }]}>
                  <Text style={{ fontSize: 8, color: DARK }}>{row.label}</Text>
                </View>
                <View style={[s.tblCell, { flex: 1.4, borderLeftWidth: 0.5, borderLeftColor: CREAM }]}>
                  <Text style={{ fontSize: 8, color: GREY, textAlign: "center" }}>{row.avant}</Text>
                </View>
                <View style={[
                  s.tblCell,
                  { flex: 1.4, borderLeftWidth: 0.5, borderLeftColor: CREAM },
                  row.highlight ? { backgroundColor: "#fdf3ec" } : {},
                ]}>
                  <Text style={{
                    fontSize: 8,
                    textAlign: "center",
                    color: row.highlight ? GOLD : DARK,
                    fontFamily: row.highlight ? "Helvetica-Bold" : "Helvetica",
                  }}>
                    {row.apres}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── 4. GRAPHIQUE ────────────────────────────────────────────────── */}
        <View style={{ marginBottom: 9 }}>
          <Text style={s.sectionLabel}>Projection selon votre profil d'investisseur</Text>
          <Text style={{ fontSize: 7.5, color: GREY, marginBottom: 7 }}>
            {computed.nAnnees} ans · {fmt(versementMensuel)}/mois
            {versementInitial > 0 ? "  ·  Apport initial\u00a0: " + fmt(versementInitial) : ""}
            {"  ·  Profil sélectionné en surbrillance"}
          </Text>

          {/* Chart: value labels row */}
          <View style={{ flexDirection: "row", gap: 14, paddingHorizontal: 2, marginBottom: 2 }}>
            {barData.map(bd => {
              const isSelected = data.profil === bd.profil;
              return (
                <View key={bd.profil} style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{
                    fontSize: 7.5,
                    fontFamily: isSelected ? "Helvetica-Bold" : "Helvetica",
                    color: isSelected ? GOLD : GREY,
                    textAlign: "center",
                  }}>
                    {fmtK(bd.capitalFinal + gainFiscalTotal)}
                  </Text>
                  <Text style={{ fontSize: 6, color: GREY_LIGHT, textAlign: "center" }}>
                    (capital + gain fiscal)
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Bar chart */}
          <View style={{ flexDirection: "row", alignItems: "flex-end", height: BAR_MAX_H, gap: 14, paddingHorizontal: 2 }}>
            {barData.map(bd => {
              const isSelected = data.profil === bd.profil;
              return (
                <View
                  key={bd.profil}
                  style={{
                    flex: 1,
                    height: bd.barH,
                    borderWidth: isSelected ? 1.5 : 0,
                    borderColor: GOLD,
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  {/* Plus-value — top */}
                  {bd.pvH > 0.5 && (
                    <View style={{ flex: bd.pvH, backgroundColor: GOLD }} />
                  )}
                  {/* Versements — middle */}
                  {bd.versH > 0.5 && (
                    <View style={{ flex: bd.versH, backgroundColor: BROWN }} />
                  )}
                  {/* Gain fiscal — bottom */}
                  {bd.gainH > 0.5 && (
                    <View style={{ flex: bd.gainH, backgroundColor: CREAM }} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Profile name labels */}
          <View style={{ flexDirection: "row", gap: 14, paddingHorizontal: 2, marginTop: 4 }}>
            {barData.map(bd => {
              const isSelected = data.profil === bd.profil;
              return (
                <View key={bd.profil} style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{
                    fontSize: 7.5,
                    fontFamily: isSelected ? "Helvetica-Bold" : "Helvetica",
                    color: isSelected ? GOLD : GREY,
                    textAlign: "center",
                  }}>
                    {PROFIL_NAMES[bd.profil]}
                  </Text>
                  <Text style={{ fontSize: 6.5, color: GREY_LIGHT, textAlign: "center" }}>
                    {(PROFIL_TAUX[bd.profil] * 100).toFixed(0)}%/an
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Légende */}
          <View style={{ flexDirection: "row", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
            {[
              { color: CREAM, border: true,  label: "L'État contribue (gain fiscal cumulé)" },
              { color: BROWN, border: false, label: "Votre effort (versements totaux)" },
              { color: GOLD,  border: false, label: "Intérêts composés (plus-value)" },
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={{
                  width: 8,
                  height: 8,
                  backgroundColor: item.color,
                  borderWidth: item.border ? 0.75 : 0,
                  borderColor: GOLD,
                }} />
                <Text style={{ fontSize: 6.5, color: GREY }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 5. POUR ALLER PLUS LOIN ─────────────────────────────────────── */}
        <View style={{ marginBottom: 9 }}>
          <Text style={s.sectionLabel}>Pour aller plus loin</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
            {[
              "La fiscalité à la sortie (rente vs capital)",
              "Les conditions de déblocage anticipé",
              "Quel PER choisir parmi Generali, Abeille, Garance, Swiss Life selon votre profil",
              "L'optimisation avec d'autres enveloppes (assurance-vie, FCPI…)",
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 4, width: "48%" }}>
                <Text style={{ fontSize: 8, color: GOLD }}>→</Text>
                <Text style={{ fontSize: 8, color: DARK, flex: 1 }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 6. CTA ──────────────────────────────────────────────────────── */}
        <View style={{
          borderWidth: 1,
          borderColor: GOLD,
          borderRadius: 4,
          padding: 14,
          backgroundColor: "#fdf9f6",
        }}>
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "center", marginBottom: 8 }}>
            Vous avez des questions sur votre simulation ?
          </Text>
          <View style={{ flexDirection: "row", gap: 0, marginBottom: 10, justifyContent: "center" }}>
            {[
              "Quelle fiscalité à la sortie ?",
              "Quel PER pour votre profil ?",
              "Peut-on faire mieux ?",
            ].map((q, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 3, marginHorizontal: 12 }}>
                <Text style={{ fontSize: 8, color: GOLD }}>•</Text>
                <Text style={{ fontSize: 8, color: DARK }}>{q}</Text>
              </View>
            ))}
          </View>

          {/* Bouton CTA */}
          <View style={{
            backgroundColor: GOLD,
            borderRadius: 50,
            paddingVertical: 9,
            paddingHorizontal: 28,
            alignSelf: "center",
            marginBottom: 8,
          }}>
            <Text style={{
              fontSize: 9.5,
              fontFamily: "Helvetica-Bold",
              color: WHITE,
              textAlign: "center",
              letterSpacing: 0.5,
            }}>
              RÉSERVER MON ENTRETIEN GRATUIT  →
            </Text>
          </View>

          <Text style={{ fontSize: 7.5, color: GREY, textAlign: "center", marginBottom: 2 }}>
            Sans engagement · 30 minutes · Gratuit
          </Text>
          <Text style={{ fontSize: 7.5, color: GREY, textAlign: "center" }}>
            Conseil indépendant — accès à Generali, Abeille, Garance, Swiss Life
          </Text>
          <Text style={{ fontSize: 7, color: GREY_LIGHT, textAlign: "center", marginTop: 4 }}>
            {CALENDLY}
          </Text>
        </View>

        {/* ── 7. PIED DE PAGE ─────────────────────────────────────────────── */}
        <Text style={s.footer}>
          Cervus Patrimoine — ORIAS n° 25006770 — Simulation indicative, non contractuelle
        </Text>

      </Page>
    </Document>
  );
}
